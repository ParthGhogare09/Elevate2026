import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // MongoDB connection helper

// Route Imports
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import workshopRoutes from './routes/workshops.js';
import registrationRoutes from './routes/registrations.js';
import attendanceRoutes from './routes/attendance.js';
import announcementRoutes from './routes/announcements.js';

dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Middleware configuration
app.use(cors({
  origin: '*', // For development flexibility; restrict in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Folders (Expose uploads to frontend)
const uploadsPath = path.join(process.cwd(), 'uploads');

app.use('/uploads', express.static(uploadsPath));

// API Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);

// Base route checker
app.get('/', (req, res) => {
  res.json({ message: 'Elevate 2026 Full-Stack API is running!' });
});

// Custom 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
