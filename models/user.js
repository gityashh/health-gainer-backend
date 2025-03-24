const mongoose = require('mongoose');

const userModel = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: '',
      unique: true,
    },
    mobileNumber: {
      type: String,
      default: '',
      unique: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'user',
    },
    lastLogin: { type: Date, default: null },
    addresses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address', 
    }],
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userModel);

module.exports = User;
