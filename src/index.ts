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
import consultancyRoutes from './routes/consultancyRoutes';
import adminRoutes from './routes/adminRoutes';
import blogRoutes from './routes/blogRouter';
// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app: Express = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
// const HOST = "0.0.0.0";


// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'https://pathpr.ca', 'https://admin.pathpr.ca'],
  credentials: true,  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Explicitly handle OPTIONS requests to ensure preflight is allowed
app.options('*', cors());

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
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);

// Chat routes
app.use('/api/chat', chatRoutes);

// Consultancy routes
app.use('/api/consultancy', consultancyRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default app;