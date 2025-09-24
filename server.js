import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configurations and utilities
import { connectDB } from './backend/config/database.js';
import { config } from './backend/config/config.js';
import { errorHandler } from './backend/middleware/errorHandler.js';

// Import routes
import authRoutes from './backend/routes/authRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';
import userRoutes from './backend/routes/userRoutes.js';
import propertyRoutes from './backend/routes/propertyRoutes.js';
import dashboardRoutes from './backend/routes/dashboardRoutes.js';
import staffRoutes from './backend/routes/staffRoutes.js';
import subscriptionRoutes from './backend/routes/subscriptionRoutes.js';
import paymentRoutes from './backend/routes/paymentRoutes.js';
// import propertyCategoryRoutes from './routes/propertyCategoryRoutes.js'
import propertyCategoryRoutes from './backend/routes/propertyCategoryRoutes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/staff', staffRoutes);
app.use('/api/admin/subscriptions', subscriptionRoutes);
app.use('/api/admin/payments', paymentRoutes);

app.use('/api/property-categories', propertyCategoryRoutes)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
});

export default app;