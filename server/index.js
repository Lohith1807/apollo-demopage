import express from 'express';
import dns from 'dns';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import attendanceRoutes from './routes/attendance.js';
import adminRoutes from './routes/admin.js';
import resultRoutes from './routes/results.js';
import postsRoutes from './routes/posts.js';
import institutionRoutes from './routes/institution.js';
import academicRoutes from './routes/academic.js';
import financeRoutes from './routes/finance.js';

import mongoose from 'mongoose';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly point to .env in the server folder
dotenv.config({ path: path.join(__dirname, '.env') });

// Fix for Atlas SRV resolution - consistent across envs
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is MISSING in environment variables.');
    if (process.env.VERCEL) {
        console.error('👉 Tip: Add MONGODB_URI to your Vercel Project Settings -> Environment Variables.');
    }
}

// ─── MongoDB Connection with Retry & Event Handling ───────────────────────────
let cachedDb = null;

const connectDB = async (retries = 3) => {
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (!MONGODB_URI) {
        console.error('🚫 Cannot connect: MONGODB_URI is undefined.');
        return null;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`📡 Connecting to MongoDB (Attempt ${attempt})...`);
            await mongoose.connect(MONGODB_URI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log(`✅ Connected to MongoDB Atlas`);
            return mongoose.connection;
        } catch (err) {
            console.error(`❌ Connection attempt ${attempt} failed:`, err.message);
            if (attempt < retries) {
                await new Promise(res => setTimeout(res, 2000));
            }
        }
    }
    return null;
};
const app = express();

// ─── Middleware for Serverless Connection ─────────────────────────────────────
// Ensures DB is connected before handling any request, crucial for cold starts.
const ensureDB = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState < 1) {
            const conn = await connectDB();
            if (!conn) {
                return res.status(500).json({
                    success: false,
                    message: 'Database connection failed. Please check MONGODB_URI and Network Access (Whitelist 0.0.0.0/0).'
                });
            }
        }
        next();
    } catch (err) {
        console.error('ensureDB Error:', err);
        res.status(500).json({ success: false, message: 'Internal server error during DB connection' });
    }
};

app.use(ensureDB);

// Connection event listeners for monitoring
mongoose.connection.on('connected', () => {
    console.log('📡 Mongoose connected to apollo_db');
});
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Mongoose disconnected from MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err.message);
});

// ─── Middleware ────────────────────────────────────────────────────────────────

// CORS configuration — credentials: true requires specific origins (not '*')
const allowedOrigins = [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://apollo-demopage.vercel.app',
    process.env.FRONTEND_URL  // Production URL from env
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Fallback: allow in development
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads/posts');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Static route for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: 'running',
        service: 'Apollo University Portal API',
        database: dbState[mongoose.connection.readyState] || 'unknown',
        dbName: 'apollo_db',
        timestamp: new Date().toISOString()
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/finance', financeRoutes);

// ─── 404 Handler for unknown API routes ───────────────────────────────────────
app.use('/api/{*path}', (req, res) => {
    res.status(404).json({ success: false, message: `API route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;

// Export for Vercel
export default app;

// Start server only if not importing (i.e. running via node index.js)
if (process.env.VITE_RUN_LOCAL === 'true' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Global Error Handling to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
