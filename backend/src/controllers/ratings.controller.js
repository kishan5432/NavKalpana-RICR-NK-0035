const Rating = require('../models/Rating');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { createNotification } = require('../utils/notification');
const { calculateReliabilityScore } = require('../utils/calculateReliability');

const createRating = async (req, res) => {
  try {
    console.log('Rating request body:', req.body);
    console.log('User ID:', req.user._id);
    
    const { bookingId, ratedUserId, rating, stars, comment } = req.body;
    const starRating = stars || rating;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    if (!starRating) {
      return res.status(400).json({ success: false, message: 'Stars rating is required' });
    }

    if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) {
      return res.status(400).json({ success: false, message: 'Stars must be an integer between 1 and 5' });
    }

    const booking = await Booking.findById(bookingId).populate('rideId');
    console.log('Found booking:', booking);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user._id.toString() !== booking.passengerId.toString() && 
        req.user._id.toString() !== booking.rideId.driverId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed trips' });
    }

    const isPassenger = req.user._id.toString() === booking.passengerId.toString();
    const ratedUserIdFromBooking = isPassenger ? booking.rideId.driverId : booking.passengerId;
    const finalRatedUserId = ratedUserId || ratedUserIdFromBooking;

    if (isPassenger && booking.hasRated.passenger) {
      return res.status(400).json({ success: false, message: 'Already rated' });
    }
    if (!isPassenger && booking.hasRated.driver) {
      return res.status(400).json({ success: false, message: 'Already rated' });
    }

    const newRating = await Rating.create({
      bookingId,
      raterId: req.user._id,
      ratedUserId: finalRatedUserId,
      stars: starRating,
      comment
    });

    if (isPassenger) {
      booking.hasRated.passenger = true;
    } else {
      booking.hasRated.driver = true;
    }
    await booking.save();

    const aggregateResult = await Rating.aggregate([
      { $match: { ratedUserId: require('mongoose').Types.ObjectId.createFromHexString(finalRatedUserId.toString()) } },
      { $group: { _id: null, avgStars: { $avg: '$stars' }, count: { $sum: 1 } } }
    ]);

    if (aggregateResult.length > 0) {
      const { avgStars, count } = aggregateResult[0];
      await User.findByIdAndUpdate(finalRatedUserId, {
        'rating.average': Math.round(avgStars * 10) / 10,
        'rating.count': count
      });
      console.log(`Updated user ${finalRatedUserId} rating to ${Math.round(avgStars * 10) / 10} (${count} ratings)`);
    }

    await calculateReliabilityScore(finalRatedUserId.toString());

    await createNotification(
      finalRatedUserId,
      'new_rating',
      'You received a new rating',
      `/profile/me`
    );

    res.status(201).json({ success: true, rating: newRating });
  } catch (error) {
    console.error('Rating creation error:', error);
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

const submitRating = createRating;

module.exports = { createRating, submitRating, getUserRatings };
