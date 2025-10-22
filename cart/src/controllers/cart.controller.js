const cartModel = require('../models/cart.model');

async function addItemToCart(req, res) {

    const { productId, quantity } = req.body;

    const user = req.user;

    let cart = await cartModel.findOne({ user: user._id });

    if (!cart) {
        cart = new cartModel({ user: user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        cart.items.push({ productId, quantity });
    }

    await cart.save();

    return res.status(200).json({
        message: 'Item added to cart successfully',
        cart
    });
}

module.exports = {
    addItemToCart,
};