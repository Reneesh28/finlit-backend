const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },

  // ================= ROLE =================
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // ================= AUTH =================
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },

  // ================= 🎯 GAMIFICATION =================
  xp: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastQuizDate: {
    type: Date
  }

}, {
  timestamps: true
});


// ================= 🔐 PASSWORD HASH =================
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});


// ================= 🔑 PASSWORD COMPARE =================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);