const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['search', 'booking', 'completed_trip'], required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  travelDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

userActivitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
