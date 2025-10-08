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
router.get('/logout', authController.logoutUser);


// GET /auth/users/me/addresses
router.get('/users/me/addresses', authMiddlewares.authMiddleware, authController.getUserAddresses);

// POST /auth/users/me/addresses
router.post('/users/me/addresses',validators.addUserAddressValidations, authMiddlewares.authMiddleware,  authController.addUserAddress);

// DELETE /auth/users/me/addresses/:addressId
router.delete('/users/me/addresses/:addressId', authMiddlewares.authMiddleware, authController.deleteUserAddress);

module.exports = router;
