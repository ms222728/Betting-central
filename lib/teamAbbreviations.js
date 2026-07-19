// The Odds API returns full team names (e.g. "New York Yankees"), never
// abbreviations. This table maps full names -> short codes for the four
// major leagues, where rosters are small and fixed.
//
// NCAAF has 130+ FBS programs and new ones cycle in/out of the odds feed
// over time, so it isn't practical to hand-maintain a complete table. The
// most common Power-conference programs are listed below; anything missing
// falls back to an auto-generated code (see abbreviate() at the bottom).
// Add entries here as you notice ugly fallback codes in real responses.

const MLB = {
  "Arizona Diamondbacks": "ARI",
  "Atlanta Braves": "ATL",
  "Baltimore Orioles": "BAL",
  "Boston Red Sox": "BOS",
  "Chicago Cubs": "CHC",
  "Chicago White Sox": "CWS",
  "Cincinnati Reds": "CIN",
  "Cleveland Guardians": "CLE",
  "Colorado Rockies": "COL",
  "Detroit Tigers": "DET",
  "Houston Astros": "HOU",
  "Kansas City Royals": "KC",
  "Los Angeles Angels": "LAA",
  "Los Angeles Dodgers": "LAD",
  "Miami Marlins": "MIA",
  "Milwaukee Brewers": "MIL",
  "Minnesota Twins": "MIN",
  "New York Mets": "NYM",
  "New York Yankees": "NYY",
  "Oakland Athletics": "OAK",
  "Athletics": "ATH",
  "Philadelphia Phillies": "PHI",
  "Pittsburgh Pirates": "PIT",
  "San Diego Padres": "SD",
  "San Francisco Giants": "SF",
  "Seattle Mariners": "SEA",
  "St Louis Cardinals": "STL",
  "St. Louis Cardinals": "STL",
  "Tampa Bay Rays": "TB",
  "Texas Rangers": "TEX",
  "Toronto Blue Jays": "TOR",
  "Washington Nationals": "WSH",
};

const NFL = {
  "Arizona Cardinals": "ARI",
  "Atlanta Falcons": "ATL",
  "Baltimore Ravens": "BAL",
  "Buffalo Bills": "BUF",
  "Carolina Panthers": "CAR",
  "Chicago Bears": "CHI",
  "Cincinnati Bengals": "CIN",
  "Cleveland Browns": "CLE",
  "Dallas Cowboys": "DAL",
  "Denver Broncos": "DEN",
  "Detroit Lions": "DET",
  "Green Bay Packers": "GB",
  "Houston Texans": "HOU",
  "Indianapolis Colts": "IND",
  "Jacksonville Jaguars": "JAX",
  "Kansas City Chiefs": "KC",
  "Las Vegas Raiders": "LV",
  "Los Angeles Chargers": "LAC",
  "Los Angeles Rams": "LAR",
  "Miami Dolphins": "MIA",
  "Minnesota Vikings": "MIN",
  "New England Patriots": "NE",
  "New Orleans Saints": "NO",
  "New York Giants": "NYG",
  "New York Jets": "NYJ",
  "Philadelphia Eagles": "PHI",
  "Pittsburgh Steelers": "PIT",
  "San Francisco 49ers": "SF",
  "Seattle Seahawks": "SEA",
  "Tampa Bay Buccaneers": "TB",
  "Tennessee Titans": "TEN",
  "Washington Commanders": "WSH",
};

const NBA = {
  "Atlanta Hawks": "ATL",
  "Boston Celtics": "BOS",
  "Brooklyn Nets": "BKN",
  "Charlotte Hornets": "CHA",
  "Chicago Bulls": "CHI",
  "Cleveland Cavaliers": "CLE",
  "Dallas Mavericks": "DAL",
  "Denver Nuggets": "DEN",
  "Detroit Pistons": "DET",
  "Golden State Warriors": "GSW",
  "Houston Rockets": "HOU",
  "Indiana Pacers": "IND",
  "LA Clippers": "LAC",
  "Los Angeles Clippers": "LAC",
  "Los Angeles Lakers": "LAL",
  "Memphis Grizzlies": "MEM",
  "Miami Heat": "MIA",
  "Milwaukee Bucks": "MIL",
  "Minnesota Timberwolves": "MIN",
  "New Orleans Pelicans": "NOP",
  "New York Knicks": "NYK",
  "Oklahoma City Thunder": "OKC",
  "Orlando Magic": "ORL",
  "Philadelphia 76ers": "PHI",
  "Phoenix Suns": "PHX",
  "Portland Trail Blazers": "POR",
  "Sacramento Kings": "SAC",
  "San Antonio Spurs": "SAS",
  "Toronto Raptors": "TOR",
  "Utah Jazz": "UTA",
  "Washington Wizards": "WAS",
};

const NHL = {
  "Anaheim Ducks": "ANA",
  "Arizona Coyotes": "ARI",
  "Utah Hockey Club": "UTA",
  "Utah Mammoth": "UTA",
  "Boston Bruins": "BOS",
  "Buffalo Sabres": "BUF",
  "Calgary Flames": "CGY",
  "Carolina Hurricanes": "CAR",
  "Chicago Blackhawks": "CHI",
  "Colorado Avalanche": "COL",
  "Columbus Blue Jackets": "CBJ",
  "Dallas Stars": "DAL",
  "Detroit Red Wings": "DET",
  "Edmonton Oilers": "EDM",
  "Florida Panthers": "FLA",
  "Los Angeles Kings": "LAK",
  "Minnesota Wild": "MIN",
  "Montreal Canadiens": "MTL",
  "Montréal Canadiens": "MTL",
  "Nashville Predators": "NSH",
  "New Jersey Devils": "NJD",
  "New York Islanders": "NYI",
  "New York Rangers": "NYR",
  "Ottawa Senators": "OTT",
  "Philadelphia Flyers": "PHI",
  "Pittsburgh Penguins": "PIT",
  "San Jose Sharks": "SJS",
  "Seattle Kraken": "SEA",
  "St Louis Blues": "STL",
  "St. Louis Blues": "STL",
  "Tampa Bay Lightning": "TBL",
  "Toronto Maple Leafs": "TOR",
  "Vancouver Canucks": "VAN",
  "Vegas Golden Knights": "VGK",
  "Washington Capitals": "WSH",
  "Winnipeg Jets": "WPG",
};

const NCAAF = {
  "Alabama Crimson Tide": "BAMA",
  "Georgia Bulldogs": "UGA",
  "Ohio State Buckeyes": "OSU",
  "Michigan Wolverines": "MICH",
  "Texas Longhorns": "TEX",
  "Oklahoma Sooners": "OU",
  "LSU Tigers": "LSU",
  "Clemson Tigers": "CLEM",
  "Florida State Seminoles": "FSU",
  "Florida Gators": "UF",
  "Penn State Nittany Lions": "PSU",
  "Notre Dame Fighting Irish": "ND",
  "USC Trojans": "USC",
  "Oregon Ducks": "ORE",
  "Washington Huskies": "WASH",
  "Texas A&M Aggies": "TAMU",
  "Auburn Tigers": "AUB",
  "Tennessee Volunteers": "TENN",
  "Ole Miss Rebels": "MISS",
  "Mississippi State Bulldogs": "MSST",
  "Wisconsin Badgers": "WIS",
  "Iowa Hawkeyes": "IOWA",
  "Nebraska Cornhuskers": "NEB",
  "Michigan State Spartans": "MSU",
  "UCLA Bruins": "UCLA",
  "Miami Hurricanes": "MIA",
  "North Carolina Tar Heels": "UNC",
  "NC State Wolfpack": "NCST",
  "Virginia Tech Hokies": "VT",
  "Virginia Cavaliers": "UVA",
  "Louisville Cardinals": "LOU",
  "Pittsburgh Panthers": "PITT",
  "Syracuse Orange": "SYR",
  "Duke Blue Devils": "DUKE",
  "Wake Forest Demon Deacons": "WAKE",
  "Boston College Eagles": "BC",
  "Kentucky Wildcats": "UK",
  "South Carolina Gamecocks": "SC",
  "Arkansas Razorbacks": "ARK",
  "Missouri Tigers": "MIZ",
  "Oklahoma State Cowboys": "OKST",
  "Kansas State Wildcats": "KSU",
  "Kansas Jayhawks": "KU",
  "Baylor Bears": "BAY",
  "TCU Horned Frogs": "TCU",
  "Texas Tech Red Raiders": "TTU",
  "West Virginia Mountaineers": "WVU",
  "Iowa State Cyclones": "ISU",
  "Utah Utes": "UTAH",
  "Colorado Buffaloes": "COLO",
  "Arizona Wildcats": "ARIZ",
  "Arizona State Sun Devils": "ASU",
  "BYU Cougars": "BYU",
  "Cincinnati Bearcats": "CIN",
  "Houston Cougars": "HOU",
  "UCF Knights": "UCF",
  "Stanford Cardinal": "STAN",
  "California Golden Bears": "CAL",
  "SMU Mustangs": "SMU",
  "Georgia Tech Yellow Jackets": "GT",
  "Indiana Hoosiers": "IND",
  "Illinois Fighting Illini": "ILL",
  "Purdue Boilermakers": "PUR",
  "Minnesota Golden Gophers": "MINN",
  "Rutgers Scarlet Knights": "RUT",
  "Maryland Terrapins": "MD",
  "Northwestern Wildcats": "NW",
  "Vanderbilt Commodores": "VANDY",
  "Texas Christian University Horned Frogs": "TCU",
};

const LOOKUP_BY_LEAGUE = { MLB, NFL, NBA, NHL, NCAAF };

const STOP_WORDS = new Set(["of", "the", "and", "at", "st"]);

// Best-effort fallback for teams not in the table above: use the initials
// of the school/mascot name, e.g. "South Florida Bulls" -> "SFB".
function autoAbbreviate(name) {
  const words = name
    .replace(/[^A-Za-z0-9&' ]/g, "")
    .split(" ")
    .filter((w) => w && !STOP_WORDS.has(w.toLowerCase()));

  if (words.length === 0) return name.slice(0, 4).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();

  return words
    .map((w) => w[0])
    .join("")
    .slice(0, 5)
    .toUpperCase();
}

function abbreviate(league, fullTeamName) {
  const table = LOOKUP_BY_LEAGUE[league];
  if (table && table[fullTeamName]) return table[fullTeamName];
  return autoAbbreviate(fullTeamName);
}

module.exports = { abbreviate };
