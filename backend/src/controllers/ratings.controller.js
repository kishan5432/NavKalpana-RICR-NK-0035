const Rating = require('../models/Rating');
const Booking = require('../models/Booking');
const User = require('../models/User');

const createRating = async (req, res) => {
  try {
    const { bookingId, stars, comment } = req.body;

    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Stars must be an integer between 1 and 5' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user._id.toString() !== booking.passengerId.toString() && 
        req.user._id.toString() !== booking.driverId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed trips' });
    }

    const isPassenger = req.user._id.toString() === booking.passengerId.toString();
    const ratedUserId = isPassenger ? booking.driverId : booking.passengerId;

    if (isPassenger && booking.hasRated.passenger) {
      return res.status(400).json({ success: false, message: 'Already rated' });
    }
    if (!isPassenger && booking.hasRated.driver) {
      return res.status(400).json({ success: false, message: 'Already rated' });
    }

    const rating = await Rating.create({
      bookingId,
      raterId: req.user._id,
      ratedUserId,
      stars,
      comment
    });

    if (isPassenger) {
      booking.hasRated.passenger = true;
    } else {
      booking.hasRated.driver = true;
    }
    await booking.save();

    const aggregateResult = await Rating.aggregate([
      { $match: { ratedUserId } },
      { $group: { _id: null, avgStars: { $avg: '$stars' }, count: { $sum: 1 } } }
    ]);

    if (aggregateResult.length > 0) {
      const { avgStars, count } = aggregateResult[0];
      await User.findByIdAndUpdate(ratedUserId, {
        'rating.average': Math.round(avgStars * 10) / 10,
        'rating.count': count
      });
    }

    res.status(201).json({ success: true, rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedUserId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('raterId', 'name profilePhoto');

    res.status(200).json({ success: true, count: ratings.length, ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRating, getUserRatings };
