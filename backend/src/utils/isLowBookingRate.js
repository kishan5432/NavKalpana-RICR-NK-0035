const getRideBookingRate = require('./getRideBookingRate');

const isLowBookingRate = async (ride_id) => {
  const stats = await getRideBookingRate(ride_id);
  if (!stats) {
    return false;
  }

  return (stats.fill_rate < 30 && stats.hours_since_posted > 12) ||
         (stats.fill_rate === 0 && stats.hours_since_posted > 6);
};

module.exports = isLowBookingRate;
