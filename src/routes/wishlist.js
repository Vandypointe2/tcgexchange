const express = require('express');
const authMiddleware = require('../middlewares/auth');
const wishlistController = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', authMiddleware, wishlistController.list);
router.post('/', authMiddleware, wishlistController.add);
router.put('/:id', authMiddleware, wishlistController.update);
router.delete('/:id', authMiddleware, wishlistController.remove);

module.exports = router;
