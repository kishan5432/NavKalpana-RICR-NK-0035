const Ride = require('../models/Ride');

const getAverageRoutePrice = async (fromLocation, toLocation) => {
  const completedRides = await Ride.find({
    from: fromLocation,
    to: toLocation,
    status: 'completed'
  }).select('pricePerSeat');

  if (completedRides.length < 3) {
    return null;
  }

  const totalPrice = completedRides.reduce((sum, ride) => sum + ride.pricePerSeat, 0);
  const averagePrice = totalPrice / completedRides.length;

  return Math.round(averagePrice);
};

module.exports = getAverageRoutePrice;
