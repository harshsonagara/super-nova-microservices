const express = require('express');
const router = express.Router();

const { createProduct } = require('../controllers/product.controller');
const { createProductValidation } = require('../validators/product.validators');
const createAuthMiddleware = require('../middlewares/auth.middleware');


const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


// POST /api/products/
router.post('/',
    createAuthMiddleware(['admin', 'seller']),
    upload.array('images', 5),
    createProductValidation,
    createProduct
);


module.exports = router;