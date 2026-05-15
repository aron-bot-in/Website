import FingerprintJS from "@fingerprintjs/fingerprintjs";

function normalizeApiUrl(value) {
  const raw = String(value || "").trim().replace(/\/+$/g, "");
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?/i.test(raw)) return `http://${raw}`;
  return `https://${raw}`;
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_VERIFICATION_API_URL || import.meta.env.VITE_API_URL);

function apiUrl(path) {
  if (!API_URL) throw new Error("Verification API URL is not configured. Set VITE_VERIFICATION_API_URL.");
  return `${API_URL}${path}`;
}

function browserName() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/")) return "Safari";
  return "Unknown";
}

export async function collectVerificationFingerprint() {
  const agent = await FingerprintJS.load();
  const result = await agent.get();
  return {
    visitorId: result.visitorId,
    browser: browserName(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    platform: navigator.platform || "",
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    language: navigator.language || ""
  };
}

export async function startBackendVerification(token) {
  const fingerprint = await collectVerificationFingerprint();
  let response;
  try {
    response = await fetch(apiUrl("/api/verification/start"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, fingerprint })
    });
  } catch {
    throw new Error("Verification server is unreachable. Please try again in a moment.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Verification could not start.");
  if (!payload.authorizeUrl) throw new Error("Verification API did not return a Discord login URL.");
  return payload;
}

export async function getVerificationResult(attemptId) {
  if (!attemptId || attemptId === "failed") throw new Error("Verification did not complete.");
  const response = await fetch(apiUrl(`/api/verification/result/${encodeURIComponent(attemptId)}`), {
    credentials: "include"
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Verification result could not be loaded.");
  return payload;
}

export function hasVerificationApi() {
  return Boolean(API_URL);
}
