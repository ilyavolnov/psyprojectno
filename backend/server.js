require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database and start server
async function startServer() {
    try {
        await initDatabase();
        
        // Load routes after database is initialized
        const apiRoutes = require('./routes/api');
        const requestsRoutes = require('./routes/requests');
        const settingsRoutes = require('./routes/settings');
        const specialistsRoutes = require('./routes/specialists');
        const coursesRoutes = require('./routes/courses');
        const supervisionsRoutes = require('./routes/supervisions');
        const promoCodesRoutes = require('./routes/promo-codes');
        const uploadRoutes = require('./routes/upload');
        const { loadBotFromSettings } = require('./bot');
        
        // Load bot from database settings
        loadBotFromSettings();
        
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
        app.get('/health', (req, res) => {
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

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Telegram bot is active`);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n👋 Shutting down gracefully...');
            const { stopBot } = require('./bot');
            stopBot();
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start server only if not in Vercel environment
if (process.env.VERCEL !== '1') {
    startServer();
}

// Export app for Vercel
module.exports = app;
