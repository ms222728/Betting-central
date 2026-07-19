// Allowlist of supported leagues. Anything not in this map is rejected/dropped —
// this is the strict filter, never sport_title (The Odds API's raw feed also
// includes things like baseball_mlb_summer_league, boxing, soccer, MMA, CFL, etc).
const LEAGUE_TO_SPORT_KEY = {
  MLB: "baseball_mlb",
  NFL: "americanfootball_nfl",
  NBA: "basketball_nba",
  NHL: "icehockey_nhl",
  NCAAF: "americanfootball_ncaaf",
};

const SPORT_KEY_TO_LEAGUE = Object.fromEntries(
  Object.entries(LEAGUE_TO_SPORT_KEY).map(([league, sportKey]) => [sportKey, league])
);

const SUPPORTED_LEAGUES = Object.keys(LEAGUE_TO_SPORT_KEY);

module.exports = { LEAGUE_TO_SPORT_KEY, SPORT_KEY_TO_LEAGUE, SUPPORTED_LEAGUES };
