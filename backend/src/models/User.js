const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['driver', 'passenger', 'both'], default: 'passenger' },
  profilePhoto: { type: String, default: '' },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  bio: { type: String, maxlength: 200 },
  vehicle: {
    make: String,
    model: String,
    color: String,
    plate: String,
    year: String
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  savedRoutes: [{
    from: String,
    to: String,
    label: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
