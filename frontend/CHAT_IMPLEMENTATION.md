# RideShareX Real-Time Chat Implementation

## Files Created/Modified

### Created:
1. **src/context/SocketContext.jsx** - Socket.io context provider
2. **src/components/ChatWindow.jsx** - Real-time chat component
3. **src/pages/shared/Chat.jsx** - Chat page with booking details

### Modified:
1. **src/App.jsx** - Added SocketProvider wrapper and Chat import
2. **package.json** - Added socket.io-client dependency

## Features Implemented

### SocketContext
- Creates socket connection on mount using VITE_SOCKET_URL
- Provides socket instance via useSocket() hook
- Auto-disconnects on unmount
- Wrapped inside AuthProvider in App.jsx

### ChatWindow Component
- **Props**: bookingId, otherUser (name, photo)
- **On Mount**: 
  - Emits 'join-room' event
  - Fetches existing messages via getMessagesByBooking API
  - Marks messages as read via markMessagesRead API
- **Real-time**: Listens for 'new-message' socket event
- **On Unmount**: Emits 'leave-room' and removes listener
- **Message Display**:
  - User's messages: right-aligned, blue bubble
  - Other user's messages: left-aligned, gray bubble with avatar
  - Timestamps below each message
  - Auto-scroll to bottom on new messages
- **Input**: 
  - Textarea with Enter to send, Shift+Enter for new line
  - Send button with icon
  - Emits 'send-message' socket event + calls sendMessage API

### Chat Page
- Gets bookingId from URL params
- Fetches booking details to determine other user
- Shows other user's name, photo, and booking status badge
- Back button for navigation
- Renders ChatWindow component

## Environment Variables
Required in `.env`:
```
VITE_SOCKET_URL=http://localhost:5000
```

## Usage
Navigate to `/chat/:bookingId` to open chat for a specific booking.
