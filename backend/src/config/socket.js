const { Server } = require('socket.io');
const Message = require('../models/Message');

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
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
    });

    socket.on('send-message', async ({ bookingId, content, senderId, receiverId }) => {
      try {
        const message = await Message.create({
          bookingId,
          senderId,
          receiverId,
          content
        });
        io.to(bookingId).emit('new-message', message);
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
