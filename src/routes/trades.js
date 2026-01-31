const express = require('express');
const authMiddleware = require('../middlewares/auth');
const tradesController = require('../controllers/tradesController');

const router = express.Router();

router.get('/users', authMiddleware, tradesController.listUsersForTrading);
router.get('/matches/:otherUserId', authMiddleware, tradesController.matchesValidation, tradesController.getMatchesWithUser);

router.get('/', authMiddleware, tradesController.listTrades);
router.post('/', authMiddleware, tradesController.createTradeValidation, tradesController.createTrade);

router.get('/:id', authMiddleware, tradesController.getTradeValidation, tradesController.getTrade);
router.post('/:id/respond', authMiddleware, tradesController.respondValidation, tradesController.respondToTrade);
router.post('/:id/messages', authMiddleware, tradesController.createMessageValidation, tradesController.createMessage);

module.exports = router;
