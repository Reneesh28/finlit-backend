# FinLit Backend

The **FinLit Backend** is the core API service for the FinLit AI platform. Built with Node.js and Express, it manages user accounts, financial transactions, budgeting logic, and serves as the central hub for the platform's data.

## 🚀 Features

- **User Authentication**: Secure signup and login using JWT and Bcrypt.
- **Financial Management**: CRUD operations for transactions and budgeting.
- **Profile Management**: Personalized financial profiles and preferences.
- **Secure by Design**: Implements Helmet, CORS, and rate limiting for security.
- **Data Persistence**: Robust data modeling with MongoDB and Mongoose.
- **AI Integration Support**: Stores chat history and usage metrics for AI services.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Security**: [Helmet](https://helmetjs.github.io/), [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Validation**: [Express Validator](https://express-validator.github.io/docs/)
- **Utility**: [Dotenv](https://github.com/motdotla/dotenv), [Cookie Parser](https://github.com/expressjs/cookie-parser)

## ⚙️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd finlit-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   # Add other environment variables as needed
   ```

## 🏃 Running the Application

### Development Mode (with Nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will be available at `http://localhost:5000`.

## 📡 API Routes

| Base Path | Description |
|-----------|-------------|
| `/api/auth` | Authentication (Login, Register, Logout) |
| `/api/transactions` | Transaction management (Income/Expenses) |
| `/api/budget` | Budget planning and tracking |
| `/api/profile` | User financial profile and settings |

## 📂 Project Structure

```text
finlit-backend/
├── config/             # Database and app configuration
├── controllers/        # Request handlers and business logic
├── middleware/         # Custom Express middleware (Auth, Error handling)
├── models/             # Mongoose schemas and models
├── routes/             # API route definitions
├── services/           # Reusable business logic layers
├── server.js           # Main entry point
├── .env                # Secret environment variables
└── package.json        # Dependencies and scripts
```

---
Built for the **FinLit AI Platform**.
