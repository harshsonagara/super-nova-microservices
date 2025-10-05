const express = require('express');
const router = express.Router();
const validators = require('../middlewares/validator.middleware')
const authController = require('../controllers/auth.controller');



// POST /auth/register
router.post('/register', validators.registerValidations, authController.registerUser);

module.exports = router;
