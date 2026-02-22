const Message = require('../models/Message');
const Booking = require('../models/Booking');
const User = require('../models/User');

const getConversations = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ passengerId: req.user._id }, { driverId: req.user._id }]
    }).populate('rideId', 'from to').populate('passengerId', 'name profilePhoto').populate('driverId', 'name profilePhoto');

    const conversations = await Promise.all(
      bookings.map(async (booking) => {
        const latestMessage = await Message.findOne({ bookingId: booking._id })
          .sort({ createdAt: -1 })
          .limit(1);

        const unreadCount = await Message.countDocuments({
          bookingId: booking._id,
          receiverId: req.user._id,
          isRead: false
        });

        const otherUser = req.user._id.toString() === booking.passengerId._id.toString()
          ? booking.driverId
          : booking.passengerId;

        return {
          booking,
          otherUser,
          latestMessage,
          unreadCount
        };
      })
    );

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user._id.toString() !== booking.passengerId.toString() && 
        req.user._id.toString() !== booking.driverId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ bookingId: req.params.bookingId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name profilePicture');

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { bookingId, content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user._id.toString() !== booking.passengerId.toString() && 
        req.user._id.toString() !== booking.driverId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const receiverId = req.user._id.toString() === booking.passengerId.toString()
      ? booking.driverId
      : booking.passengerId;

    const message = await Message.create({
      bookingId,
      senderId: req.user._id,
      receiverId,
      content
    });

    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name profilePicture');

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markMessagesRead = async (req, res) => {
  try {
    const result = await Message.updateMany(
      {
        bookingId: req.params.bookingId,
        receiverId: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage, markMessagesRead };
