const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


//** ROUTES */
const productRoutes = require('./routes/product.routes');

app.use('/api/products', productRoutes);

module.exports = app;