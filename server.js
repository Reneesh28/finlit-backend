require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');

const app = express();

// 🔐 Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const PORT = process.env.PORT || 5000;

// 🗄️ DB Connection
const connectDB = require('./config/db');
connectDB();

// 📁 Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/TransactionRouters');
const budgetRoutes = require('./routes/BudgetRoutes');
const profileRoutes = require('./routes/ProfileRoutes');
const chatRoutes = require('./routes/chatRoutes');
const insightRoutes = require('./routes/insightRoutes');

// 🚀 Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/insights', insightRoutes);

// 🏠 Health Check
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// 🚀 Server Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});