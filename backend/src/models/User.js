const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['driver', 'passenger'], default: 'passenger' },
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
  reliabilityScore: { type: Number, default: 50, min: 0, max: 100 },
  reliabilityLabel: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Moderate' },
  referralCode: { type: String, unique: true, sparse: true },
  referredByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  credits: { type: Number, default: 0 },
  savedRoutes: [{
    from: String,
    to: String,
    label: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
