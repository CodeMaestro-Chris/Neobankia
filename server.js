// server.js
const express = require('express');
const path = require('path'); 
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', userRoutes);

// static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');


app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// optional: an authenticated endpoint for frontend to test token
const { authMiddleware } = require('./middleware/authMiddleware');
app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 4000, () => console.log('Server listening'));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

  