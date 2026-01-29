const express = require('express');
const authMiddleware = require('../middlewares/auth');
const collectionController = require('../controllers/collectionController');

const router = express.Router();

router.get('/', authMiddleware, collectionController.list);
router.post('/', authMiddleware, collectionController.add);
router.put('/:id', authMiddleware, collectionController.update);
router.delete('/:id', authMiddleware, collectionController.remove);

module.exports = router;
