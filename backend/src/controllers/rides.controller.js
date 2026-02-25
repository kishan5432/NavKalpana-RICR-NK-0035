const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const SavedRoute = require('../models/SavedRoute');
const { createNotification } = require('../utils/notification');
const { calculateReliabilityScore } = require('../utils/calculateReliability');
const getOptimizationSuggestions = require('../utils/getOptimizationSuggestions');
const getRideBookingRate = require('../utils/getRideBookingRate');
const isLowBookingRate = require('../utils/isLowBookingRate');

const createRide = async (req, res) => {
  try {
    const { from, to, stops, date, departureTime, totalSeats, pricePerSeat, vehicle, luggageAllowance, preferences } = req.body;

    if (!from || !to || !date || !departureTime || !totalSeats || pricePerSeat === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const ride = await Ride.create({
      driverId: req.user._id,
      from,
      to,
      stops,
      date,
      departureTime,
      totalSeats,
      availableSeats: totalSeats,
      pricePerSeat,
      vehicle: vehicle || req.user.vehicle,
      luggageAllowance,
      preferences
    });

    await ride.populate('driverId', 'name profilePhoto rating isPhoneVerified reliabilityScore reliabilityLabel');

    // Notify passengers with matching saved routes
    const matchingSavedRoutes = await SavedRoute.find({
      fromLocation: from,
      toLocation: to
    });

    for (const savedRoute of matchingSavedRoutes) {
      await createNotification(
        savedRoute.userId,
        'new_ride_match',
        `A new ride matching your saved route ${from} → ${to} is now available.`,
        `/rides/${ride._id}`
      );
    }

    res.status(201).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRides = async (req, res) => {
  try {
    const { from, to, date, seats, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    const filter = { status: { $in: ['active', 'fully_booked'] } };

    if (from) filter.from = { $regex: from, $options: 'i' };
    if (to) filter.to = { $regex: to, $options: 'i' };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lt: endOfDay };
    }
    if (seats) filter.availableSeats = { $gte: Number(seats) };
    if (minPrice || maxPrice) {
      filter.pricePerSeat = {
        $gte: minPrice ? Number(minPrice) : 0,
        $lte: maxPrice ? Number(maxPrice) : Infinity
      };
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price') sortObj = { pricePerSeat: 1 };
    if (sort === 'departure') sortObj = { departureTime: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Ride.countDocuments(filter);
    const rides = await Ride.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .populate('driverId', 'name profilePhoto rating vehicle isPhoneVerified reliabilityScore reliabilityLabel');

    // Log search activity
    if (req.user && from && to) {
      await UserActivity.create({
        userId: req.user._id,
        type: 'search',
        fromLocation: from,
        toLocation: to,
        travelDate: date ? new Date(date) : null
      }).catch(err => console.error('UserActivity log error:', err));
    }

    res.status(200).json({ success: true, count: rides.length, total, page: Number(page), rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyPostedRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driverId: req.user._id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: rides.length, rides });
  } catch (error) {
    console.error('Get my posted rides error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driverId', 'name profilePhoto rating vehicle bio isPhoneVerified createdAt reliabilityScore reliabilityLabel');
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (ride.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Cannot edit non-active ride' });
    }

    const { from, to, stops, date, departureTime, totalSeats, pricePerSeat, luggageAllowance, preferences } = req.body;
    
    if (from) ride.from = from;
    if (to) ride.to = to;
    if (stops) ride.stops = stops;
    if (date) ride.date = date;
    if (departureTime) ride.departureTime = departureTime;
    if (totalSeats !== undefined) {
      const bookedSeats = ride.totalSeats - ride.availableSeats;
      if (totalSeats < bookedSeats) {
        return res.status(400).json({ success: false, message: 'Cannot reduce seats below booked seats' });
      }
      ride.availableSeats = totalSeats - bookedSeats;
      ride.totalSeats = totalSeats;
    }
    if (pricePerSeat !== undefined) ride.pricePerSeat = pricePerSeat;
    if (luggageAllowance) ride.luggageAllowance = luggageAllowance;
    if (preferences) ride.preferences = preferences;

    await ride.save();
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (ride.status !== 'active' && ride.status !== 'fully_booked') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this ride' });
    }

    ride.status = 'cancelled';
    await ride.save();

    const bookings = await Booking.find({ rideId: ride._id, status: 'accepted' });
    
    await Booking.updateMany(
      { rideId: ride._id, status: 'accepted' },
      { status: 'cancelled' }
    );

    for (const booking of bookings) {
      await createNotification(
        booking.passengerId,
        'ride_cancelled',
        'A ride you booked was cancelled',
        `/passenger/bookings`
      );
    }

    res.status(200).json({ success: true, message: 'Ride cancelled', cancelledBookings: bookings.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const startRide = async (req, res) => {
  try {
    console.log('Starting ride with ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    const ride = await Ride.findById(req.params.id);
    console.log('Found ride:', ride);
    
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (ride.status !== 'active' && ride.status !== 'fully_booked') {
      return res.status(400).json({ success: false, message: 'Cannot start this ride' });
    }

    ride.status = 'in_progress';
    await ride.save();
    console.log('Ride status updated to in_progress');

    res.status(200).json({ success: true, message: 'Ride started', ride });
  } catch (error) {
    console.error('Start ride error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    ride.status = 'completed';
    await ride.save();

    const bookings = await Booking.find({ rideId: ride._id, status: 'accepted' });
    
    await Booking.updateMany(
      { rideId: ride._id, status: 'accepted' },
      { status: 'completed' }
    );

    // Update reliability scores
    await calculateReliabilityScore(ride.driverId.toString());
    for (const booking of bookings) {
      await calculateReliabilityScore(booking.passengerId.toString());
      
      // Log completed trip activity
      await UserActivity.create({
        userId: booking.passengerId,
        type: 'completed_trip',
        fromLocation: ride.from,
        toLocation: ride.to
      }).catch(err => console.error('UserActivity log error:', err));

      // Referral bonus: check if this is passenger's first completed trip
      const passenger = await User.findById(booking.passengerId);
      if (passenger && passenger.referredByUserId) {
        const completedTripsCount = await Booking.countDocuments({
          passengerId: passenger._id,
          status: 'completed'
        });
        
        if (completedTripsCount === 1) {
          await User.findByIdAndUpdate(passenger.referredByUserId, {
            $inc: { credits: 100 }
          });
        }
      }
    }

    for (const booking of bookings) {
      await createNotification(
        booking.passengerId,
        'trip_completed',
        'Rate your recent trip',
        `/passenger/bookings`
      );
    }

    res.status(200).json({ success: true, message: 'Ride completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get driver dashboard stats
const getDriverStats = async (req, res) => {
  try {
    const rides = await Ride.find({ driverId: req.user._id });
    
    // Get bookings for this driver's rides
    const rideIds = rides.map(r => r._id);
    const bookings = await Booking.find({ rideId: { $in: rideIds } });
    
    const stats = {
      totalRides: rides.length,
      activeRides: rides.filter(r => r.status === 'active').length,
      completedRides: rides.filter(r => r.status === 'completed').length,
      cancelledRides: rides.filter(r => r.status === 'cancelled').length,
      totalBookings: bookings.length,
      acceptedBookings: bookings.filter(b => b.status === 'accepted').length,
      totalEarnings: rides
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.pricePerSeat * (r.totalSeats - r.availableSeats)), 0),
      upcomingRides: rides
        .filter(r => r.status === 'active' && new Date(r.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)
    };
    
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Driver stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOptimizationSuggestionsEndpoint = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.ride_id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookingRate = await getRideBookingRate(req.params.ride_id);
    const lowBookingRate = await isLowBookingRate(req.params.ride_id);
    const suggestions = await getOptimizationSuggestions(req.params.ride_id);

    res.status(200).json({
      success: true,
      low_booking_rate: lowBookingRate,
      fill_rate: bookingRate ? bookingRate.fill_rate : 0,
      suggestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRide, getRides, getMyPostedRides, getRideById, updateRide, cancelRide, startRide, completeRide, getDriverStats, getOptimizationSuggestionsEndpoint };
