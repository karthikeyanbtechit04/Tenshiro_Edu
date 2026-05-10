const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
require('dotenv').config();
const db = require('./config/db');

const app = express();

// ✅ Middleware FIRST - correct order
app.use(cors({
 origin: [
      'https://tenshiro-edu.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'capacitor://localhost',
    'http://localhost'
  ],
    credentials: true
}));
app.use(helmet());
app.use(express.json());

// ✅ Passport
require('./config/passport')(passport);
app.use(passport.initialize());

// ✅ Test Route
app.get("/", (req, res) => {
    res.json({ message: "Backend is  running! 🚀" });
});

// ✅ Routes
const apiRoutes = require('./routes/api');
const aptitudeRoutes = require('./routes/aptitudeRoutes');
app.use('/api', apiRoutes);
app.use('/api/aptitude', aptitudeRoutes);

// ✅ DB Test
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ message: 'Database connected', result: rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    setTimeout(() => process.exit(1), 1000);
});