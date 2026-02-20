const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  stops: [String],
  date: { type: Date, required: true },
  departureTime: { type: String, required: true },
  totalSeats: { type: Number, required: true, min: 1, max: 8 },
  availableSeats: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true, min: 0 },
  vehicle: {
    make: String,
    model: String,
    color: String,
    plate: String
  },
  luggageAllowance: { type: String, enum: ['none', 'small', 'large'], default: 'small' },
  preferences: {
    smoking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    music: { type: Boolean, default: true }
  },
  status: { type: String, enum: ['active', 'fully_booked', 'cancelled', 'completed'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
