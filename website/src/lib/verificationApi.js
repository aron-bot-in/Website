const express = require("express");
const { readDatabasePath, writeDatabasePath } = require("./db");
const { sha256Hex } = require("./verificationTokens");
const { getVerificationConfig } = require("./verificationConfig");
const { buildFrontendResultUrl, createOAuthState, processOAuthCallback } = require("./verificationService");

let server = null;
let attachedApp = null;
let attachedClient = null;

function parseCookies(header = "") {
  return Object.fromEntries(
    String(header || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return index === -1 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function setJsonHeaders(req, res, config) {
  const origin = String(req.headers.origin || "").replace(/\/+$/g, "");
  if (config.allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Verification-Admin-Key");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function requireAdmin(req, res, config) {
  if (!config.adminApiKeys.length) {
    res.status(503).json({ error: "Admin verification API is not configured." });
    return false;
  }
  const key = String(req.headers["x-verification-admin-key"] || "").trim();
  if (!config.adminApiKeys.includes(key)) {
    res.status(401).json({ error: "Admin API key is invalid." });
    return false;
  }
  return true;
}

function registerVerificationApiRoutes(app, config) {
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "verification", at: Date.now() });
  });

  app.post("/api/verification/start", async (req, res) => {
    try {
      const result = await createOAuthState({
        rawToken: req.body?.token,
        fingerprint: req.body?.fingerprint,
        requestMeta: {
          userAgent: req.headers["user-agent"],
          origin: req.headers.origin
        }
      });
      const secure = config.backendUrl.startsWith("https://") ? "; Secure" : "";
      res.setHeader("Set-Cookie", `aron_verify_state=${encodeURIComponent(result.stateHash)}; HttpOnly; SameSite=None${secure}; Path=/; Max-Age=600`);
      res.json({ authorizeUrl: result.authorizeUrl });
    } catch (error) {
      console.warn("[Verification API] start failed:", error.message);
      res.status(400).json({ error: error.message || "Verification could not start." });
    }
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    try {
      const state = String(req.query.state || "");
      const expectedStateHash = req.cookies.aron_verify_state;
      if (expectedStateHash) {
        if (sha256Hex(state) !== expectedStateHash) {
          throw new Error("OAuth state cookie did not match the callback state.");
        }
        const stateRecord = await readDatabasePath(`verificationOAuthStates/${expectedStateHash}`, { cache: true, ttl: 5_000 });
        if (!stateRecord) throw new Error("OAuth state cookie could not be matched.");
      }
      const result = await processOAuthCallback({
        code: String(req.query.code || ""),
        state,
        req,
        client: attachedClient
      });
      res.redirect(302, buildFrontendResultUrl(config, result.attemptId, result.status));
    } catch (error) {
      console.warn("[Verification API] callback failed:", error.message);
      res.redirect(302, buildFrontendResultUrl(config, "failed", "failed"));
    }
  });

  app.get("/api/verification/result/:attemptId", async (req, res) => {
    try {
      const attempt = await readDatabasePath(`verificationAttempts/${String(req.params.attemptId || "").trim()}`, { cache: true, ttl: 15_000 });
      if (!attempt) return res.status(404).json({ error: "Verification result was not found." });
      return res.json({
        attemptId: attempt.attemptId,
        status: attempt.status,
        riskScore: attempt.riskScore,
        reasons: attempt.reasons || [],
        verificationMatches: attempt.verificationMatches || [],
        accountCreatedAt: attempt.accountCreatedAt,
        discordUser: attempt.discordUser
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Verification result failed to load." });
    }
  });

  app.get("/api/admin/verification/users", async (req, res) => {
    const latestConfig = getVerificationConfig();
    if (!requireAdmin(req, res, latestConfig)) return;
    const users = await readDatabasePath("verificationUsers", { cache: true, ttl: 10_000 }) || {};
    res.json({ users });
  });

  app.post("/api/admin/verification/status", async (req, res) => {
    const latestConfig = getVerificationConfig();
    if (!requireAdmin(req, res, latestConfig)) return;
    const userId = String(req.body?.userId || "").trim();
    const status = String(req.body?.status || "").trim().toLowerCase();
    if (!userId || !["verified", "flagged", "quarantined", "blocked", "unverified"].includes(status)) {
      return res.status(400).json({ error: "Valid userId and status are required." });
    }
    const path = `meta/accountSecurity/userStatuses/${userId}`;
    if (status === "unverified") {
      await writeDatabasePath(path, null);
    } else {
      await writeDatabasePath(path, {
        status,
        reason: String(req.body?.reason || "Manual verification admin update").trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: "verification-admin-api"
      }, { merge: true });
    }
    res.json({ ok: true, userId, status });
  });
}

function attachVerificationApiRoutes(app, client = null) {
  const config = getVerificationConfig();
  if (!config.enabled) return null;
  if (client) attachedClient = client;
  if (!config.discord.clientId || !config.discord.clientSecret) {
    console.warn("[Verification API] Missing DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET; API not started.");
    return null;
  }

  if (attachedApp === app) return app;
  if (config.security.trustProxy) app.set("trust proxy", 1);
  app.use((req, res, next) => {
    setJsonHeaders(req, res, config);
    if (req.method === "OPTIONS") return res.status(204).end();
    req.cookies = parseCookies(req.headers.cookie);
    return next();
  });
  registerVerificationApiRoutes(app, config);
  attachedApp = app;
  console.log("[Verification API] Routes mounted on shared Express app.");
  return app;
}

function ensureVerificationApiServer(client = null) {
  const config = getVerificationConfig();
  if (!config.enabled) return null;
  if (client) attachedClient = client;
  if (attachedApp) return attachedApp;
  if (server) return server;

  const app = express();
  app.use(express.json({ limit: "32kb" }));
  if (!attachVerificationApiRoutes(app, client)) return null;

  server = app.listen(config.port, () => {
    console.log(`[Verification API] Listening on port ${config.port}.`);
  });
  return server;
}

module.exports = {
  attachVerificationApiRoutes,
  ensureVerificationApiServer
};
