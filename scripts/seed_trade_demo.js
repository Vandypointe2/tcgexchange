/* eslint-disable no-console */

// Seeds two demo users + small demo card cache entries + collection/wishlist
// so the trading UI has guaranteed matches.
//
// Usage:
//   node scripts/seed_trade_demo.js

require('dotenv').config();

const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  CardCache,
  CollectionItem,
  WishlistItem
} = require('../models');

async function ensureUser(username, password) {
  const existing = await User.findOne({ where: { username } });
  if (existing) return existing;

  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({ username, password: hashedPassword });
}

async function upsertDemoCards() {
  const cards = [
    { id: 'demo-pikachu', name: 'Pikachu (Demo)', setName: 'Demo Set', number: '001' },
    { id: 'demo-charizard', name: 'Charizard (Demo)', setName: 'Demo Set', number: '002' },
    { id: 'demo-mewtwo', name: 'Mewtwo (Demo)', setName: 'Demo Set', number: '003' },
    { id: 'demo-bulbasaur', name: 'Bulbasaur (Demo)', setName: 'Demo Set', number: '004' }
  ];

  for (const c of cards) {
    await CardCache.upsert({
      id: c.id,
      name: c.name,
      setId: 'demo',
      setName: c.setName,
      number: c.number,
      imageSmall: null,
      imageLarge: null
    });
  }

  return cards;
}

async function resetInventoryForUser(userId) {
  await CollectionItem.destroy({ where: { userId } });
  await WishlistItem.destroy({ where: { userId } });
}

async function main() {
  await sequelize.authenticate();

  console.log('Upserting demo cards...');
  await upsertDemoCards();

  console.log('Ensuring demo users...');
  const alice = await ensureUser('alice', 'password123');
  const bob = await ensureUser('bob', 'password123');

  console.log('Resetting demo users inventory...');
  await resetInventoryForUser(alice.id);
  await resetInventoryForUser(bob.id);

  console.log('Seeding collections...');
  await CollectionItem.bulkCreate([
    { userId: alice.id, cardId: 'demo-charizard', condition: 'NM', quantity: 1 },
    { userId: alice.id, cardId: 'demo-bulbasaur', condition: 'LP', quantity: 1 },

    { userId: bob.id, cardId: 'demo-pikachu', condition: 'NM', quantity: 1 },
    { userId: bob.id, cardId: 'demo-mewtwo', condition: 'NM', quantity: 1 }
  ]);

  console.log('Seeding wishlists...');
  await WishlistItem.bulkCreate([
    // Alice wants what Bob has
    { userId: alice.id, cardId: 'demo-pikachu', minCondition: 'LP', quantityDesired: 1, priority: 5 },
    { userId: alice.id, cardId: 'demo-mewtwo', minCondition: 'LP', quantityDesired: 1, priority: 4 },

    // Bob wants what Alice has
    { userId: bob.id, cardId: 'demo-charizard', minCondition: 'LP', quantityDesired: 1, priority: 5 },
    { userId: bob.id, cardId: 'demo-bulbasaur', minCondition: 'DMG', quantityDesired: 1, priority: 3 }
  ]);

  console.log('Done. Demo accounts:');
  console.log('- alice / password123');
  console.log('- bob   / password123');

  await sequelize.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
