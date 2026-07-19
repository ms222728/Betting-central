// American odds <-> implied probability conversions used to build the
// synthetic "sharp" consensus line (median implied probability across all
// books offering a price, converted back to American odds).

function americanToImpliedProbability(price) {
  if (price > 0) return 100 / (price + 100);
  return -price / (-price + 100);
}

function impliedProbabilityToAmerican(prob) {
  if (prob <= 0 || prob >= 1) return null;
  if (prob >= 0.5) return Math.round((-prob / (1 - prob)) * 100);
  return Math.round(((1 - prob) / prob) * 100);
}

function median(numbers) {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

// prices: array of American odds (numbers) for one side of one game, one
// entry per bookmaker that offered a price. Returns the consensus American
// price for that side, or null if no prices were given.
function consensusAmericanOdds(prices) {
  if (!prices || prices.length === 0) return null;
  const impliedProbs = prices.map(americanToImpliedProbability);
  const medianProb = median(impliedProbs);
  return impliedProbabilityToAmerican(medianProb);
}

module.exports = { americanToImpliedProbability, impliedProbabilityToAmerican, median, consensusAmericanOdds };
