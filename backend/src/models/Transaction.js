const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  rider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  total_ride_value: {
    type: Number,
  },
  fee_amount: {
    type: Number,
  },
  driver_payout: {
    type: Number,
  },
  fee_percent: {
    type: Number,
  },
  type: {
    type: String,
    enum: ['service_fee', 'premium_visibility', 'instant_confirmation_badge'],
    default: 'service_fee',
  },
  amount: {
    type: Number,
  },
  ride_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
