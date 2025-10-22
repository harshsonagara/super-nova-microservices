const express = require('express');
const cookieParser = require('cookie-parser');


const app = express();



app.use(express.json());
app.use(cookieParser());


//** Cart Routes */
const cartRoutes = require('./routes/cart.routes');
app.use('/api/cart', cartRoutes);









module.exports = app;