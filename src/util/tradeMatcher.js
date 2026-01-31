const CONDITION_RANK = {
  DMG: 1,
  HP: 2,
  MP: 3,
  LP: 4,
  NM: 5
};

function meetsMinCondition(haveCondition, minCondition) {
  const have = CONDITION_RANK[haveCondition] || 0;
  const min = CONDITION_RANK[minCondition] || 0;
  return have >= min;
}

function aggregateCollection(collectionItems, minConditionByCardId = {}) {
  // Returns map cardId -> availableQty that meets min condition.
  const map = {};
  for (const row of collectionItems) {
    const cardId = row.cardId;
    const minCondition = minConditionByCardId[cardId] || 'DMG';
    if (!meetsMinCondition(row.condition, minCondition)) continue;
    map[cardId] = (map[cardId] || 0) + (row.quantity || 0);
  }
  return map;
}

function mapWishlist(wishlistItems) {
  // Returns map cardId -> { quantityDesired, minCondition, priority }
  const map = {};
  for (const w of wishlistItems) {
    map[w.cardId] = {
      quantityDesired: w.quantityDesired,
      minCondition: w.minCondition,
      priority: w.priority
    };
  }
  return map;
}

function computeDirectionalMatches({ fromCollectionItems, toWishlistItems }) {
  // Returns array of { cardId, qty, priority, minCondition }
  const wishlistByCard = mapWishlist(toWishlistItems);
  const minCondByCard = {};
  Object.keys(wishlistByCard).forEach((cardId) => {
    minCondByCard[cardId] = wishlistByCard[cardId].minCondition;
  });

  const availableByCard = aggregateCollection(fromCollectionItems, minCondByCard);

  const matches = [];
  for (const [cardId, wish] of Object.entries(wishlistByCard)) {
    const haveQty = availableByCard[cardId] || 0;
    if (haveQty <= 0) continue;
    const qty = Math.min(haveQty, wish.quantityDesired || 1);
    if (qty <= 0) continue;

    matches.push({
      cardId,
      qty,
      priority: wish.priority,
      minCondition: wish.minCondition
    });
  }

  // higher priority first
  matches.sort((a, b) => (b.priority - a.priority) || (b.qty - a.qty) || a.cardId.localeCompare(b.cardId));
  return matches;
}

function greedyOneToOneSwaps({ aGives, bGives, maxSwaps = 20 }) {
  // aGives: [{cardId, qty, priority}], bGives: same
  // Produces array of swaps { giveCardId, receiveCardId, quantity }

  const aRemain = new Map(aGives.map((x) => [x.cardId, { ...x }]));
  const bRemain = new Map(bGives.map((x) => [x.cardId, { ...x }]));

  // build all candidate pairs with score
  const pairs = [];
  for (const a of aGives) {
    for (const b of bGives) {
      pairs.push({
        giveCardId: a.cardId,
        receiveCardId: b.cardId,
        score: (a.priority || 0) + (b.priority || 0)
      });
    }
  }
  pairs.sort((x, y) => (y.score - x.score)
    || x.giveCardId.localeCompare(y.giveCardId)
    || x.receiveCardId.localeCompare(y.receiveCardId));

  const swaps = [];
  for (const p of pairs) {
    if (swaps.length >= maxSwaps) break;

    const a = aRemain.get(p.giveCardId);
    const b = bRemain.get(p.receiveCardId);
    if (!a || !b) continue;
    if (a.qty <= 0 || b.qty <= 0) continue;

    // do 1-for-1 at a time; group later
    a.qty -= 1;
    b.qty -= 1;
    swaps.push({ giveCardId: p.giveCardId, receiveCardId: p.receiveCardId, quantity: 1, score: p.score });
  }

  // group identical swaps into quantity
  const grouped = new Map();
  for (const s of swaps) {
    const key = `${s.giveCardId}::${s.receiveCardId}`;
    const cur = grouped.get(key);
    if (cur) {
      cur.quantity += 1;
    } else {
      grouped.set(key, { ...s });
    }
  }

  return Array.from(grouped.values());
}

module.exports = {
  computeDirectionalMatches,
  greedyOneToOneSwaps
};
