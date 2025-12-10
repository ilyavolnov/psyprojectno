require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:8080',
        'https://dr-rumyantceva.ru',
        process.env.FRONTEND_URL || ''
    ].filter(Boolean),  // Filter out empty strings
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup for CSRF protection
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_key_change_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production' ? true : false,  // true in production (requires HTTPS)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware to generate CSRF token
app.use((req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = generateCsrfToken();
    }
    res.locals.csrfToken = req.session.csrfToken;

    // Set CSRF header for API endpoints
    if (req.url.startsWith('/api/')) {
        res.setHeader('X-CSRF-Token', req.session.csrfToken);
    }

    next();
});

// Function to generate CSRF token
function generateCsrfToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

// Validate CSRF token for sensitive operations
function validateCsrfToken(req, res, next) {
    const csrfToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
    const sessionToken = req.session.csrfToken;

    // Only validate for POST, PUT, DELETE methods
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.path.includes('/admin/')) {
        if (!csrfToken || csrfToken !== sessionToken) {
            return res.status(403).json({
                success: false,
                error: 'CSRF token mismatch'
            });
        }
    }

    next();
}

// Apply CSRF validation to admin routes
app.use('/api/admin/', validateCsrfToken);

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
        const adminAuthRoutes = require('./routes/admin-auth');

        // Routes
        app.use('/api', apiRoutes);
        app.use('/api', requestsRoutes);
        app.use('/api', settingsRoutes);
        app.use('/api', specialistsRoutes);
        app.use('/api', coursesRoutes);
        app.use('/api', supervisionsRoutes);
        app.use('/api', promoCodesRoutes);
        app.use('/api', uploadRoutes);
        app.use('/api', adminAuthRoutes);
        app.use('/api/paykeeper', require('./routes/paykeeper'));

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
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start server
startServer();

// Export app
module.exports = app;
