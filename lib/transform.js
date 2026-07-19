const { SPORT_KEY_TO_LEAGUE } = require("./leagues");
const { abbreviate } = require("./teamAbbreviations");
const { consensusAmericanOdds } = require("./oddsMath");

const DIRECT_BOOKS = ["fanduel", "draftkings"];

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatGameTime(commenceTimeIso) {
  return `${timeFormatter.format(new Date(commenceTimeIso))} ET`;
}

function deriveStatus(commenceTimeIso) {
  return new Date(commenceTimeIso).getTime() > Date.now() ? "scheduled" : "live";
}

// Pulls a {away, home} American price pair out of one bookmaker's h2h
// market, matching outcomes by team name (never by array position — The
// Odds API does not guarantee outcome order). Returns null if this book
// doesn't have a clean two-sided h2h price for this game.
function extractH2hPrices(bookmaker, awayTeam, homeTeam) {
  const market = bookmaker.markets?.find((m) => m.key === "h2h");
  if (!market) return null;

  const awayOutcome = market.outcomes?.find((o) => o.name === awayTeam);
  const homeOutcome = market.outcomes?.find((o) => o.name === homeTeam);
  if (!awayOutcome || !homeOutcome) return null;
  if (typeof awayOutcome.price !== "number" || typeof homeOutcome.price !== "number") return null;

  return { away: awayOutcome.price, home: homeOutcome.price };
}

// Transforms one raw event from The Odds API's /v4/sports/{sport}/odds
// response into the EDGEHUB game shape. Returns null if the game has no
// reliable h2h odds from any book (caller should drop it).
function transformEvent(event) {
  const league = SPORT_KEY_TO_LEAGUE[event.sport_key];
  if (!league) return null; // not on the allowlist

  const { away_team: awayTeam, home_team: homeTeam } = event;
  const perBook = {};
  const awayPrices = [];
  const homePrices = [];

  for (const bookmaker of event.bookmakers || []) {
    const prices = extractH2hPrices(bookmaker, awayTeam, homeTeam);
    if (!prices) continue;
    perBook[bookmaker.key] = prices;
    awayPrices.push(prices.away);
    homePrices.push(prices.home);
  }

  if (awayPrices.length === 0 || homePrices.length === 0) return null; // no reliable odds

  const odds = {};
  for (const book of DIRECT_BOOKS) {
    if (perBook[book]) odds[book] = perBook[book];
  }
  odds.sharp = {
    away: consensusAmericanOdds(awayPrices),
    home: consensusAmericanOdds(homePrices),
  };

  return {
    id: event.id,
    league,
    away: abbreviate(league, awayTeam),
    home: abbreviate(league, homeTeam),
    gameTime: formatGameTime(event.commence_time),
    status: deriveStatus(event.commence_time),
    awayScore: null,
    homeScore: null,
    clock: null,
    odds,
  };
}

// events: raw array from The Odds API for a single sport.
function transformEvents(events) {
  return (events || [])
    .map(transformEvent)
    .filter((game) => game !== null);
}

module.exports = { transformEvents, transformEvent };
