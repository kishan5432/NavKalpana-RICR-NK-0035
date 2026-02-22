const { Server } = require('socket.io');
const Message = require('../models/Message');
const Booking = require('../models/Booking');

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (bookingId) => {
      socket.join(bookingId);
      console.log(`Socket ${socket.id} joined room ${bookingId}`);
    });

    socket.on('leave-room', (bookingId) => {
      socket.leave(bookingId);
      console.log(`Socket ${socket.id} left room ${bookingId}`);
    });

    socket.on('send-message', async ({ bookingId, content }) => {
      try {
        const booking = await Booking.findById(bookingId).populate('passengerId driverId', 'name profilePicture');
        if (!booking) return;
        
        io.to(bookingId).emit('new-message', { 
          bookingId, 
          content, 
          sender: booking.passengerId._id,
          senderId: booking.passengerId,
          createdAt: new Date() 
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;
