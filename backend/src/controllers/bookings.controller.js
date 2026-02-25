const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const RideAnalytics = require('../models/RideAnalytics');
const { createNotification } = require('../utils/notification');
const { calculateReliabilityScore } = require('../utils/calculateReliability');

const createBooking = async (req, res) => {
  try {
    const { rideId, seatsBooked } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Ride is not active' });
    }
    if (seatsBooked > ride.availableSeats) {
      return res.status(400).json({ success: false, message: 'Not enough available seats' });
    }
    if (req.user._id.toString() === ride.driverId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot book your own ride' });
    }

    const existingBooking = await Booking.findOne({
      rideId,
      passengerId: req.user._id,
      status: { $in: ['requested', 'accepted'] }
    });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You already have a booking for this ride' });
    }

    const totalPrice = seatsBooked * ride.pricePerSeat;

    const booking = await Booking.create({
      rideId,
      passengerId: req.user._id,
      driverId: ride.driverId,
      seatsBooked,
      totalPrice
    });

    await booking.populate('rideId', 'from to date departureTime');
    await booking.populate('passengerId', 'name profilePhoto rating reliabilityScore reliabilityLabel');

    await createNotification(
      ride.driverId,
      'booking_requested',
      `New booking request from ${req.user.name}`,
      `/driver/bookings`
    );

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ passengerId: req.user._id }, { driverId: req.user._id }]
    })
      .populate('rideId')
      .populate('passengerId', 'name profilePhoto rating reliabilityScore reliabilityLabel')
      .populate('driverId', 'name profilePhoto rating reliabilityScore reliabilityLabel')
      .sort({ createdAt: -1 });

    const validBookings = bookings.filter(b => b.rideId);

    res.status(200).json({ success: true, count: validBookings.length, bookings: validBookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('rideId')
      .populate('passengerId', 'name profilePhoto rating reliabilityScore reliabilityLabel')
      .populate('driverId', 'name profilePhoto rating reliabilityScore reliabilityLabel');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user._id.toString() !== booking.passengerId._id.toString() && 
        req.user._id.toString() !== booking.driverId._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user._id.toString() !== booking.driverId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'requested') {
      return res.status(400).json({ success: false, message: 'Booking is not in requested state' });
    }

    const ride = await Ride.findById(booking.rideId);
    if (ride.availableSeats < booking.seatsBooked) {
      return res.status(400).json({ success: false, message: 'Not enough available seats' });
    }

    ride.availableSeats -= booking.seatsBooked;
    if (ride.availableSeats === 0) {
      ride.status = 'fully_booked';
    }
    await ride.save();

    booking.status = 'accepted';
    await booking.save();

    await calculateReliabilityScore(req.user._id.toString());

    // Update ride analytics
    const rideDate = new Date(ride.date);
    rideDate.setHours(0, 0, 0, 0);
    
    await RideAnalytics.findOneAndUpdate(
      {
        routeFrom: ride.from,
        routeTo: ride.to,
        rideDate: rideDate
      },
      {
        $inc: { bookingCount: 1 }
      },
      {
        upsert: true,
        new: true
      }
    );

    await createNotification(
      booking.passengerId,
      'booking_accepted',
      'Your booking was accepted',
      `/passenger/bookings`
    );

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user._id.toString() !== booking.driverId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'requested') {
      return res.status(400).json({ success: false, message: 'Booking is not in requested state' });
    }

    booking.status = 'rejected';
    await booking.save();

    await calculateReliabilityScore(req.user._id.toString());

    await createNotification(
      booking.passengerId,
      'booking_rejected',
      'Your booking was rejected',
      `/passenger/bookings`
    );

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user._id.toString() !== booking.passengerId.toString() && 
        req.user._id.toString() !== booking.driverId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status === 'accepted') {
      const ride = await Ride.findById(booking.rideId);
      ride.availableSeats += booking.seatsBooked;
      if (ride.status === 'fully_booked') {
        ride.status = 'active';
      }
      await ride.save();
    }

    booking.status = 'cancelled';
    booking.cancelledBy = req.user._id.toString() === booking.driverId.toString() ? 'driver' : 'passenger';
    await booking.save();

    await calculateReliabilityScore(booking.passengerId.toString());
    await calculateReliabilityScore(booking.driverId.toString());

    const notifyUserId = req.user._id.toString() === booking.driverId.toString() 
      ? booking.passengerId 
      : booking.driverId;
    
    await createNotification(
      notifyUserId,
      'booking_cancelled',
      'A booking was cancelled',
      req.user._id.toString() === booking.driverId.toString() ? `/passenger/bookings` : `/driver/bookings`
    );

    res.status(200).json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, acceptBooking, rejectBooking, cancelBooking };
