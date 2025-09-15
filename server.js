// server.js
const express = require('express');
const path = require('path'); 
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const User = require("./models/User"); 

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

const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    // Attach decoded payload to req.user
    req.user = decoded;
    // Log to confirm
    console.log("Decoded token payload:", decoded);   

    next();
  });
}

app.use(cors({
  origin: "*", // or restrict to your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



// optional: an authenticated endpoint for frontend to test token
const { authMiddleware } = require('./middleware/authMiddleware');
app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ✅ Verify password endpoint (no bcrypt)
// Verify password route
app.post("/api/user/verify-password", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // comes from decoded token
    const { password } = req.body;

    console.log("verify-password called for userId:", userId);
    console.log("Entered password:", password);

    if (!userId) {
      return res.status(400).json({ error: "User ID missing from token" });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      console.log("User not found in DB");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Stored password:", user.password);

    if (user.password === password) {
      console.log("Password match ✅");
      return res.json({ success: true });
    } else {
      console.log("Password mismatch ❌");
      return res.status(401).json({ error: "Invalid password" });
    }
  } catch (err) {
    console.error("Error in /verify-password:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
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

  