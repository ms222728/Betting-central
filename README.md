# EDGEHUB Odds Service

A small Node.js/Express backend that polls [The Odds API](https://the-odds-api.com)
for moneylines and serves clean JSON to the EDGEHUB dashboard frontend. Your
Odds API key stays server-side — it's never sent to the browser.

## What it does

- Polls The Odds API every ~45s (configurable) for MLB, NFL, NBA, NHL, NCAAF
  and caches the results in memory. `/api/odds` reads from that cache, so
  it never makes a browser wait on an outbound API call and never burns
  extra Odds API credits per page view.
- Filters strictly by sport key (`baseball_mlb`, `americanfootball_nfl`,
  `basketball_nba`, `icehockey_nhl`, `americanfootball_ncaaf`) — anything
  else in the raw feed (summer league, minor leagues, other sports) is
  dropped.
- For each game, returns FanDuel and DraftKings moneylines plus a synthetic
  **sharp** consensus line: each available book's price is converted to
  implied probability, the median across all books is taken per side, and
  that's converted back to American odds. The Odds API doesn't expose a
  single "sharp" book, so this consensus stands in for one.
- Omits a book's key entirely if that book isn't offering a price for a
  game (never guesses). Omits a game entirely if no book has a usable price.
- It's normal and expected for NFL/NBA/NHL/NCAAF to return few or zero
  games outside their seasons — that's not an error.

## API

### `GET /api/odds?leagues=MLB,NFL`

`leagues` is optional and comma-separated; omit it to get all five leagues.
Valid values: `MLB`, `NFL`, `NBA`, `NHL`, `NCAAF`.

```json
[
  {
    "id": "e912304de...",
    "league": "MLB",
    "away": "NYY",
    "home": "BOS",
    "gameTime": "7:10 PM ET",
    "status": "scheduled",
    "awayScore": null,
    "homeScore": null,
    "clock": null,
    "odds": {
      "fanduel": { "away": -130, "home": 110 },
      "draftkings": { "away": -128, "home": 108 },
      "sharp": { "away": -132, "home": 112 }
    }
  }
]
```

**Known scope limit:** The Odds API's odds endpoint only returns moneylines,
team names, and start times — it has no live score or game-clock data for
any sport. So `status` is derived purely from start time (`scheduled` if the
game hasn't started yet, `live` once it has) and `awayScore`/`homeScore`/
`clock` are always `null`. Getting real scores would require a different
data source; ask if you want that wired in later.

### `GET /health`

Returns service uptime and, per league, the cached game count, last
successful refresh time, and last error (if any) — useful for confirming
the poller is actually reaching The Odds API after you deploy.

## Team abbreviations

The Odds API returns full team names ("New York Yankees"), not codes. This
service maps them to short codes (`lib/teamAbbreviations.js`) — MLB, NFL,
NBA, and NHL are fully covered (fixed ~30-32 team rosters). NCAAF has 130+
FBS programs and the odds feed's exact roster shifts over time, so the
table covers the common Power-conference programs and falls back to an
auto-generated code (initials of the school/mascot name) for anything not
listed. If you spot an ugly auto-generated NCAAF code in real output, add
the correct one to that file.

## Environment variables

See `.env.example`. Only `ODDS_API_KEY` is required — everything else has
a sensible default.

## Deploying on Railway (browser only, no CLI needed)

1. Push this repo to GitHub if it isn't already (it is, if you're reading
   this from the repo).
2. Sign in at [railway.app](https://railway.app) and click **New Project**.
3. Choose **Deploy from GitHub repo**, then pick this repository
   (`ms222728/betting-central`). Authorize Railway's GitHub access if asked.
4. Railway detects the `package.json` and Node.js automatically — no build
   config needed. It will run `npm install` then `npm start`.
5. Click into the new service, open the **Variables** tab, and add:
   - `ODDS_API_KEY` = your key from the-odds-api.com
   - (optional) any of `ODDS_POLL_INTERVAL_MS`, `ODDS_REGIONS`,
     `ALLOWED_ORIGIN` from `.env.example` if you want non-default behavior
   - Don't set `PORT` — Railway injects it automatically and the app reads
     `process.env.PORT`.
6. Railway redeploys automatically after you save variables. Watch the
   **Deployments** tab; once it says the service is live, open
   **Settings → Networking** and click **Generate Domain** to get a public
   URL (something like `your-app.up.railway.app`).
7. Verify it's working from your phone's browser:
   - `https://your-app.up.railway.app/health` — should show `"status":"ok"`
     and, after ~45s, real `lastUpdated` timestamps per league.
   - `https://your-app.up.railway.app/api/odds?leagues=MLB` — should return
     a JSON array of games (or `[]` if MLB has no games at that moment).

Any future push to this branch/repo redeploys automatically.

## Deploying on Render (alternative, also browser only)

1. Sign in at [render.com](https://render.com) and click **New +** →
   **Web Service**.
2. Connect your GitHub account and select this repository.
3. Set **Build Command** to `npm install` and **Start Command** to
   `npm start` (Render usually pre-fills these correctly for a Node repo).
4. Under **Environment**, add `ODDS_API_KEY` (and any optional vars from
   `.env.example`). Don't set `PORT` — Render injects it.
5. Click **Create Web Service**. Once deployed, Render gives you a public
   URL like `your-app.onrender.com` — test `/health` and `/api/odds` the
   same way as above.

## Local run (only if you ever have a dev machine handy)

```
npm install
ODDS_API_KEY=your-key npm start
```
