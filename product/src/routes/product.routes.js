const express = require('express');
const router = express.Router();
const multer = require('multer');

const productController = require('../controllers/product.controller');
const createAuthMiddleware = require('../middlewares/auth.middleware');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/products/
router.post('/',
    createAuthMiddleware(['admin', 'seller']),
    productController.createProduct
);



module.exports = router;