const { WishlistItem } = require('../../models');

const VALID_CONDITIONS = new Set(['NM', 'LP', 'MP', 'HP', 'DMG']);

exports.list = async (req, res) => {
  try {
    const items = await WishlistItem.findAll({
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
    const {
      cardId,
      minCondition = 'LP',
      quantityDesired = 1,
      priority = 3,
      notes = null
    } = req.body;

    if (!cardId) return res.status(400).json({ error: 'cardId required' });
    if (!VALID_CONDITIONS.has(minCondition)) return res.status(400).json({ error: 'invalid minCondition' });

    const qty = Number(quantityDesired);
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: 'quantityDesired must be integer >= 1' });

    const pri = Number(priority);
    if (!Number.isInteger(pri) || pri < 1 || pri > 5) return res.status(400).json({ error: 'priority must be 1..5' });

    // If same cardId exists, bump desired quantity and keep best (lowest number) priority
    const existing = await WishlistItem.findOne({
      where: { userId: req.user.userId, cardId }
    });

    if (existing) {
      existing.quantityDesired += qty;
      existing.priority = Math.min(existing.priority, pri);
      if (notes) existing.notes = notes;
      if (minCondition) existing.minCondition = minCondition;
      await existing.save();
      return res.json({ item: existing, merged: true });
    }

    const item = await WishlistItem.create({
      userId: req.user.userId,
      cardId,
      minCondition,
      quantityDesired: qty,
      priority: pri,
      notes
    });

    return res.json({ item, merged: false });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { quantityDesired, minCondition, priority, notes } = req.body;

    const item = await WishlistItem.findOne({ where: { id, userId: req.user.userId } });
    if (!item) return res.status(404).json({ error: 'not found' });

    if (minCondition !== undefined) {
      if (!VALID_CONDITIONS.has(minCondition)) return res.status(400).json({ error: 'invalid minCondition' });
      item.minCondition = minCondition;
    }

    if (priority !== undefined) {
      const pri = Number(priority);
      if (!Number.isInteger(pri) || pri < 1 || pri > 5) return res.status(400).json({ error: 'priority must be 1..5' });
      item.priority = pri;
    }

    if (quantityDesired !== undefined) {
      const qty = Number(quantityDesired);
      if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: 'quantityDesired must be integer >= 1' });
      item.quantityDesired = qty;
    }

    if (notes !== undefined) {
      item.notes = notes;
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
    const item = await WishlistItem.findOne({ where: { id, userId: req.user.userId } });
    if (!item) return res.status(404).json({ error: 'not found' });
    await item.destroy();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
