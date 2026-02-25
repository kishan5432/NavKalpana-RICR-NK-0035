const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

const getRideBookingRate = async (ride_id) => {
  const ride = await Ride.findById(ride_id);
  if (!ride) {
    return null;
  }

  const bookedSeats = await Booking.countDocuments({
    rideId: ride_id,
    status: 'confirmed'
  });

  const totalSeats = ride.availableSeats;
  const fillRate = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;
  const hoursSincePosted = (Date.now() - new Date(ride.createdAt).getTime()) / (1000 * 60 * 60);

  return {
    total_seats: totalSeats,
    booked_seats: bookedSeats,
    fill_rate: Math.round(fillRate * 100) / 100,
    hours_since_posted: Math.round(hoursSincePosted * 100) / 100
  };
};

module.exports = getRideBookingRate;
