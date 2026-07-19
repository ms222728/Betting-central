const { fetchSportOdds } = require("./oddsClient");
const { transformEvents } = require("./transform");
const { LEAGUE_TO_SPORT_KEY, SUPPORTED_LEAGUES } = require("./leagues");

// In-memory cache, refreshed on a timer. Serving reads directly from
// process memory means /api/odds never blocks on an outbound call and
// never eats into The Odds API's rate limit per request.
class OddsCache {
  constructor({ apiKey, regions, pollIntervalMs }) {
    this.apiKey = apiKey;
    this.regions = regions;
    this.pollIntervalMs = pollIntervalMs;
    this.byLeague = Object.fromEntries(
      SUPPORTED_LEAGUES.map((league) => [league, { games: [], lastUpdated: null, lastError: null }])
    );
    this._timer = null;
  }

  async refreshLeague(league) {
    const sportKey = LEAGUE_TO_SPORT_KEY[league];
    try {
      const rawEvents = await fetchSportOdds(sportKey, { apiKey: this.apiKey, regions: this.regions });
      this.byLeague[league] = {
        games: transformEvents(rawEvents),
        lastUpdated: new Date().toISOString(),
        lastError: null,
      };
    } catch (err) {
      // Keep serving the last known-good games for this league; off-season
      // leagues legitimately return zero games and that's fine, but a
      // failed request shouldn't wipe out data that was working a minute ago.
      console.error(`[oddsCache] refresh failed for ${league}:`, err.message);
      this.byLeague[league] = {
        ...this.byLeague[league],
        lastError: { message: err.message, at: new Date().toISOString() },
      };
    }
  }

  async refreshAll() {
    await Promise.all(SUPPORTED_LEAGUES.map((league) => this.refreshLeague(league)));
  }

  start() {
    this.refreshAll();
    this._timer = setInterval(() => this.refreshAll(), this.pollIntervalMs);
    this._timer.unref?.();
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
  }

  getGames(leagues) {
    return leagues.flatMap((league) => this.byLeague[league]?.games ?? []);
  }

  getStatus() {
    return Object.fromEntries(
      Object.entries(this.byLeague).map(([league, { games, lastUpdated, lastError }]) => [
        league,
        { gameCount: games.length, lastUpdated, lastError },
      ])
    );
  }
}

module.exports = { OddsCache };
