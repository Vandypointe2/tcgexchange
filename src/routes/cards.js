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

// Bulk lookup endpoint (prefer local CardCache)
router.post('/bulk', cardsController.getCardsByIds);

router.get(
  '/:id',
  cardsController.getCardById
);

module.exports = router;
