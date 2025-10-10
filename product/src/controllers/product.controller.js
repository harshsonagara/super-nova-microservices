const productModel = require('../models/product.model');
const { uploadImage } = require('../services/imagekit.service')

async function createProduct(req, res) {
    try {
        const { title, description, priceAmount, priceCurrency = 'INR' } = req.body;

        let seller = req.user.id;
        console.log("seller : ", seller);

        const price = {
            amount: Number(priceAmount),
            currency: priceCurrency
        }

        const images = await Promise.all((req.files || []).map(file => uploadImage({ buffer: file.buffer })))

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
        console.error('Create product error', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createProduct
}