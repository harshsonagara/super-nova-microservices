const { body, validationResult } = require('express-validator');


const respondWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    next();
}

const registerValidations = [
    body("username")
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long"),
    body("email")
        .isEmail()
        .withMessage("Invalid email address"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    body("fullName.firstName")
        .isString()
        .withMessage("First name must be a string")
        .notEmpty()
        .withMessage("First name is required"),
    body("fullName.lastName")
        .isString()
        .withMessage("last name must be a string")
        .notEmpty()
        .withMessage("last name is required"),
    respondWithValidationErrors
]

const loginValidations = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email address"),
    body("username")
        .optional()
        .isString()
        .withMessage("Username must be a string"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .notEmpty()
        .withMessage("Password is required"),

    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({ error: "Either email or username is required" })
        }
        next();
    },
    respondWithValidationErrors
]

const addUserAddressValidations = [

    body('street')
        .isString()
        .withMessage('Street must be a string')
        .notEmpty()
        .withMessage('Street is required'),
    body('city')
        .isString()
        .withMessage('city must be a string')
        .notEmpty()
        .withMessage('city is required'),
    body('state')
        .isString()
        .withMessage('sate must be a string')
        .notEmpty()
        .withMessage('state is required'),
    body('pincode')
        .isString()
        .withMessage('pincode must be a string')
        .notEmpty()
        .withMessage('pincode is required')
        .bail()
        .matches(/^\d{4,}$/)
        .withMessage('Pincode must be at least 4 digits'),
    body('country')
        .isString()
        .withMessage('Country must be a string')
        .notEmpty()
        .withMessage('Country is required'),
    body('isDefault')
        .optional()
        .isBoolean()
        .withMessage('isDefault must be a boolean'),
    respondWithValidationErrors
]


module.exports = {
    registerValidations,
    loginValidations,
    addUserAddressValidations
}





