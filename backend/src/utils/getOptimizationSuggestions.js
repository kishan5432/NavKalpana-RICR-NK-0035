const isLowBookingRate = require('./isLowBookingRate');
const getAverageRoutePrice = require('./getAverageRoutePrice');
const Ride = require('../models/Ride');

const getOptimizationSuggestions = async (ride_id) => {
  const isLow = await isLowBookingRate(ride_id);
  if (!isLow) {
    return [];
  }

  const ride = await Ride.findById(ride_id);
  if (!ride) {
    return [];
  }

  const suggestions = [];

  // Check price vs average
  const avgPrice = await getAverageRoutePrice(ride.from, ride.to);
  if (avgPrice && ride.pricePerSeat > avgPrice) {
    suggestions.push({
      type: "price",
      message: "Your price is above average. Consider lowering it to attract more passengers."
    });
  }

  // Check ride details (using stops array as details indicator)
  const detailsLength = (ride.stops || []).join('').length;
  if (detailsLength < 20) {
    suggestions.push({
      type: "details",
      message: "Add more ride details (luggage, preferences, stops) to build passenger trust."
    });
  }

  // Check departure time (format: "HH:MM")
  const [hours] = ride.departureTime.split(':').map(Number);
  if ((hours >= 11 && hours < 14) || hours >= 20) {
    suggestions.push({
      type: "departure_time",
      message: "Rides departing early morning or evening tend to fill faster. Consider adjusting your departure time."
    });
  }

  return suggestions;
};

module.exports = getOptimizationSuggestions;
