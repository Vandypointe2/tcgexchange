const express = require('express');
const cardsController = require('../controllers/cardsController');

const router = express.Router();

// Card Search Endpoint
router.post(
  '/search',
  cardsController.searchValidation,
  cardsController.searchCards
);

// Bulk lookup endpoint (for local CardCache + fallback)
router.post('/bulk', cardsController.getCardsByIds);

router.get(
  '/:id',
  cardsController.getCardById
);

module.exports = router;
