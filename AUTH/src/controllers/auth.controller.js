const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');

async function registerUser(req, res) {

    const { username, email, password, fullName: { firstName, lastName } } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    });

    if (isUserAlreadyExists) {
        return res.status(409).json({ error: "Username or email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash,
        fullName: { firstName, lastName }
    })

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    },
        process.env.JWT_SECRET,
        { expiresIn: '1d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        maxage: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            addresses: user.addresses
        }
    });
}


module.exports = {
    registerUser
}