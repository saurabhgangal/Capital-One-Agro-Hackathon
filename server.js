const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// MongoDB Connection
const database = require('./src/config/database');

// Connect to MongoDB
async function connectDatabase() {
    try {
        await database.connect();
        console.log('✅ MongoDB connected successfully');
        console.log('🗄️ Database: MongoDB Atlas');
        console.log('📊 Models: User, Chat, Crop');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('⚠️ Running in demo mode without database');
    }
}

// Initialize database connection
connectDatabase();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const aiRoutes = require('./src/routes/ai');
const marketRoutes = require('./src/routes/market');
const creditRoutes = require('./src/routes/credit');
const { router: whatsappRoutes } = require('./src/routes/whatsapp');
const userRoutes = require('./src/routes/user');
const irrigationRoutes = require('./src/routes/irrigation');
        const customDataRoutes = require('./src/routes/custom-data');
        const schemesRoutes = require('./src/routes/schemes');

        // Routes
        app.use('/api/ai', aiRoutes);
        app.use('/api/market', marketRoutes);
        app.use('/api/credit', creditRoutes);
        app.use('/api/whatsapp', whatsappRoutes);
        app.use('/api/user', userRoutes);
        app.use('/api/irrigation', irrigationRoutes);
        app.use('/api/custom-data', customDataRoutes);
        app.use('/api/schemes', schemesRoutes);

// Socket.IO for real-time chat and notifications
io.on('connection', (socket) => {
  console.log('👨‍🌾 Farmer connected:', socket.id);
  
  socket.on('join-chat', (data) => {
    socket.join(data.room);
    console.log(`Farmer ${socket.id} joined room: ${data.room}`);
  });
  
  socket.on('chat-message', (data) => {
    io.to(data.room).emit('chat-message', data);
  });
  
  socket.on('crop-alert', (data) => {
    io.emit('crop-alert', data);
  });
  
  socket.on('market-update', (data) => {
    io.emit('market-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('👨‍🌾 Farmer disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '🚜 Kisan AI Assistant is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: database.isConnected ? 'Connected' : 'Demo Mode'
  });
});

// Serve the main app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚜 Kisan AI Assistant running on port ${PORT}`);
  console.log(`🌾 Agriculture AI powered by Capital One Hackathon Team`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Access the app at: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io }; 