import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db';
import passport from 'passport';
import './config/passport';

// Import routes
import authRoutes from './routes/authRoutes';
import userProfileRoutes from './routes/userProfileRoutes';
import newsRoutes from './routes/newsRoutes';
import reportRoutes from './routes/reportRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import chatRoutes from './routes/chatRouter';
// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app: Express = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "0.0.0.0";

const allowedOrigins = [
  'https://pathpr.ca',
  'https://www.pathpr.ca',
  'http://localhost:5173', // optional, useful for local dev
];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/report', reportRoutes);

// Chat routes
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default app;