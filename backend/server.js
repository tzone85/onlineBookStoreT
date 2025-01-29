require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const basicAuth = require('basic-auth');
const bookRoutes = require('./routes/bookRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
    origin: ['http://localhost:4204', 'http://localhost:4203'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(express.json());

// Basic Authentication Middleware
const auth = (req, res, next) => {
    const user = basicAuth(req);
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!user || user.name !== username || user.pass !== password) {
        res.set('WWW-Authenticate', 'Basic realm="Authorization Required"');
        return res.status(401).send('Authentication required.');
    }
    next();
};

// Welcome route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Online Book Store API' });
});

// Protected routes
app.use('/api/books', auth, bookRoutes);
app.use('/api/orders', auth, orderRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });
