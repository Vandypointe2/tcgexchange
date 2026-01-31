const { validationResult } = require('express-validator');
const { body, param } = require('express-validator');

const {
  User,
  CollectionItem,
  WishlistItem,
  CardCache,
  Trade,
  TradeItem,
  TradeMessage,
  TradeUserState
} = require('../../models');

const { computeDirectionalMatches, greedyOneToOneSwaps } = require('../util/tradeMatcher');
const { recommendUsers } = require('../util/tradeRecommender');

async function cardMapForIds(cardIds) {
  if (!cardIds.length) return {};
  const rows = await CardCache.findAll({
    where: { id: cardIds },
    attributes: ['id', 'name', 'setName', 'number', 'imageSmall']
  });
  const map = {};
  rows.forEach((r) => { map[r.id] = r; });
  return map;
}

exports.listUsersForTrading = async (req, res) => {
  const userId = req.user.userId;
  // eslint-disable-next-line global-require
  const { Op } = require('sequelize');

  const users = await User.findAll({
    where: { id: { [Op.ne]: userId } },
    attributes: ['id', 'username', 'avatarUrl']
  });
  res.json({ users });
};

// Recommend best trading partners based on mutual matches
exports.getRecommendations = async (req, res) => {
  const myUserId = req.user.userId;
  const limit = Math.min(parseInt(req.query.limit || '20', 10) || 20, 50);

  // eslint-disable-next-line global-require
  const { Op } = require('sequelize');

  const [meCollection, meWishlist, otherUsers] = await Promise.all([
    CollectionItem.findAll({ where: { userId: myUserId } }),
    WishlistItem.findAll({ where: { userId: myUserId } }),
    User.findAll({ where: { id: { [Op.ne]: myUserId } }, attributes: ['id', 'username', 'avatarUrl'] })
  ]);

  // Load other users' inventory in parallel
  const others = await Promise.all(otherUsers.map(async (u) => {
    const [collection, wishlist] = await Promise.all([
      CollectionItem.findAll({ where: { userId: u.id } }),
      WishlistItem.findAll({ where: { userId: u.id } })
    ]);
    return { user: u, collection, wishlist };
  }));

  const recs = recommendUsers({ myCollection: meCollection, myWishlist: meWishlist, others, maxUsers: limit });

  res.json({ recommendations: recs });
};

exports.matchesValidation = [
  param('otherUserId').isInt({ min: 1 }).withMessage('otherUserId must be an integer')
];

exports.getMatchesWithUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const myUserId = req.user.userId;
  const otherUserId = parseInt(req.params.otherUserId, 10);
  if (myUserId === otherUserId) return res.status(400).json({ error: 'Cannot match with yourself' });

  const otherUser = await User.findByPk(otherUserId, { attributes: ['id', 'username', 'avatarUrl'] });
  if (!otherUser) return res.status(404).json({ error: 'User not found' });

  const [myCollection, myWishlist, otherCollection, otherWishlist] = await Promise.all([
    CollectionItem.findAll({ where: { userId: myUserId } }),
    WishlistItem.findAll({ where: { userId: myUserId } }),
    CollectionItem.findAll({ where: { userId: otherUserId } }),
    WishlistItem.findAll({ where: { userId: otherUserId } })
  ]);

  const iGive = computeDirectionalMatches({ fromCollectionItems: myCollection, toWishlistItems: otherWishlist });
  const theyGive = computeDirectionalMatches({ fromCollectionItems: otherCollection, toWishlistItems: myWishlist });

  const suggestedSwaps = greedyOneToOneSwaps({ aGives: iGive, bGives: theyGive, maxSwaps: 30 });

  const cardIds = Array.from(new Set([
    ...iGive.map((x) => x.cardId),
    ...theyGive.map((x) => x.cardId)
  ]));
  const cardsById = await cardMapForIds(cardIds);

  const decorate = (x) => ({
    ...x,
    card: cardsById[x.cardId] ? {
      id: cardsById[x.cardId].id,
      name: cardsById[x.cardId].name,
      setName: cardsById[x.cardId].setName,
      number: cardsById[x.cardId].number,
      imageSmall: cardsById[x.cardId].imageSmall
    } : { id: x.cardId, name: x.cardId }
  });

  res.json({
    otherUser,
    iGive: iGive.map(decorate),
    theyGive: theyGive.map(decorate),
    suggestedSwaps: suggestedSwaps.map((s) => ({
      ...s,
      give: decorate({ cardId: s.giveCardId }).card,
      receive: decorate({ cardId: s.receiveCardId }).card
    }))
  });
};

exports.createTradeValidation = [
  body('recipientId').isInt({ min: 1 }).withMessage('recipientId required'),
  body('swaps').isArray({ min: 1 }).withMessage('swaps must be a non-empty array'),
  body('swaps.*.giveCardId').isString().withMessage('giveCardId required'),
  body('swaps.*.receiveCardId').isString().withMessage('receiveCardId required'),
  body('swaps.*.quantity').optional().isInt({ min: 1 }).withMessage('quantity must be >= 1'),
  body('note').optional().isString()
];

exports.createTrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const myUserId = req.user.userId;
  const { recipientId, swaps, note } = req.body;
  const otherUserId = parseInt(recipientId, 10);

  if (myUserId === otherUserId) return res.status(400).json({ error: 'Cannot trade with yourself' });
  const otherUser = await User.findByPk(otherUserId);
  if (!otherUser) return res.status(404).json({ error: 'Recipient not found' });

  const trade = await Trade.create({ proposerId: myUserId, recipientId: otherUserId, status: 'PROPOSED' });

  const items = [];
  for (const s of swaps) {
    const qty = parseInt(s.quantity || 1, 10);
    items.push({
      tradeId: trade.id,
      fromUserId: myUserId,
      toUserId: otherUserId,
      cardId: s.giveCardId,
      quantity: qty
    });
    items.push({
      tradeId: trade.id,
      fromUserId: otherUserId,
      toUserId: myUserId,
      cardId: s.receiveCardId,
      quantity: qty
    });
  }
  await TradeItem.bulkCreate(items);

  if (note && String(note).trim() !== '') {
    await TradeMessage.create({ tradeId: trade.id, senderId: myUserId, message: String(note).trim() });
  }

  const full = await Trade.findByPk(trade.id, {
    include: [
      { model: TradeItem, as: 'items' },
      { model: TradeMessage, as: 'messages', include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }] }
    ]
  });

  res.status(201).json({ trade: full });
};

exports.listTrades = async (req, res) => {
  const myUserId = req.user.userId;
  // eslint-disable-next-line global-require
  const { Op } = require('sequelize');

  const hiddenRows = await TradeUserState.findAll({ where: { userId: myUserId, hidden: true }, attributes: ['tradeId'] });
  const hiddenTradeIds = hiddenRows.map((r) => r.tradeId);

  const trades = await Trade.findAll({
    where: {
      [Op.and]: [
        { [Op.or]: [{ proposerId: myUserId }, { recipientId: myUserId }] },
        ...(hiddenTradeIds.length ? [{ id: { [Op.notIn]: hiddenTradeIds } }] : [])
      ]
    },
    order: [['updatedAt', 'DESC']],
    include: [
      { model: User, as: 'proposer', attributes: ['id', 'username'] },
      { model: User, as: 'recipient', attributes: ['id', 'username'] }
    ]
  });

  res.json({ trades });
};

exports.hideTradeValidation = [
  param('id').isInt({ min: 1 }).withMessage('id must be an integer')
];

exports.hideTrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const myUserId = req.user.userId;
  const tradeId = parseInt(req.params.id, 10);

  const trade = await Trade.findByPk(tradeId);
  if (!trade) return res.status(404).json({ error: 'Trade not found' });
  if (trade.proposerId !== myUserId && trade.recipientId !== myUserId) return res.status(403).json({ error: 'Not allowed' });

  const [row] = await TradeUserState.findOrCreate({
    where: { tradeId, userId: myUserId },
    defaults: { hidden: true }
  });

  if (!row.hidden) {
    row.hidden = true;
    await row.save();
  }

  res.json({ ok: true });
};

exports.getTradeValidation = [
  param('id').isInt({ min: 1 }).withMessage('id must be an integer')
];

exports.getTrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const myUserId = req.user.userId;
  const tradeId = parseInt(req.params.id, 10);

  const trade = await Trade.findByPk(tradeId, {
    include: [
      { model: User, as: 'proposer', attributes: ['id', 'username', 'avatarUrl'] },
      { model: User, as: 'recipient', attributes: ['id', 'username', 'avatarUrl'] },
      { model: TradeItem, as: 'items' },
      { model: TradeMessage, as: 'messages', include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }], order: [['createdAt', 'ASC']] }
    ]
  });

  if (!trade) return res.status(404).json({ error: 'Trade not found' });
  if (trade.proposerId !== myUserId && trade.recipientId !== myUserId) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  const cardIds = Array.from(new Set(trade.items.map((i) => i.cardId)));
  const cardsById = await cardMapForIds(cardIds);

  const items = trade.items.map((i) => ({
    id: i.id,
    tradeId: i.tradeId,
    fromUserId: i.fromUserId,
    toUserId: i.toUserId,
    cardId: i.cardId,
    quantity: i.quantity,
    card: cardsById[i.cardId] ? {
      id: cardsById[i.cardId].id,
      name: cardsById[i.cardId].name,
      setName: cardsById[i.cardId].setName,
      number: cardsById[i.cardId].number,
      imageSmall: cardsById[i.cardId].imageSmall
    } : { id: i.cardId, name: i.cardId }
  }));

  res.json({
    trade: {
      id: trade.id,
      proposerId: trade.proposerId,
      recipientId: trade.recipientId,
      status: trade.status,
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
      proposer: trade.proposer,
      recipient: trade.recipient,
      items,
      messages: trade.messages
    }
  });
};

exports.respondValidation = [
  param('id').isInt({ min: 1 }),
  body('action').isIn(['accept', 'decline', 'cancel']).withMessage('action must be accept|decline|cancel')
];

exports.respondToTrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const myUserId = req.user.userId;
  const tradeId = parseInt(req.params.id, 10);
  const { action } = req.body;

  const trade = await Trade.findByPk(tradeId);
  if (!trade) return res.status(404).json({ error: 'Trade not found' });

  if (action === 'cancel') {
    if (trade.proposerId !== myUserId) return res.status(403).json({ error: 'Only proposer can cancel' });
    if (trade.status !== 'PROPOSED') return res.status(400).json({ error: 'Only PROPOSED trades can be cancelled' });
    trade.status = 'CANCELLED';
    await trade.save();
    return res.json({ trade });
  }

  if (trade.recipientId !== myUserId) return res.status(403).json({ error: 'Only recipient can respond' });
  if (trade.status !== 'PROPOSED') return res.status(400).json({ error: 'Trade is not awaiting response' });

  trade.status = action === 'accept' ? 'ACCEPTED' : 'DECLINED';
  await trade.save();
  return res.json({ trade });
};

exports.createMessageValidation = [
  param('id').isInt({ min: 1 }),
  body('message').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('message is required')
];

exports.createMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const myUserId = req.user.userId;
  const tradeId = parseInt(req.params.id, 10);
  const { message } = req.body;

  const trade = await Trade.findByPk(tradeId);
  if (!trade) return res.status(404).json({ error: 'Trade not found' });
  if (trade.proposerId !== myUserId && trade.recipientId !== myUserId) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  const msg = await TradeMessage.create({ tradeId, senderId: myUserId, message: String(message) });
  res.status(201).json({ message: msg });
};
