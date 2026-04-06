require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');
connectDB();

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/TransactionRouters');
const budgetRoutes = require('./routes/BudgetRoutes');
const profileRoutes = require('./routes/ProfileRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/profile', profileRoutes);



app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
