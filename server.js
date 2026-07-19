const express = require("express");
const cors = require("cors");

const { OddsCache } = require("./lib/oddsCache");
const { SUPPORTED_LEAGUES } = require("./lib/leagues");

const PORT = process.env.PORT || 3000;
const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_REGIONS = process.env.ODDS_REGIONS || "us";
const ODDS_POLL_INTERVAL_MS = Number(process.env.ODDS_POLL_INTERVAL_MS) || 45_000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

if (!ODDS_API_KEY) {
  console.error(
    "Missing ODDS_API_KEY environment variable. Set it in your hosting dashboard " +
      "(Railway: Variables tab; Render: Environment tab) — get a key at the-odds-api.com."
  );
  process.exit(1);
}

const cache = new OddsCache({
  apiKey: ODDS_API_KEY,
  regions: ODDS_REGIONS,
  pollIntervalMs: ODDS_POLL_INTERVAL_MS,
});
cache.start();

const app = express();
app.use(cors({ origin: ALLOWED_ORIGIN }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptimeSeconds: process.uptime(), leagues: cache.getStatus() });
});

app.get("/api/odds", (req, res) => {
  const requested = req.query.leagues
    ? req.query.leagues.split(",").map((l) => l.trim().toUpperCase()).filter(Boolean)
    : SUPPORTED_LEAGUES;

  const invalid = requested.filter((l) => !SUPPORTED_LEAGUES.includes(l));
  if (invalid.length > 0) {
    return res.status(400).json({
      error: `Unsupported league(s): ${invalid.join(", ")}`,
      supportedLeagues: SUPPORTED_LEAGUES,
    });
  }

  res.json(cache.getGames(requested));
});

app.listen(PORT, () => {
  console.log(`EDGEHUB odds service listening on port ${PORT}`);
});
