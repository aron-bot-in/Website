function normalizeApiBase(value) {
  const raw = String(value || "").trim().replace(/\/+$/g, "");
  if (!raw) return "/api/website";
  return raw.endsWith("/api/website") ? raw : `${raw}/api/website`;
}

const API_BASE_URL = normalizeApiBase(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_ARON_API_URL);

function endpoint(path) {
  const cleanPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

async function fetchJson(path, fallback) {
  try {
    const response = await fetch(endpoint(path), {
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || `API request failed (${response.status}).`);
    }
    return payload;
  } catch (error) {
    console.warn(`[Website API] ${path} unavailable:`, error?.message || error);
    return fallback;
  }
}

export async function fetchFeaturedCards() {
  const payload = await fetchJson("/cards/featured", { cards: [] });
  return Array.isArray(payload.cards) ? payload.cards : [];
}

export async function fetchPublicCards(limit = 0) {
  const query = limit ? `?limit=${encodeURIComponent(limit)}` : "";
  const payload = await fetchJson(`/cards${query}`, { cards: [] });
  return Array.isArray(payload.cards) ? payload.cards : [];
}

export async function fetchCosmeticShop() {
  const payload = await fetchJson("/cosmetic-shop", { shop: [] });
  return Array.isArray(payload.shop) ? payload.shop : [];
}

export async function fetchActiveEvent() {
  const payload = await fetchJson("/events/active", { event: { active: false } });
  return payload.event || { active: false };
}

export async function fetchActivitySummary() {
  const payload = await fetchJson("/activity", { activity: [] });
  return Array.isArray(payload.activity) ? payload.activity : [];
}

export async function fetchGuildLeaderboard() {
  const payload = await fetchJson("/guilds/leaderboard", { guilds: [] });
  return Array.isArray(payload.guilds) ? payload.guilds : [];
}

export async function fetchPublicUserDashboard(userId) {
  if (!userId) return null;
  const payload = await fetchJson(`/users/${encodeURIComponent(userId)}/dashboard`, { dashboard: null });
  return payload.dashboard || null;
}

export async function fetchPublicInventory(userId) {
  if (!userId) return null;
  const payload = await fetchJson(`/users/${encodeURIComponent(userId)}/inventory`, { inventory: null });
  return payload.inventory || null;
}

export async function fetchPublicAlbums(userId) {
  if (!userId) return [];
  const payload = await fetchJson(`/users/${encodeURIComponent(userId)}/albums`, { albums: [] });
  return Array.isArray(payload.albums) ? payload.albums : [];
}

export async function fetchUserAchievements(userId) {
  if (!userId) return null;
  const payload = await fetchJson(`/users/${encodeURIComponent(userId)}/achievements`, { achievements: null });
  return payload.achievements || null;
}

export async function fetchUserCosmetics(userId) {
  if (!userId) return null;
  const payload = await fetchJson(`/users/${encodeURIComponent(userId)}/cosmetics`, { cosmetics: null });
  return payload.cosmetics || null;
}

export async function fetchUserDeck(userId) {
  if (!userId) return null;
  const payload = await fetchJson(`/users/${encodeURIComponent(userId)}/deck`, { deck: null });
  return payload.deck || null;
}

export async function fetchGuildRaid(guildId) {
  if (!guildId) return null;
  const payload = await fetchJson(`/guilds/${encodeURIComponent(guildId)}/raid`, { guildRaid: null });
  return payload.guildRaid || null;
}

export function getWebsiteApiBaseUrl() {
  return API_BASE_URL;
}
