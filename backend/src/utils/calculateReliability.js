const User = require('../models/User');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

const calculateReliabilityScore = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const passengerBookings = await Booking.find({ passengerId: userId });
    const driverRides = await Ride.find({ driverId: userId });
    const driverBookings = await Booking.find({ driverId: userId });

    let completionRate = 0, cancellationRate = 0, ratingScore = 0, responseScore = 0;

    // 1. Ride Completion Rate (40%)
    const totalTrips = passengerBookings.length + driverRides.length;
    if (totalTrips > 0) {
      const completedPassenger = passengerBookings.filter(b => b.status === 'completed').length;
      const completedDriver = driverRides.filter(r => r.status === 'completed').length;
      completionRate = ((completedPassenger + completedDriver) / totalTrips) * 40;
    } else {
      completionRate = 20;
    }

    // 2. Cancellation Frequency (25%)
    if (totalTrips > 0) {
      const cancelledPassenger = passengerBookings.filter(b => b.status === 'cancelled' && b.cancelledBy === 'passenger').length;
      const cancelledDriver = driverRides.filter(r => r.status === 'cancelled').length;
      const cancellationRatio = (cancelledPassenger + cancelledDriver) / totalTrips;
      cancellationRate = (1 - cancellationRatio) * 25;
    } else {
      cancellationRate = 12.5;
    }

    // 3. Rating Average (25%)
    if (user.rating.count > 0) {
      ratingScore = (user.rating.average / 5) * 25;
    } else {
      ratingScore = 12.5;
    }

    // 4. Response Time (10%)
    const requestedBookings = driverBookings.filter(b => ['accepted', 'rejected'].includes(b.status));
    if (requestedBookings.length > 0) {
      const acceptedCount = driverBookings.filter(b => b.status === 'accepted').length;
      const responseRatio = acceptedCount / requestedBookings.length;
      responseScore = responseRatio * 10;
    } else {
      responseScore = 5;
    }

    const finalScore = Math.round(completionRate + cancellationRate + ratingScore + responseScore);
    
    let label = 'Moderate';
    if (finalScore <= 40) label = 'Low';
    else if (finalScore >= 71) label = 'High';

    await User.findByIdAndUpdate(userId, {
      reliabilityScore: finalScore,
      reliabilityLabel: label
    });

    return { score: finalScore, label };
  } catch (error) {
    console.error('Calculate reliability error:', error);
  }
};

module.exports = { calculateReliabilityScore };
