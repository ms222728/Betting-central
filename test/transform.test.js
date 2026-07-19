const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { transformEvents } = require("../lib/transform");
const { consensusAmericanOdds } = require("../lib/oddsMath");

const realSample = require(path.join(__dirname, "fixtures/real-sample-2026-07-18.json"));
const syntheticSample = require(path.join(__dirname, "fixtures/synthetic-nfl-ncaaf-nhl.json"));

test("real captured feed: only allowlisted sport_keys survive", () => {
  const games = transformEvents(realSample);

  // Regression guard for the exact bug this fixture caught: sport_title
  // says "NBA Summer League" (and similar look-alikes), which a
  // title-based filter would wrongly admit. Only sport_key counts.
  const droppedSportKeys = [
    "basketball_nba_summer_league",
    "soccer_mexico_ligamx",
    "americanfootball_cfl",
    "basketball_wnba",
    "boxing_boxing",
    "mma_mixed_martial_arts",
    "baseball_milb",
  ];
  const rawIdsForDroppedSports = new Set(
    realSample.filter((e) => droppedSportKeys.includes(e.sport_key)).map((e) => e.id)
  );
  for (const game of games) {
    assert.ok(!rawIdsForDroppedSports.has(game.id), `game ${game.id} should have been dropped`);
  }

  assert.equal(games.length, 2, "only the 2 real baseball_mlb games should survive");
  assert.ok(games.every((g) => g.league === "MLB"));
});

test("real captured feed: MLB games get the exact required shape", () => {
  const games = transformEvents(realSample);
  const giantsMariners = games.find((g) => g.id === "fc2051a727661b285a4718bc4738966e");

  assert.deepEqual(Object.keys(giantsMariners).sort(), [
    "away",
    "awayScore",
    "clock",
    "gameTime",
    "home",
    "homeScore",
    "id",
    "league",
    "odds",
    "status",
  ]);
  assert.equal(giantsMariners.away, "SF");
  assert.equal(giantsMariners.home, "SEA");
  assert.equal(giantsMariners.awayScore, null);
  assert.equal(giantsMariners.homeScore, null);
  assert.equal(giantsMariners.clock, null);
  assert.ok(giantsMariners.gameTime.endsWith(" ET"));
  assert.ok(giantsMariners.odds.fanduel);
  assert.ok(giantsMariners.odds.draftkings);
  assert.ok(giantsMariners.odds.sharp);

  // Sharp must be the median-implied-probability consensus across ALL
  // books in the raw event for this game, not just fanduel/draftkings.
  const rawEvent = realSample.find((e) => e.id === giantsMariners.id);
  const awayPrices = rawEvent.bookmakers.map(
    (b) => b.markets.find((m) => m.key === "h2h").outcomes.find((o) => o.name === rawEvent.away_team).price
  );
  const homePrices = rawEvent.bookmakers.map(
    (b) => b.markets.find((m) => m.key === "h2h").outcomes.find((o) => o.name === rawEvent.home_team).price
  );
  assert.equal(giantsMariners.odds.sharp.away, consensusAmericanOdds(awayPrices));
  assert.equal(giantsMariners.odds.sharp.home, consensusAmericanOdds(homePrices));
});

test("NFL, NCAAF, and NHL all transform correctly (synthetic, since real sample was off-season for all three)", () => {
  const games = transformEvents(syntheticSample);

  const nfl = games.find((g) => g.id === "synthetic-nfl-1");
  assert.ok(nfl, "NFL game should survive");
  assert.equal(nfl.league, "NFL");
  assert.equal(nfl.away, "KC");
  assert.equal(nfl.home, "BAL");
  assert.equal(nfl.status, "scheduled");
  assert.ok(nfl.odds.fanduel);
  assert.ok(nfl.odds.draftkings);
  assert.ok(nfl.odds.sharp);

  const ncaaf = games.find((g) => g.id === "synthetic-ncaaf-1");
  assert.ok(ncaaf, "NCAAF game should survive");
  assert.equal(ncaaf.league, "NCAAF");
  assert.equal(ncaaf.away, "BAMA");
  assert.equal(ncaaf.home, "UGA");
  assert.ok(ncaaf.odds.fanduel);
  assert.equal(ncaaf.odds.draftkings, undefined, "draftkings key must be omitted when that book has no price");
  assert.ok(ncaaf.odds.sharp);

  assert.equal(
    games.some((g) => g.id === "synthetic-ncaaf-no-odds"),
    false,
    "NCAAF game with zero bookmakers must be omitted, not guessed"
  );

  const nhl = games.find((g) => g.id === "synthetic-nhl-1");
  assert.ok(nhl, "NHL game should survive");
  assert.equal(nhl.league, "NHL");
  assert.equal(nhl.away, "NYR");
  assert.equal(nhl.home, "BOS");
  assert.equal(nhl.odds.fanduel, undefined, "fanduel key must be omitted when that book has no price");
  assert.ok(nhl.odds.draftkings);
  assert.ok(nhl.odds.sharp);
});
