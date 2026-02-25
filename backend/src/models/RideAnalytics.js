const mongoose = require('mongoose');

const rideAnalyticsSchema = new mongoose.Schema({
  routeFrom: { type: String, required: true },
  routeTo: { type: String, required: true },
  rideDate: { type: Date, required: true },
  bookingCount: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index for efficient upsert
rideAnalyticsSchema.index({ routeFrom: 1, routeTo: 1, rideDate: 1 }, { unique: true });

module.exports = mongoose.model('RideAnalytics', rideAnalyticsSchema);
