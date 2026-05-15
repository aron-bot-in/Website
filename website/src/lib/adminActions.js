import { auth } from "./firebase.js";
import { clearDataCache } from "./data.js";

const API_URL = String(
  import.meta.env.VITE_ADMIN_API_URL
  || import.meta.env.VITE_VERIFICATION_API_URL
  || import.meta.env.VITE_API_URL
  || ""
).replace(/\/+$/g, "");

function cleanId(value) {
  return String(value || "").trim();
}

function uniqueSorted(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(cleanId).filter(Boolean))].sort();
}

function envAdminIds() {
  return uniqueSorted(String(import.meta.env.VITE_ADMIN_DISCORD_IDS || "")
    .split(/[,\s]+/)
    .filter(Boolean));
}

function adminApiUrl() {
  if (!API_URL) throw new Error("Admin API URL is not configured. Set VITE_ADMIN_API_URL or VITE_VERIFICATION_API_URL.");
  return `${API_URL}/api/admin/website`;
}

async function adminToken() {
  const user = auth?.currentUser;
  if (!user) throw new Error("You must be signed in with Firebase Auth to use admin actions.");
  return user.getIdToken();
}

async function adminAction(action, payload = {}) {
  const token = await adminToken();
  const response = await fetch(adminApiUrl(), {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ action, payload })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Admin action failed.");
  return result;
}

export async function getAdminIds() {
  const fallbackIds = envAdminIds();
  try {
    const result = await adminAction("getAdminIds");
    return uniqueSorted([...(result.ids || []), ...fallbackIds]);
  } catch (error) {
    if (fallbackIds.length) return fallbackIds;
    console.warn("[Admin access] backend admin list read failed:", error);
    return [];
  }
}

export async function isAdminIdentity(identity) {
  const discordId = cleanId(identity?.discordId);
  if (!discordId) return false;
  return (await getAdminIds()).includes(discordId);
}

export async function getAdminOverview() {
  return (await adminAction("getAdminOverview")).overview;
}

export async function findUser(userId) {
  return (await adminAction("findUser", { userId })).user;
}

export async function getVerificationProfile(userId) {
  return (await adminAction("getVerificationProfile", { userId })).profile;
}

export async function setAdminUser(_identity, userId, enabled) {
  await adminAction("setAdminUser", { userId, enabled });
  clearDataCache();
}

export async function saveCard(_identity, payload) {
  const result = await adminAction("saveCard", { card: payload });
  clearDataCache();
  return result.card;
}

export async function deleteCard(_identity, cardId) {
  await adminAction("deleteCard", { cardId });
  clearDataCache();
}

export async function updateWallet(_identity, userId, currency, action, amount) {
  const result = await adminAction("updateWallet", { userId, currency, mode: action, amount });
  clearDataCache(`dashboard:${userId}`);
  return result.next;
}

export async function giveCardCopy(_identity, userId, cardId, amount = 1) {
  const result = await adminAction("giveCardCopy", { userId, cardId, amount });
  clearDataCache(`dashboard:${userId}`);
  return result.copies || [];
}

export async function removeCardCopy(_identity, userId, code) {
  await adminAction("removeCardCopy", { userId, code });
  clearDataCache(`dashboard:${userId}`);
}

export async function addAllWishlist(_identity, userId) {
  await adminAction("addAllWishlist", { userId });
  clearDataCache();
}

export async function rebuildWishlistLeaderboard() {
  const result = await adminAction("rebuildWishlistLeaderboard");
  clearDataCache();
  return result.cache;
}

export async function setBotBan(_identity, userId, enabled, reason = "") {
  await adminAction("setBotBan", { userId, enabled, reason });
  clearDataCache();
}

export async function setAccountStatus(_identity, userId, status, reason = "") {
  await adminAction("setAccountStatus", { userId, status, reason });
  clearDataCache();
}

export async function setCommandDisabled(_identity, commandName, disabled) {
  await adminAction("setCommandDisabled", { commandName, disabled });
  clearDataCache();
}

export async function setChannelCommandDisabled(_identity, guildId, channelId, commandName, disabled) {
  await adminAction("setChannelCommandDisabled", { guildId, channelId, commandName, disabled });
  clearDataCache();
}

export async function resetUserField(_identity, userId, field) {
  await adminAction("resetUserField", { userId, field });
  clearDataCache(`dashboard:${userId}`);
}

export async function rawDatabaseWrite(_identity, path, mode, rawJson) {
  const value = mode === "delete" ? null : JSON.parse(rawJson);
  await adminAction("rawDatabaseWrite", { path, mode, value });
  clearDataCache();
}
