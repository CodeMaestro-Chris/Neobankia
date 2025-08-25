const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountNumber: String,
  dateOfBirth: String,
  address: String,
  countryOfOrigin: String,
  gender: String,
  maritalStatus: String,
  phoneNumber: String,
  profilePicture: String,
  zipCode: String,
  role: { type: String, default: 'user' },
  isDisabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
