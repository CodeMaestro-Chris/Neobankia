// controllers/adminController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Create user (from admin dashboard)
const createUser = async (req, res) => {
  try {
    const {
      fullName, email, password, dateOfBirth, address,
      countryOfOrigin, gender, maritalStatus, phoneNumber,
      username, profilePicture, zipCode
    } = req.body;

    if (!fullName || !email || !password || !username) {
      return res.status(400).json({ message: 'fullName, email, username and password are required' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already in use' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already in use' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      fullName, email, password, accountNumber, dateOfBirth, address, countryOfOrigin,
      gender, maritalStatus, phoneNumber, username, profilePicture, zipCode, role: 'user'
    });

    await user.save();

    // Do not send password back
    const toSend = user.toObject();
    delete toSend.password;

    return res.status(201).json({ message: 'User created', user: toSend });
  } catch (err) {
    console.error('createUser error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude password
    return res.json({ users });
  } catch (err) {
    console.error('getAllUsers error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// controllers/admin.js
const disableUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isDisabled: true },
      { new: true } // return updated doc
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User disabled', user: { id: user._id, isDisabled: user.isDisabled } });
  } catch (err) {
    console.error('disableUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const enableUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isDisabled: false },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User enabled', user: { id: user._id, isDisabled: user.isDisabled } });
  } catch (err) {
    console.error('enableUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
};



const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createUser, getAllUsers, disableUser, enableUser, deleteUser };
