const productModel = require('../models/product.model');


async function createProduct(req, res) {
    try {
        const { title, description, priceAmount, priceCurrency = 'INR' } = req.body;

        let seller = req.user.id;

        const price = {
            amount: Number(priceAmount),
            currency: priceCurrency
        }

        if (!title || !amount) {
            return res.status(400).json({
                message: "title , priceamount are required",
            });
        }

        const product = await productModel.create({
            title,
            description,
            price,
            seller,
            images
        });


        return res.status(201).json({
            message: 'Product created',
            data: product,
        });

    } catch (error) {
        console.error('Create product error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createProduct
}