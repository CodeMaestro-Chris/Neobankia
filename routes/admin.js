const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { disableUser, enableUser } = require('../controllers/adminController');
const bcrypt = require('bcryptjs');

// CREATE USER (Admin only)
router.post('/create', async (req, res) => {
  try {
    const {
      fullName, email, username, password, accountNumber,
      dateOfBirth, address, countryOfOrigin,
      gender, maritalStatus, phoneNumber,
      profilePicture, zipCode
    } = req.body;

    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    // Hash password
    // const hashedPassword = password;

    // Create user
    const newUser = new User({
      fullName,
      email,
      username,
      password,
      accountNumber,
      dateOfBirth,
      address,
      countryOfOrigin,
      gender,
      maritalStatus,
      phoneNumber,
      profilePicture,
      zipCode
    });

    await newUser.save();
    res.json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

console.log(typeof authMiddleware, typeof isAdmin);

// LIST USERS
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // newest first
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// DISABLE USER
router.put('/disable/:id', disableUser);
router.put('/enable/:id', enableUser);

// DELETE USER
router.delete('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;
