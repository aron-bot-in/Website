import { isFirebaseConfigured, isPermissionError, readFirst, readValue, subscribeFirst, subscribeValue } from "./firebase.js";

const CACHE_TTL = 60_000;
const cache = new Map();
const warned = new Set();
const EMPTY_STATS = { players: 0, cards: 0, copies: 0, guilds: 0 };

export const dataStatuses = {
  loading: { source: "loading", label: "Loading live data" },
  live: { source: "live", label: "Live Firebase" },
  fallback: { source: "fallback", label: "Cached snapshot" },
  limited: { source: "limited", label: "Limited public data" },
  unavailable: { source: "unavailable", label: "Data unavailable" },
  error: { source: "error", label: "Live data unavailable" }
};

async function cached(key, loader, ttl = CACHE_TTL) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < ttl) return entry.value;
  const value = await loader();
  cache.set(key, { value, at: Date.now() });
  return value;
}

function warnOnce(key, message, error) {
  if (warned.has(key)) return;
  warned.add(key);
  if (isPermissionError(error)) return;
  const detail = error?.code || error?.message ? ` ${error.code || error.message}` : "";
  console.warn(`${message}${detail}`);
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

function firstCount(...values) {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
}

function hasEntries(value) {
  return Object.keys(normalizeCollection(value)).length > 0;
}

function buildWishlistCounts(publicUsers, cards = null) {
  const validCardIds = cards ? new Set(Object.keys(normalizeCollection(cards))) : null;
  const counts = {};

  for (const user of Object.values(normalizeCollection(publicUsers))) {
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

async function readSnapshotCollection(paths, limit = 100) {
  const candidates = Array.isArray(paths) ? paths : [paths];
  for (const path of candidates.filter(Boolean)) {
    const value = normalizeCollection(await readSnapshotValue(path, {}));
    if (hasEntries(value)) return Object.fromEntries(Object.entries(value).slice(0, limit));
  }
  return {};
}

async function readLiveOrSnapshot(path, fallback = null, snapshotPaths = [path]) {
  try {
    const value = await readValue(path, undefined);
    if (value !== undefined && value !== null) return value;
  } catch (error) {
    warnOnce(`read:${path}`, `[Website data] Firebase read failed for ${path}.`, error);
  }

  for (const snapshotPath of snapshotPaths.filter(Boolean)) {
    const value = await readSnapshotValue(snapshotPath, undefined);
    if (value !== undefined && value !== null) return value;
  }
  return fallback;
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

async function readCollection(path, limit = 100, snapshotPaths = [path]) {
  try {
    const value = await readFirst(path, limit);
    const collection = normalizeCollection(value);
    if (hasEntries(collection)) return collection;
  } catch (error) {
    warnOnce(`collection:${path}`, `[Website data] Firebase collection read failed for ${path}.`, error);
  }

  return readSnapshotCollection(snapshotPaths, limit);
}

async function readPublicUsers(limit = 500) {
  const publicUsers = await readCollection("publicUsers", limit, ["publicUsers", "users"]);
  return sanitizePublicUsers(publicUsers);
}

async function readPublicUser(discordId) {
  const publicUser = await readLiveOrSnapshot(`publicUsers/${discordId}`, undefined, [
    `publicUsers/${discordId}`,
    `users/${discordId}`
  ]);
  return publicUser ? sanitizePublicUser(publicUser, discordId) : null;
}

function statsFromMetadata(metadata = {}) {
  const source = metadata?.stats && typeof metadata.stats === "object" ? metadata.stats : metadata;
  return {
    players: firstCount(source.players, source.playerCount, source.publicUsers, source.publicUserCount, source.users, source.userCount),
    cards: firstCount(source.cards, source.cardTemplates, source.cardCount, source.totalCards),
    copies: firstCount(source.copies, source.copyCount, source.cardCopies, source.totalCopies, source.claimedCopies),
    guilds: firstCount(source.guilds, source.guildCount, source.servers, source.serverCount)
  };
}

async function readWishlistLeaderboardCountsWithSource() {
  if (isFirebaseConfigured) {
    try {
      const liveCounts = normalizeCollection(await readFirst("meta/wishlistLeaderboard", 500));
      if (hasEntries(liveCounts)) return { value: liveCounts, status: dataStatuses.live };
    } catch (error) {
      warnOnce("read:meta/wishlistLeaderboard", "[Website data] Firebase wishlist leaderboard read failed.", error);
    }
  }

  const snapshotCounts = normalizeCollection(await readSnapshotValue("wishlistLeaderboard", {}));
  if (hasEntries(snapshotCounts)) return { value: snapshotCounts, status: dataStatuses.fallback };

  const [publicUsers, cards] = await Promise.all([
    readPublicUsers(500),
    readCollection("cards", 500)
  ]);
  const publicCounts = buildWishlistCounts(publicUsers, cards);
  if (hasEntries(publicCounts)) {
    return { value: publicCounts, status: isFirebaseConfigured ? dataStatuses.limited : dataStatuses.fallback };
  }

  return { value: {}, status: isFirebaseConfigured ? dataStatuses.unavailable : dataStatuses.fallback };
}

export async function getWishlistLeaderboardCounts() {
  const result = await readWishlistLeaderboardCountsWithSource();
  return result.value;
}

export async function getSiteStats() {
  return cached("siteStats", async () => {
    const [metadata, users, cards, guilds, snapshotStats] = await Promise.all([
      readLiveOrSnapshot("metadata", {}),
      readPublicUsers(500),
      readCollection("cards", 500),
      readCollection("guilds", 500),
      readSnapshotValue("stats", {})
    ]);
    const metadataStats = statsFromMetadata(metadata);

    return {
      players: firstCount(metadataStats.players, snapshotStats?.players, Object.keys(normalizeCollection(users)).length),
      cards: firstCount(metadataStats.cards, Object.keys(normalizeCollection(cards)).length, snapshotStats?.cards),
      copies: firstCount(metadataStats.copies, snapshotStats?.copies),
      guilds: firstCount(metadataStats.guilds, Object.keys(normalizeCollection(guilds)).length, snapshotStats?.guilds)
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

function buildShowcase(cards, wishlistLeaderboard, limit) {
  const entries = decorateCards(cards, wishlistLeaderboard);
  const topWishlisted = pickUnique([...entries].sort((left, right) => right.count - left.count || String(left.card.name || "").localeCompare(String(right.card.name || ""))), limit, new Set());
  const rareFinds = pickUnique([...entries].sort((left, right) => {
    const styleRank = { gold: 3, violet: 2, azure: 1 };
    return (styleRank[right.card?.style] || 0) - (styleRank[left.card?.style] || 0) || right.count - left.count;
  }), limit, new Set());
  const recentlyAdded = pickUnique([...entries].sort((left, right) => right.createdAt - left.createdAt), limit, new Set());
  const featured = pickUnique([...topWishlisted, ...rareFinds, ...recentlyAdded, ...entries], limit, new Set());
  return { featured, topWishlisted, rareFinds, recentlyAdded };
}

export async function getCardShowcase(limit = 6) {
  return cached(`cardShowcase:${limit}`, async () => {
    const [cards, wishlistLeaderboard] = await Promise.all([
      readCollection("cards", 500),
      getWishlistLeaderboardCounts()
    ]);
    return buildShowcase(cards, wishlistLeaderboard, limit);
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

function subscribeCollection(path, limit, onNext, snapshotPaths = [path]) {
  let hasLive = false;
  let hasFallback = false;
  let blocked = false;

  readSnapshotCollection(snapshotPaths, limit)
    .then((collection) => {
      if (!hasLive && hasEntries(collection)) {
        hasFallback = true;
        onNext(collection, dataStatuses.fallback);
      }
    })
    .catch(() => {});

  if (!isFirebaseConfigured) {
    if (!hasFallback) onNext({}, dataStatuses.fallback);
    return () => {};
  }

  return subscribeFirst(path, limit, (value) => {
    if (blocked) return;
    const collection = normalizeCollection(value);
    hasLive = true;
    onNext(collection, dataStatuses.live);
  }, (error) => {
    blocked = true;
    if (!hasFallback) onNext({}, isPermissionError(error) ? dataStatuses.unavailable : dataStatuses.error);
    warnOnce(`listener:${path}`, `[Website data] Firebase collection listener failed for ${path}.`, error);
  });
}

export function subscribeCardsPage(limit = 60, onNext) {
  return subscribeCollection("cards", limit, onNext);
}

export function subscribeGuildsPage(limit = 50, onNext) {
  return subscribeCollection("guilds", limit, onNext);
}

export function subscribeWishlistLeaderboardCounts(onNext) {
  let hasLive = false;
  let blocked = false;

  readWishlistLeaderboardCountsWithSource()
    .then(({ value, status }) => {
      if (!hasLive) onNext(value, status);
    })
    .catch(() => {});

  if (!isFirebaseConfigured) return () => {};

  return subscribeFirst("meta/wishlistLeaderboard", 500, (value) => {
    if (blocked) return;
    hasLive = true;
    onNext(normalizeCollection(value), dataStatuses.live);
  }, (error) => {
    blocked = true;
    onNext({}, isPermissionError(error) ? dataStatuses.unavailable : dataStatuses.error);
    warnOnce("listener:meta/wishlistLeaderboard", "[Website data] Wishlist leaderboard listener failed.", error);
  });
}

export function subscribeSiteStats(onNext) {
  let metadataStats = {};
  let users = {};
  let cards = {};
  let guilds = {};
  let snapshotStats = {};
  let liveSeen = false;

  const emit = (status = liveSeen ? dataStatuses.live : dataStatuses.fallback) => onNext({
    players: firstCount(metadataStats.players, snapshotStats.players, Object.keys(normalizeCollection(users)).length),
    cards: firstCount(metadataStats.cards, Object.keys(normalizeCollection(cards)).length, snapshotStats.cards),
    copies: firstCount(metadataStats.copies, snapshotStats.copies),
    guilds: firstCount(metadataStats.guilds, Object.keys(normalizeCollection(guilds)).length, snapshotStats.guilds)
  }, status);

  readSnapshotValue("stats", {})
    .then((value) => {
      snapshotStats = { ...EMPTY_STATS, ...value };
      emit(dataStatuses.fallback);
    })
    .catch(() => {});

  if (!isFirebaseConfigured) return () => {};

  const unsubscribers = [
    subscribeValue("metadata", (value) => {
      liveSeen = true;
      metadataStats = statsFromMetadata(value || {});
      emit(dataStatuses.live);
    }, (error) => {
      emit(isPermissionError(error) ? dataStatuses.unavailable : dataStatuses.error);
      warnOnce("listener:metadata", "[Website data] Metadata listener failed.", error);
    }, {}),
    subscribeFirst("publicUsers", 500, (value) => {
      liveSeen = true;
      users = sanitizePublicUsers(value);
      emit(dataStatuses.live);
    }, (error) => {
      warnOnce("listener:publicUsers:stats", "[Website data] Public users listener failed.", error);
    }),
    subscribeFirst("cards", 500, (value) => {
      liveSeen = true;
      cards = normalizeCollection(value);
      emit(dataStatuses.live);
    }, (error) => {
      warnOnce("listener:cards:stats", "[Website data] Cards listener failed.", error);
    }),
    subscribeFirst("guilds", 500, (value) => {
      liveSeen = true;
      guilds = normalizeCollection(value);
      emit(dataStatuses.live);
    }, (error) => {
      warnOnce("listener:guilds:stats", "[Website data] Guilds listener failed.", error);
    })
  ];

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
}

export function subscribeDashboard(discordId, onNext) {
  if (!discordId) return () => {};
  getDashboard(discordId).then((value) => onNext(value, dataStatuses.fallback)).catch(() => {});

  let user = null;
  let cards = {};
  let guilds = {};
  let wishlistLeaderboard = {};
  let blockedUser = false;

  const emit = (status = dataStatuses.live) => {
    const guild = user?.guildId ? guilds?.[user.guildId] : null;
    onNext({ user, cards: normalizeCollection(cards), guild, wishlistLeaderboard }, status);
  };

  if (!isFirebaseConfigured) return () => {};

  const unsubscribers = [
    subscribeValue(`publicUsers/${discordId}`, (value) => {
      if (blockedUser) return;
      user = value ? sanitizePublicUser(value, discordId) : null;
      emit(dataStatuses.live);
    }, (error) => {
      blockedUser = true;
      emit(isPermissionError(error) ? dataStatuses.unavailable : dataStatuses.error);
      warnOnce(`listener:publicUsers:${discordId}`, "[Website data] Public user listener failed.", error);
    }, null),
    subscribeFirst("cards", 200, (value) => {
      cards = normalizeCollection(value);
      emit(dataStatuses.live);
    }, (error) => warnOnce("listener:cards:dashboard", "[Website data] Cards listener failed.", error)),
    subscribeFirst("guilds", 100, (value) => {
      guilds = normalizeCollection(value);
      emit(dataStatuses.live);
    }, (error) => warnOnce("listener:guilds:dashboard", "[Website data] Guilds listener failed.", error)),
    subscribeWishlistLeaderboardCounts((value, status) => {
      wishlistLeaderboard = normalizeCollection(value);
      emit(status?.source === "live" ? dataStatuses.live : status);
    })
  ];

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
}

export function subscribeTopWishlistedCards(limit = 3, onNext) {
  getTopWishlistedCards(limit).then((value) => onNext(value, dataStatuses.fallback)).catch(() => {});

  if (!isFirebaseConfigured) return () => {};

  let cards = {};
  let wishlistLeaderboard = {};
  const emit = (status = dataStatuses.live) => {
    const entries = Object.entries(normalizeCollection(wishlistLeaderboard))
      .map(([cardId, count]) => ({ cardId: String(cardId), count: Number(count || 0), card: cards?.[cardId] }))
      .filter((entry) => entry.card && entry.count > 0)
      .sort((left, right) => right.count - left.count || String(left.card?.name || "").localeCompare(String(right.card?.name || "")))
      .slice(0, limit);
    onNext(entries, status);
  };

  const unsubscribers = [
    subscribeFirst("cards", 500, (value) => {
      cards = normalizeCollection(value);
      emit(dataStatuses.live);
    }, (error) => warnOnce("listener:cards:topWishlist", "[Website data] Cards listener failed.", error)),
    subscribeWishlistLeaderboardCounts((value, status) => {
      wishlistLeaderboard = normalizeCollection(value);
      emit(status);
    })
  ];

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
}

export function subscribeCardShowcase(limit = 6, onNext) {
  getCardShowcase(limit).then((value) => onNext(value, dataStatuses.fallback)).catch(() => {});

  if (!isFirebaseConfigured) return () => {};

  let cards = {};
  let wishlistLeaderboard = {};
  const emit = (status = dataStatuses.live) => {
    onNext(buildShowcase(cards, wishlistLeaderboard, limit), status);
  };

  const unsubscribers = [
    subscribeFirst("cards", 500, (value) => {
      cards = normalizeCollection(value);
      emit(dataStatuses.live);
    }, (error) => warnOnce("listener:cards:showcase", "[Website data] Cards listener failed.", error)),
    subscribeWishlistLeaderboardCounts((value, status) => {
      wishlistLeaderboard = normalizeCollection(value);
      emit(status?.source === "live" ? dataStatuses.live : status);
    })
  ];

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
}

export function subscribeWishlistData(discordId, onNext) {
  if (!discordId) return () => {};
  getWishlistData(discordId).then((value) => onNext(value, dataStatuses.fallback)).catch(() => {});

  return subscribeDashboard(discordId, (dashboard, status) => {
    const wishlistIds = Array.isArray(dashboard?.user?.wishlist) ? dashboard.user.wishlist : [];
    onNext({
      ...dashboard,
      wishlistCards: wishlistIds.map((cardId) => dashboard?.cards?.[cardId]).filter(Boolean),
      allCards: normalizeCollection(dashboard?.cards)
    }, status);
  });
}
