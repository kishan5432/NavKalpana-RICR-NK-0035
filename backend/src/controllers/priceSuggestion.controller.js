const getAverageRoutePrice = require('../utils/getAverageRoutePrice');
const getSeatDemand = require('../utils/getSeatDemand');
const Ride = require('../models/Ride');

const PRICE_PER_KM = 4;

const getPriceSuggestion = async (req, res) => {
  try {
    const { from_location, to_location, ride_date, distance_km } = req.query;

    if (!from_location || !to_location || !ride_date || !distance_km) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters: from_location, to_location, ride_date, distance_km' 
      });
    }

    const distanceKm = parseFloat(distance_km);
    if (isNaN(distanceKm) || distanceKm <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid distance_km' });
    }

    // Get demand level
    const demandData = await getSeatDemand(from_location, to_location, ride_date);
    const demandLevel = demandData.demand_level;

    // Calculate base price
    let basePrice = distanceKm * PRICE_PER_KM;

    // Apply demand adjustment
    if (demandLevel === 'high') {
      basePrice *= 1.2;
    } else if (demandLevel === 'moderate') {
      basePrice *= 1.1;
    }

    // Calculate suggested range (±10%)
    const suggestedMin = Math.round(basePrice * 0.9);
    const suggestedMax = Math.round(basePrice * 1.1);

    // Get count of completed rides for this route
    const completedRidesCount = await Ride.countDocuments({
      from: from_location,
      to: to_location,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      suggested_min: suggestedMin,
      suggested_max: suggestedMax,
      demand_level: demandLevel,
      based_on_routes: completedRidesCount,
      demand_signal: demandData.demand_signal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPriceSuggestion };
