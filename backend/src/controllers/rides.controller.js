const Ride = require('../models/Ride');

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

const getMyPostedRides = (req, res) => {
  res.status(200).json({ success: true, message: 'TODO' });
};

const getRideById = (req, res) => {
  res.status(200).json({ success: true, message: 'TODO' });
};

const updateRide = (req, res) => {
  res.status(200).json({ success: true, message: 'TODO' });
};

const cancelRide = (req, res) => {
  res.status(200).json({ success: true, message: 'TODO' });
};

const completeRide = (req, res) => {
  res.status(200).json({ success: true, message: 'TODO' });
};

module.exports = { createRide, getRides, getMyPostedRides, getRideById, updateRide, cancelRide, completeRide };
