const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['booking_requested', 'booking_accepted', 'booking_rejected', 'booking_cancelled', 'ride_cancelled', 'new_message', 'trip_completed', 'new_rating'],
    required: true 
  },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
