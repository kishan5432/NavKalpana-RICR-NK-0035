const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seatsBooked: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['requested', 'accepted', 'rejected', 'cancelled', 'completed'], default: 'requested' },
  cancelledBy: { type: String, enum: ['driver', 'passenger'], required: false },
  hasRated: {
    driver: { type: Boolean, default: false },
    passenger: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
