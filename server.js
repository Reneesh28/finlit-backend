require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// 🔐 Security Headers
app.use(helmet());

// 🌐 CORS (frontend → backend)
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
);

// 🔥 Manual Preflight Handling (safe for Express v5+)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// 🧾 Body Parser
app.use(express.json());

// 🍪 Cookie Parser
app.use(cookieParser());

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
const quizRoutes = require('./routes/quizRoutes');

// 🚀 Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/quiz', quizRoutes);

// 🏠 Health Check
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// 🚀 Server Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});