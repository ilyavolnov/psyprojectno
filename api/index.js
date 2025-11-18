// Vercel Serverless Function Entry Point
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase } = require('../backend/database');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
let initialized = false;
async function ensureInitialized() {
    if (!initialized) {
        await initDatabase();
        initialized = true;
    }
}

// Load routes
const apiRoutes = require('../backend/routes/api');
const requestsRoutes = require('../backend/routes/requests');
const settingsRoutes = require('../backend/routes/settings');
const specialistsRoutes = require('../backend/routes/specialists');
const coursesRoutes = require('../backend/routes/courses');
const supervisionsRoutes = require('../backend/routes/supervisions');
const promoCodesRoutes = require('../backend/routes/promo-codes');
const uploadRoutes = require('../backend/routes/upload');

// Routes
app.use('/api', apiRoutes);
app.use('/api', requestsRoutes);
app.use('/api', settingsRoutes);
app.use('/api', specialistsRoutes);
app.use('/api', coursesRoutes);
app.use('/api', supervisionsRoutes);
app.use('/api', promoCodesRoutes);
app.use('/api', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Vercel serverless function handler
module.exports = async (req, res) => {
    await ensureInitialized();
    return app(req, res);
};
