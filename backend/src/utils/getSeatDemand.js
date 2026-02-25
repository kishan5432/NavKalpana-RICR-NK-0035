const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const SavedRoute = require('../models/SavedRoute');

const getSeatDemand = async (fromLocation, toLocation, rideDate) => {
  const targetDate = new Date(rideDate);
  
  // Calculate date range: ±3 days
  const startDate = new Date(targetDate);
  startDate.setDate(startDate.getDate() - 3);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(targetDate);
  endDate.setDate(endDate.getDate() + 3);
  endDate.setHours(23, 59, 59, 999);

  // Find rides matching route and date range
  const rides = await Ride.find({
    from: fromLocation,
    to: toLocation,
    date: { $gte: startDate, $lte: endDate }
  }).select('_id');

  const rideIds = rides.map(ride => ride._id);

  // Count total seats booked for these rides
  const bookings = await Booking.find({
    rideId: { $in: rideIds },
    status: { $in: ['accepted', 'completed'] }
  }).select('seatsBooked');

  const totalSeats = bookings.reduce((sum, booking) => sum + booking.seatsBooked, 0);

  // Count saved routes for this route
  const savedRouteCount = await SavedRoute.countDocuments({
    fromLocation,
    toLocation
  });

  // Determine base demand level
  let demandLevel;
  if (totalSeats > 10) demandLevel = 'high';
  else if (totalSeats >= 4) demandLevel = 'moderate';
  else demandLevel = 'low';

  // Bump demand level if saved routes > 5
  if (savedRouteCount > 5) {
    if (demandLevel === 'low') demandLevel = 'moderate';
    else if (demandLevel === 'moderate') demandLevel = 'high';
  }

  return {
    demand_level: demandLevel,
    demand_signal: {
      total_seats_booked: totalSeats,
      saved_route_count: savedRouteCount
    }
  };
};

module.exports = getSeatDemand;
