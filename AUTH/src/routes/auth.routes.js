const express = require('express');
const router = express.Router();
const validators = require('../middlewares/validator.middleware');
const authController = require('../controllers/auth.controller');
const authMiddlewares = require('../middlewares/auth.middleware');



// POST /api/auth/register
router.post('/register', validators.registerValidations, authController.registerUser);

// POST /api/auth/login
router.post('/login', validators.loginValidations, authController.loginUser);

// GET /api/auth/me
router.get('/me', authMiddlewares.authMiddleware, authController.getCrrentUser);

// GET /api/auth/logout
router.get('/logout',authController.logoutUser)

module.exports = router;
