import { isPermissionError, readFirst, readValue, updateValue } from "./firebase.js";

const CACHE_TTL = 60_000;
const cache = new Map();
const EMPTY_STATS = { players: 0, cards: 0, copies: 0, guilds: 0 };

async function cached(key, loader, ttl = CACHE_TTL) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < ttl) return entry.value;
  const value = await loader();
  cache.set(key, { value, at: Date.now() });
  return value;
}

export function normalizeCollection(value) {
  if (Array.isArray(value)) {
    return Object.fromEntries(
      value
        .map((entry, index) => [String(index), entry])
        .filter(([, entry]) => entry != null)
    );
  }
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function snapshotUrl() {
  const base = String(import.meta.env.BASE_URL || "/");
  return `${base.endsWith("/") ? base : `${base}/`}data/snapshot.json`;
}

async function getSnapshot() {
  return cached("websiteSnapshot", async () => {
    const response = await fetch(snapshotUrl(), { cache: "no-store" });
    if (!response.ok) throw new Error(`Website data snapshot failed to load (${response.status}).`);
    return response.json();
  }, 15_000);
}

function getSnapshotPath(snapshot, path) {
  return String(path || "")
    .split("/")
    .filter(Boolean)
    .reduce((value, segment) => value?.[segment], snapshot);
}

async function readSnapshotValue(path, fallback = null) {
  try {
    const snapshot = await getSnapshot();
    const value = getSnapshotPath(snapshot, path);
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

async function readLiveOrSnapshot(path, fallback = null) {
  try {
    const value = await readValue(path, undefined);
    if (value !== undefined && value !== null) return value;
  } catch (error) {
    if (!isPermissionError(error)) {
      console.warn(`[Website data] Firebase read failed for ${path}:`, error);
    }
  }
  return readSnapshotValue(path, fallback);
}

export function clearDataCache(prefix = "") {
  if (!prefix) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (String(key).startsWith(prefix)) cache.delete(key);
  }
}

export async function getWishlistLeaderboardCounts() {
  const liveCache = await readLiveOrSnapshot("meta/wishlistLeaderboard", {});
  if (liveCache?.counts && typeof liveCache.counts === "object" && !Array.isArray(liveCache.counts)) {
    return liveCache.counts;
  }

  if (liveCache && typeof liveCache === "object" && !Array.isArray(liveCache) && Object.keys(liveCache).length > 0) {
    return liveCache;
  }

  const snapshotCounts = await readSnapshotValue("wishlistLeaderboard", {});
  return snapshotCounts && typeof snapshotCounts === "object" && !Array.isArray(snapshotCounts) ? snapshotCounts : {};
}

async function readCollection(path, limit = 100) {
  try {
    const value = await readFirst(path, limit);
    const collection = normalizeCollection(value);
    if (Object.keys(collection).length > 0) return collection;
  } catch (error) {
    if (!isPermissionError(error)) {
      console.warn(`[Website data] Firebase collection read failed for ${path}:`, error);
    }
  }

  const snapshotValue = await readSnapshotValue(path, {});
  const collection = normalizeCollection(snapshotValue);
  return Object.fromEntries(Object.entries(collection).slice(0, limit));
}

export async function getSiteStats() {
  return cached("siteStats", async () => {
    const snapshotStats = await readSnapshotValue("stats", null);
    if (snapshotStats && Object.values(snapshotStats).some((value) => Number(value) > 0)) {
      return { ...EMPTY_STATS, ...snapshotStats };
    }

    const [users, cards, guilds] = await Promise.all([
      readCollection("publicUsers", 500),
      readCollection("cards", 500),
      readCollection("guilds", 500)
    ]);
    return {
      players: Object.keys(normalizeCollection(users)).length,
      cards: Object.keys(normalizeCollection(cards)).length,
      copies: Number(snapshotStats?.copies || 0),
      guilds: Object.keys(normalizeCollection(guilds)).length
    };
  });
}

export async function getTopWishlistedCards(limit = 3) {
  return cached(`topWishlistedCards:${limit}`, async () => {
    const [cards, wishlistLeaderboard] = await Promise.all([
      readCollection("cards", 500),
      getWishlistLeaderboardCounts()
    ]);

    return Object.entries(normalizeCollection(wishlistLeaderboard))
      .map(([cardId, count]) => ({
        cardId: String(cardId),
        count: Number(count || 0),
        card: cards?.[cardId]
      }))
      .filter((entry) => entry.card && entry.count > 0)
      .sort((left, right) => right.count - left.count || String(left.card?.name || "").localeCompare(String(right.card?.name || "")))
      .slice(0, limit);
  }, 45_000);
}

export async function getDashboard(discordId) {
  if (!discordId) return null;
  return cached(`dashboard:${discordId}`, async () => {
    const [user, cards, guilds, wishlistLeaderboard] = await Promise.all([
      readLiveOrSnapshot(`publicUsers/${discordId}`),
      readCollection("cards", 200),
      readCollection("guilds", 100),
      getWishlistLeaderboardCounts()
    ]);
    const guild = user?.guildId ? guilds?.[user.guildId] : null;
    return { user, cards: normalizeCollection(cards), guild, wishlistLeaderboard: wishlistLeaderboard || {} };
  }, 20_000);
}

export async function getPublicProfile(discordId) {
  return getDashboard(discordId);
}

export async function getCardsPage(limit = 60) {
  return cached(`cards:${limit}`, () => readCollection("cards", limit), 45_000);
}

export async function getGuildsPage(limit = 50) {
  return cached(`guilds:${limit}`, () => readCollection("guilds", limit), 45_000);
}

export async function getWishlistData(discordId) {
  const [dashboard, allCards] = await Promise.all([getDashboard(discordId), getCardsPage(120)]);
  const wishlistIds = Array.isArray(dashboard?.user?.wishlist) ? dashboard.user.wishlist : [];
  return {
    ...dashboard,
    wishlistCards: wishlistIds.map((cardId) => allCards?.[cardId]).filter(Boolean),
    allCards: normalizeCollection(allCards)
  };
}

export async function syncWebUser(identity) {
  if (!identity.discordId) return null;
  const payload = {
    discordId: identity.discordId,
    username: identity.username,
    avatar: identity.avatar,
    lastLoginAt: Date.now(),
    provider: "discord-oauth2"
  };
  await updateValue(`webUsers/${identity.discordId}`, payload);
  return payload;
}
