const { body, validationResult } = require('express-validator');


function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation error ", errors
        })
    }
    next()
}


const createProductValidation = [
    body('title')
        .isString()
        .trim()
        .notEmpty()
        .withMessage("title is required"),
    body('description')
        .optional()
        .isString()
        .withMessage("description must be a String")
        .trim()
        .isLength({ max: 500 })
        .withMessage("description max length is 500 characters"),
    body('priceAmount')
        .notEmpty()
        .withMessage("PriceAmount must be a Number")
        .bail()
        .isFloat({ gt: 0 })
        .withMessage("PriceAmount Must be a number >0"),

    body('priceCurrency')
        .optional()
        .isIn(['USD', 'INR'])
        .withMessage("priceCurrency must be USD or INR"),
    handleValidationErrors
]

module.exports = {
    createProductValidation
}