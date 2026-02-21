const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

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

    await ride.populate('driverId', 'name profilePhoto rating isPhoneVerified');

    res.status(201).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRides = async (req, res) => {
  try {
    const { from, to, date, seats, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    const filter = { status: 'active' };

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
      .populate('driverId', 'name profilePhoto rating vehicle');

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
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driverId', 'name profilePhoto rating vehicle bio isPhoneVerified');
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

    const { from, to, stops, date, departureTime, pricePerSeat, luggageAllowance, preferences } = req.body;
    
    if (from) ride.from = from;
    if (to) ride.to = to;
    if (stops) ride.stops = stops;
    if (date) ride.date = date;
    if (departureTime) ride.departureTime = departureTime;
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

    const result = await Booking.updateMany(
      { rideId: ride._id, status: 'accepted' },
      { status: 'cancelled' }
    );

    res.status(200).json({ success: true, message: 'Ride cancelled', cancelledBookings: result.modifiedCount });
  } catch (error) {
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

    await Booking.updateMany(
      { rideId: ride._id, status: 'accepted' },
      { status: 'completed' }
    );

    res.status(200).json({ success: true, message: 'Ride completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRide, getRides, getMyPostedRides, getRideById, updateRide, cancelRide, completeRide };
