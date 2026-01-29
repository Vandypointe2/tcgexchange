const { CollectionItem } = require('../../models');

const VALID_CONDITIONS = new Set(['NM', 'LP', 'MP', 'HP', 'DMG']);

exports.list = async (req, res) => {
  try {
    const items = await CollectionItem.findAll({
      where: { userId: req.user.userId },
      order: [['updatedAt', 'DESC']]
    });
    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

exports.add = async (req, res) => {
  try {
    const { cardId, condition = 'NM', quantity = 1 } = req.body;
    if (!cardId) return res.status(400).json({ error: 'cardId required' });
    if (!VALID_CONDITIONS.has(condition)) return res.status(400).json({ error: 'invalid condition' });
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: 'quantity must be integer >= 1' });

    // If same cardId+condition exists, increment quantity
    const existing = await CollectionItem.findOne({
      where: { userId: req.user.userId, cardId, condition }
    });

    if (existing) {
      existing.quantity += qty;
      await existing.save();
      return res.json({ item: existing, merged: true });
    }

    const item = await CollectionItem.create({
      userId: req.user.userId,
      cardId,
      condition,
      quantity: qty
    });

    return res.json({ item, merged: false });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { quantity, condition } = req.body;

    const item = await CollectionItem.findOne({ where: { id, userId: req.user.userId } });
    if (!item) return res.status(404).json({ error: 'not found' });

    if (condition !== undefined) {
      if (!VALID_CONDITIONS.has(condition)) return res.status(400).json({ error: 'invalid condition' });
      item.condition = condition;
    }

    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: 'quantity must be integer >= 1' });
      item.quantity = qty;
    }

    await item.save();
    return res.json({ item });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await CollectionItem.findOne({ where: { id, userId: req.user.userId } });
    if (!item) return res.status(404).json({ error: 'not found' });
    await item.destroy();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
