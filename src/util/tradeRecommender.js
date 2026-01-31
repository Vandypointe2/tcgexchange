const { computeDirectionalMatches, greedyOneToOneSwaps } = require('./tradeMatcher');

function scoreSwaps(swaps = []) {
  // Score = sum of (givePriority + receivePriority) per 1:1 unit
  // swaps already include a score (givePriority+receivePriority) when produced by greedyOneToOneSwaps
  return swaps.reduce((acc, s) => acc + (s.score || 0) * (s.quantity || 1), 0);
}

function recommendUsers({ myCollection, myWishlist, others, maxUsers = 20, maxSwapsPerUser = 20 }) {
  // others: [{ user, collection, wishlist }]
  const recs = [];

  for (const o of others) {
    const iGive = computeDirectionalMatches({ fromCollectionItems: myCollection, toWishlistItems: o.wishlist });
    const theyGive = computeDirectionalMatches({ fromCollectionItems: o.collection, toWishlistItems: myWishlist });

    if (!iGive.length || !theyGive.length) continue;

    const swaps = greedyOneToOneSwaps({ aGives: iGive, bGives: theyGive, maxSwaps: maxSwapsPerUser });
    if (!swaps.length) continue;

    const score = scoreSwaps(swaps);

    recs.push({
      user: o.user,
      score,
      swapCount: swaps.length,
      maxPriority: Math.max(
        ...swaps.map((s) => s.score || 0)
      )
    });
  }

  recs.sort((a, b) => (b.score - a.score) || (b.maxPriority - a.maxPriority) || (b.swapCount - a.swapCount));
  return recs.slice(0, maxUsers);
}

module.exports = { recommendUsers };
