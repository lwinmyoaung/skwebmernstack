const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach socket.io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Cookie parser
app.use(cookieParser());

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('joinAdmin', () => {
    socket.join('admin');
    console.log('Admin joined admin room');
  });

  // Client-side notification to refresh UI (e.g. after reading messages)
  socket.on('refreshNotifications', (userId) => {
    if (userId) {
      io.to(userId).emit('unreadCountChanged');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Body parser
app.use(express.json());

// Enable CORS
const envOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...envOrigins
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Route files
const auth = require('./routes/auth');
const products = require('./routes/product');
const orders = require('./routes/order');
const settings = require('./routes/setting');
const gameService = require('./routes/gameService');
const paymentMethods = require('./routes/paymentMethod');
const messages = require('./routes/message');
const slideshows = require('./routes/slideshow');
const gameImages = require('./routes/gameImage');
const contacts = require('./routes/contact');
const howToUse = require('./routes/howToUse');
const games = require('./routes/game');
const logos = require('./routes/logo');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/products', products);
app.use('/api/v1/orders', orders);
app.use('/api/v1/settings', settings);
app.use('/api/v1/game', gameService);
app.use('/api/v1/payment-methods', paymentMethods);
app.use('/api/v1/messages', messages);
app.use('/api/v1/slideshows', slideshows);
app.use('/api/v1/game-images', gameImages);
app.use('/api/v1/contacts', contacts);
app.use('/api/v1/how-to-use', howToUse);
app.use('/api/v1/games', games);
app.use('/api/v1/logos', logos);

// Set static folder
const frontendPublicPath = path.join(__dirname, '../frontend/public');
app.use('/uploads', express.static(path.join(frontendPublicPath, 'uploads')));

// Production configuration
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(buildPath));
  
  // FIXED: Express 5 requires a named parameter for catch-all
  app.get('*all', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
