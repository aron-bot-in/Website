import { isPermissionError, readFirst, readValue, subscribeFirst, subscribeValue, updateValue } from "./firebase.js";

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

function buildWishlistCounts(users, cards = null) {
  const validCardIds = cards ? new Set(Object.keys(normalizeCollection(cards))) : null;
  const counts = {};

  for (const user of Object.values(normalizeCollection(users))) {
    const uniqueWishlist = new Set(Array.isArray(user?.wishlist) ? user.wishlist.map(String) : []);
    for (const cardId of uniqueWishlist) {
      if (!cardId) continue;
      if (validCardIds && !validCardIds.has(cardId)) continue;
      counts[cardId] = Number(counts[cardId] || 0) + 1;
    }
  }

  return counts;
}

function sanitizePublicUser(user, id) {
  const wishlistIsPrivate = Boolean(user?.privacy?.wishlist);
  const inventoryIsPrivate = Boolean(user?.privacy?.inventory);
  return {
    id: String(user?.id || id || ""),
    username: user?.username || "Unknown User",
    avatar: user?.avatar || "",
    guildId: user?.guildId || "",
    inventory: inventoryIsPrivate || !Array.isArray(user?.inventory) ? [] : user.inventory,
    wishlist: wishlistIsPrivate || !Array.isArray(user?.wishlist) ? [] : user.wishlist,
    wallet: user?.wallet && !user?.privacy?.wallet ? user.wallet : {},
    lastDropAt: Number(user?.lastDropAt || 0),
    lastClaimAt: Number(user?.lastClaimAt || 0),
    cooldownReminders: user?.cooldownReminders || {},
    questState: user?.questState || {},
    stats: {
      ...(user?.stats && typeof user.stats === "object" && !Array.isArray(user.stats) ? user.stats : {}),
      questPoints: Number(user?.stats?.questPoints || 0),
      cardsClaimed: Number(user?.stats?.cardsClaimed || 0),
      cardsDropped: Number(user?.stats?.cardsDropped || 0)
    }
  };
}

function sanitizePublicUsers(users) {
  return Object.fromEntries(
    Object.entries(normalizeCollection(users)).map(([id, user]) => [id, sanitizePublicUser(user, id)])
  );
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
  const [users, cards] = await Promise.all([
    readCollection("users", 500),
    readCollection("cards", 500)
  ]);
  const counts = buildWishlistCounts(users, cards);
  if (Object.keys(counts).length > 0) return counts;

  const publicCounts = buildWishlistCounts(await readPublicUsers(500), cards);
  if (Object.keys(publicCounts).length > 0) return publicCounts;

  const snapshotCounts = normalizeCollection(await readSnapshotValue("wishlistLeaderboard", {}));
  return snapshotCounts;
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

async function readPublicUsers(limit = 500) {
  const publicUsers = await readCollection("publicUsers", limit);
  if (Object.keys(publicUsers).length > 0) return publicUsers;
  return sanitizePublicUsers(await readCollection("users", limit));
}

async function readPublicUser(discordId) {
  const publicUser = await readLiveOrSnapshot(`publicUsers/${discordId}`, undefined);
  if (publicUser) return sanitizePublicUser(publicUser, discordId);
  const user = await readLiveOrSnapshot(`users/${discordId}`, null);
  return user ? sanitizePublicUser(user, discordId) : null;
}

export async function getSiteStats() {
  return cached("siteStats", async () => {
    const snapshotStats = await readSnapshotValue("stats", null);
    if (snapshotStats && Object.values(snapshotStats).some((value) => Number(value) > 0)) {
      return { ...EMPTY_STATS, ...snapshotStats };
    }

    const [users, cards, guilds] = await Promise.all([
      readPublicUsers(500),
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

function cardDate(card) {
  const value = Date.parse(card?.updatedAt || card?.createdAt || "");
  return Number.isFinite(value) ? value : 0;
}

function decorateCards(cards, wishlistLeaderboard = {}) {
  return Object.values(normalizeCollection(cards))
    .filter((card) => card && card.active !== false)
    .map((card) => ({
      card,
      count: Number(wishlistLeaderboard?.[card.id] || 0),
      createdAt: cardDate(card)
    }));
}

function pickUnique(entries, limit, seen = new Set()) {
  const picked = [];
  for (const entry of entries) {
    const id = String(entry?.card?.id || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    picked.push(entry);
    if (picked.length >= limit) break;
  }
  return picked;
}

export async function getCardShowcase(limit = 6) {
  return cached(`cardShowcase:${limit}`, async () => {
    const [cards, wishlistLeaderboard] = await Promise.all([
      readCollection("cards", 500),
      getWishlistLeaderboardCounts()
    ]);
    const entries = decorateCards(cards, wishlistLeaderboard);
    const seen = new Set();
    const topWishlisted = pickUnique([...entries].sort((left, right) => right.count - left.count || String(left.card.name || "").localeCompare(String(right.card.name || ""))), limit, seen);
    const rareFinds = pickUnique([...entries].sort((left, right) => {
      const styleRank = { gold: 3, violet: 2, azure: 1 };
      return (styleRank[right.card?.style] || 0) - (styleRank[left.card?.style] || 0) || right.count - left.count;
    }), limit, new Set());
    const recentlyAdded = pickUnique([...entries].sort((left, right) => right.createdAt - left.createdAt), limit, new Set());
    const featured = pickUnique([...topWishlisted, ...rareFinds, ...recentlyAdded, ...entries], limit, new Set());
    return { featured, topWishlisted, rareFinds, recentlyAdded };
  }, 45_000);
}

export async function getDashboard(discordId) {
  if (!discordId) return null;
  return cached(`dashboard:${discordId}`, async () => {
    const [user, cards, guilds, wishlistLeaderboard] = await Promise.all([
      readPublicUser(discordId),
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

function subscribeCollection(path, limit, onNext) {
  getSnapshot()
    .then((snapshot) => {
      const collection = normalizeCollection(getSnapshotPath(snapshot, path));
      if (Object.keys(collection).length) onNext(Object.fromEntries(Object.entries(collection).slice(0, limit)));
    })
    .catch(() => {});

  return subscribeFirst(path, limit, (value) => {
    const collection = normalizeCollection(value);
    if (Object.keys(collection).length) onNext(collection);
  }, (error) => console.warn(`[Website data] Firebase collection listener failed for ${path}:`, error));
}

export function subscribeCardsPage(limit = 60, onNext) {
  return subscribeCollection("cards", limit, onNext);
}

export function subscribeGuildsPage(limit = 50, onNext) {
  return subscribeCollection("guilds", limit, onNext);
}

export function subscribeWishlistLeaderboardCounts(onNext) {
  getWishlistLeaderboardCounts().then(onNext).catch(() => {});

  let users = {};
  let publicUsers = {};
  let cards = {};

  const emit = () => {
    const sourceUsers = Object.keys(normalizeCollection(users)).length > 0
      ? sanitizePublicUsers(users)
      : publicUsers;
    onNext(buildWishlistCounts(sourceUsers, cards));
  };

  const unsubscribers = [
    subscribeFirst("publicUsers", 500, (value) => {
      const collection = normalizeCollection(value);
      if (Object.keys(collection).length > 0) {
        publicUsers = collection;
        emit();
      }
    }, (error) => console.warn("[Website data] Public wishlist listener failed:", error)),
    subscribeFirst("users", 500, (value) => {
      users = normalizeCollection(value);
      emit();
    }, (error) => console.warn("[Website data] Wishlist users listener failed:", error)),
    subscribeFirst("cards", 500, (value) => {
      cards = normalizeCollection(value);
      emit();
    }, (error) => console.warn("[Website data] Wishlist cards listener failed:", error))
  ];

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
}

export function subscribeSiteStats(onNext) {
  let users = {};
  let cards = {};
  let guilds = {};
  let codes = {};
  let usingPublicUsers = false;

  const emit = () => onNext({
    players: Object.keys(normalizeCollection(users)).length,
    cards: Object.keys(normalizeCollection(cards)).length,
    copies: Object.keys(normalizeCollection(codes)).length,
    guilds: Object.keys(normalizeCollection(guilds)).length
  });

  getSiteStats().then(onNext).catch(() => {});

  const unsubscribers = [
    subscribeFirst("publicUsers", 500, (value) => {
      const collection = normalizeCollection(value);
      if (Object.keys(collection).length > 0) {
        usingPublicUsers = true;
        users = collection;
        emit();
      }
    }, (error) => console.warn("[Website data] Public users listener failed:", error)),
    subscribeFirst("users", 500, (value) => {
      if (usingPublicUsers) return;
      users = sanitizePublicUsers(value);
      emit();
    }, (error) => console.warn("[Website data] Users listener failed:", error)),
    subscribeFirst("cards", 500, (value) => {
      cards = normalizeCollection(value);
      emit();
    }, (error) => console.warn("[Website data] Cards listener failed:", error)),
    subscribeFirst("guilds", 500, (value) => {
      guilds = normalizeCollection(value);
      emit();
    }, (error) => console.warn("[Website data] Guilds listener failed:", error)),
    subscribeFirst("codes", 1000, (value) => {
      codes = normalizeCollection(value);
      emit();
    }, (error) => console.warn("[Website data] Codes listener failed:", error))
  ];

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
}

export function subscribeDashboard(discordId, onNext) {
  if (!discordId) return () => {};
  getDashboard(discordId).then(onNext).catch(() => {});

  let user = null;
  let publicUser = null;
  let cards = {};
  let guilds = {};
  let wishlistLeaderboard = {};

  const emit = () => {
    const resolvedUser = publicUser || (user ? sanitizePublicUser(user, discordId) : null);
    const guild = resolvedUser?.guildId ? guilds?.[resolvedUser.guildId] : null;
    onNext({ user: resolvedUser, cards: normalizeCollection(cards), guild, wishlistLeaderboard });
  };

  const unsubscribers = [
    subscribeValue(`publicUsers/${discordId}`, (value) => {
      publicUser = value ? sanitizePublicUser(value, discordId) : null;
      emit();
    }, (error) => console.warn("[Website data] Public user listener failed:", error), null),
    subscribeValue(`users/${discordId}`, (value) => {
      user = value || null;
      emit();
    }, (error) => console.warn("[Website data] User listener failed:", error), null),
    subscribeFirst("cards", 200, (value) => {
      cards = normalizeCollection(value);
      emit();
    }, (error) => console.warn("[Website data] Cards listener failed:", error)),
    subscribeFirst("guilds", 100, (value) => {
      guilds = normalizeCollection(value);
      emit();
    }, (error) => console.warn("[Website data] Guilds listener failed:", error)),
    subscribeWishlistLeaderboardCounts((value) => {
      wishlistLeaderboard = normalizeCollection(value);
      emit();
    })
  ];

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
}

export function subscribeTopWishlistedCards(limit = 3, onNext) {
  getTopWishlistedCards(limit).then(onNext).catch(() => {});

  let cards = {};
  let wishlistLeaderboard = {};
  const emit = () => {
    const entries = Object.entries(normalizeCollection(wishlistLeaderboard))
      .map(([cardId, count]) => ({ cardId: String(cardId), count: Number(count || 0), card: cards?.[cardId] }))
      .filter((entry) => entry.card && entry.count > 0)
      .sort((left, right) => right.count - left.count || String(left.card?.name || "").localeCompare(String(right.card?.name || "")))
      .slice(0, limit);
    onNext(entries);
  };

  const unsubscribers = [
    subscribeFirst("cards", 500, (value) => {
      cards = normalizeCollection(value);
      emit();
    }, (error) => console.warn("[Website data] Cards listener failed:", error)),
    subscribeWishlistLeaderboardCounts((value) => {
      wishlistLeaderboard = normalizeCollection(value);
      emit();
    })
  ];

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
}

export function subscribeCardShowcase(limit = 6, onNext) {
  getCardShowcase(limit).then(onNext).catch(() => {});

  let cards = {};
  let wishlistLeaderboard = {};
  const emit = () => {
    const entries = decorateCards(cards, wishlistLeaderboard);
    const topWishlisted = pickUnique([...entries].sort((left, right) => right.count - left.count || String(left.card.name || "").localeCompare(String(right.card.name || ""))), limit, new Set());
    const rareFinds = pickUnique([...entries].sort((left, right) => {
      const styleRank = { gold: 3, violet: 2, azure: 1 };
      return (styleRank[right.card?.style] || 0) - (styleRank[left.card?.style] || 0) || right.count - left.count;
    }), limit, new Set());
    const recentlyAdded = pickUnique([...entries].sort((left, right) => right.createdAt - left.createdAt), limit, new Set());
    const featured = pickUnique([...topWishlisted, ...rareFinds, ...recentlyAdded, ...entries], limit, new Set());
    onNext({ featured, topWishlisted, rareFinds, recentlyAdded });
  };

  const unsubscribers = [
    subscribeFirst("cards", 500, (value) => {
      cards = normalizeCollection(value);
      emit();
    }, (error) => console.warn("[Website data] Cards listener failed:", error)),
    subscribeWishlistLeaderboardCounts((value) => {
      wishlistLeaderboard = normalizeCollection(value);
      emit();
    })
  ];

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
}

export function subscribeWishlistData(discordId, onNext) {
  if (!discordId) return () => {};
  getWishlistData(discordId).then(onNext).catch(() => {});

  return subscribeDashboard(discordId, (dashboard) => {
    const wishlistIds = Array.isArray(dashboard?.user?.wishlist) ? dashboard.user.wishlist : [];
    onNext({
      ...dashboard,
      wishlistCards: wishlistIds.map((cardId) => dashboard?.cards?.[cardId]).filter(Boolean),
      allCards: normalizeCollection(dashboard?.cards)
    });
  });
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
