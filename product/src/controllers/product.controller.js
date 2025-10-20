const productModel = require('../models/product.model');
const { uploadImage } = require('../services/imagekit.service');
const mongoose = require('mongoose');

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

async function getProducts(req, res) {

    const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;


    const filter = {}

    if (q) {
        filter.$text = { $search: q }
    }

    if (minprice) {
        filter['price.amount'] = { ...filter['price.amount'], $gte: Number(minprice) }
    }

    if (maxprice) {
        filter['price.amount'] = { ...filter['price.amount'], $lte: Number(maxprice) }
    }

    const products = await productModel.find(filter).skip(Number(skip)).limit(Math.min(Number(limit), 20));

    return res.status(200).json({ data: products });

}

async function getProductById(req, res) {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await productModel.findById(id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    return res.status(200).json({
        data: product
    });
}

async function updateProduct(req, res) {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: " Invalid product id"
        });
    }

    const product = await productModel.findOne({
        _id: id,
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    if (product.seller.toString() !== req.user.id) {
        return res.status(403).json({
            message: "Forbidden: you can only update your product"
        })
    }

    const allowedUpdates = ['title', 'description', 'price'];
    for (const key of Object.keys(req.body)) {
        if (allowedUpdates.includes(key)) {
            if (key === 'price' && typeof req.body.price === 'object') {
                if (req.body.price.amount !== undefined) {
                    product.price.amount = Number(req.body.price.amount);
                }
                if (req.body.price.currency !== undefined) {
                    product.price.currency = req.body.price.currency;
                }
            } else {
                product[key] = req.body[key];
            }

        }
    }

    await product.save();
    return res.status(200).json({
        message: "Product updated",
        data: product
    });

}

async function deleteProduct(req, res) {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "Invalid product id"
        });
    }

    const product = await productModel.findOne({
        _id: id,
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    if (product.seller.toString() !== req.user.id) {
        return res.status(403).json({
            message: "Forbidden: You can only delete your own products"
        });
    }

    await product.deleteOne();
    return res.status(200).json({
        message: "product deleted successfully"
    });
}

async function getSeller(req, res) {

    try {
        const sellerId = req.user.id; // from JWT payload
        const { skip = 0, limit = 10 } = req.query;

        const products = await productModel
            .find({ seller: sellerId })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        return res.status(200).json({
            data: products
        });
    } catch (error) {
        console.error('Error in getSeller:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }

}


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getSeller
}