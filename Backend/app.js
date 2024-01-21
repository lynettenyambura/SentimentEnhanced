const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/errors');

app.use(cors()); // Enable CORS for all routes

app.use(express.json());
app.use(cookieParser());

// Importing all routes
const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');

// Route Prefixing
app.use('/api/v1/products', products);
app.use('/api/v1/auth', auth);
app.use('/api/v1/orders', order);

// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app;
