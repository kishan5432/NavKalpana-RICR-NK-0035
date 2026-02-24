const User = require('../models/User');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

const getMe = async (req, res) => {
  try {
    // Calculate completed trips based on role
    let completedTrips = 0;
    if (req.user.role === 'passenger') {
      // For passengers: count completed bookings
      completedTrips = await Booking.countDocuments({
        passengerId: req.user._id,
        status: 'completed'
      });
    } else if (req.user.role === 'driver') {
      // For drivers: count completed rides
      completedTrips = await Ride.countDocuments({
        driverId: req.user._id,
        status: 'completed'
      });
    } else if (req.user.role === 'both') {
      // For both: count completed bookings + completed rides
      const passengerTrips = await Booking.countDocuments({
        passengerId: req.user._id,
        status: 'completed'
      });
      const driverTrips = await Ride.countDocuments({
        driverId: req.user._id,
        status: 'completed'
      });
      completedTrips = passengerTrips + driverTrips;
    }

    // Add completedTrips to user object
    const userWithTrips = {
      ...req.user.toObject(),
      completedTrips
    };

    res.status(200).json({ success: true, user: userWithTrips });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, bio, profilePhoto, vehicle, savedRoutes } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, profilePhoto, vehicle, savedRoutes },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      '_id name profilePhoto bio rating role vehicle isPhoneVerified isEmailVerified createdAt'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate completed trips based on role
    let completedTrips = 0;
    if (user.role === 'passenger') {
      // For passengers: count completed bookings
      completedTrips = await Booking.countDocuments({
        passengerId: user._id,
        status: 'completed'
      });
    } else if (user.role === 'driver') {
      // For drivers: count completed rides
      completedTrips = await Ride.countDocuments({
        driverId: user._id,
        status: 'completed'
      });
    } else if (user.role === 'both') {
      // For both: count completed bookings + completed rides
      const passengerTrips = await Booking.countDocuments({
        passengerId: user._id,
        status: 'completed'
      });
      const driverTrips = await Ride.countDocuments({
        driverId: user._id,
        status: 'completed'
      });
      completedTrips = passengerTrips + driverTrips;
    }

    // Add completedTrips to user object
    const userWithTrips = {
      ...user.toObject(),
      completedTrips
    };

    res.status(200).json({ success: true, user: userWithTrips });
  } catch (err) {
    next(err);
  }
};

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (err) {
    next(err);
  }
};

const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload to Cloudinary using buffer
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'navkalpana/profiles' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: result.secure_url },
      { new: true }
    );

    res.status(200).json({ success: true, profilePicture: result.secure_url, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, getUserById, getMyNotifications, markNotificationRead, markAllNotificationsRead, uploadProfilePicture };
