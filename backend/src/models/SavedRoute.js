const mongoose = require('mongoose');

const savedRouteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SavedRoute', savedRouteSchema);
