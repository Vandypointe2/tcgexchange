const express = require('express');
const cardsController = require('../controllers/cardsController');

const router = express.Router();

// Card Search Endpoint (external API)
router.post(
  '/search',
  cardsController.searchValidation,
  cardsController.searchCards
);

// Local search endpoint (CardCache)
router.post(
  '/search_local',
  cardsController.searchValidation,
  cardsController.searchCardsLocal
);

// List sets from local CardCache
router.get('/sets_local', cardsController.listSetsLocal);

// Bulk lookup endpoint (prefer local CardCache; external fallback for misses)
router.post('/bulk', cardsController.getCardsByIds);

router.get('/local/:id', cardsController.getCardByIdLocal);

router.get(
  '/:id',
  cardsController.getCardById
);

module.exports = router;
