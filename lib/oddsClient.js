const ODDS_API_BASE = "https://api.the-odds-api.com/v4/sports";

// Fetches raw h2h events for one sport from The Odds API. Throws on
// network/HTTP errors so the caller can decide how to handle a failed poll
// (e.g. keep serving the last good cache) — an empty array is a legitimate
// response (off-season, no games today) and is returned as-is, not thrown.
async function fetchSportOdds(sportKey, { apiKey, regions }) {
  const url = new URL(`${ODDS_API_BASE}/${sportKey}/odds`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", regions);
  url.searchParams.set("markets", "h2h");
  url.searchParams.set("oddsFormat", "american");

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`The Odds API request failed for ${sportKey}: ${response.status} ${body}`.trim());
  }
  return response.json();
}

module.exports = { fetchSportOdds };
