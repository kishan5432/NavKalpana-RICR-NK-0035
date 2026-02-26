# Chat Implementation Flow Documentation

## Overview
The Chat feature enables real-time messaging between passengers and drivers for accepted bookings. It uses WebSocket (Socket.IO) for real-time communication and REST APIs for message persistence.

---

## Architecture Flow

```
Frontend (Chat.jsx + ChatWindow.jsx)
    ↓
WebSocket Connection (Socket.IO Client)
    ↓
Socket Context Provider
    ↓
REST API Calls (Messages API)
    ↓
Backend Routes (/messages)
    ↓
Controllers (messages.controller.js)
    ↓
Database (Message Model)
    ↓
WebSocket Server (Socket.IO Server)
    ↓
Real-time Broadcast to Room
    ↓
Frontend Updates
```

---

## Technology Stack

### Frontend
- **React** - UI framework
- **Socket.IO Client** - WebSocket client
- **React Context** - Socket state management
- **Axios** - HTTP requests

### Backend
- **Node.js + Express** - Server framework
- **Socket.IO Server** - WebSocket server
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication

---

## Frontend Implementation

### 1. Socket Context Provider

**Location:** `frontend/src/context/SocketContext.jsx`

**Purpose:** Manage WebSocket connection globally across the application

**Implementation:**
```javascript
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
```

**Key Features:**
- Single WebSocket connection for entire app
- Automatic connection on mount
- Cleanup on unmount
- Accessible via `useSocket()` hook

**Environment Variable:**
- `VITE_SOCKET_URL` - WebSocket server URL (e.g., `http://localhost:5000`)

---

### 2. Chat Page Component

**Location:** `frontend/src/pages/shared/Chat.jsx`

**Purpose:** Main chat page that fetches booking details and renders chat interface

**State Management:**
```javascript
const [booking, setBooking] = useState(null);
const [otherUser, setOtherUser] = useState(null);
```

**Data Flow:**
1. Extract `bookingId` from URL params
2. Fetch booking details via `getBookingById(bookingId)`
3. Determine other user (driver or passenger)
4. Pass data to ChatWindow component

**User Identification Logic:**
```javascript
const isPassenger = data.booking.passengerId._id === user._id;
const other = isPassenger ? data.booking.driverId : data.booking.passengerId;
setOtherUser({
  name: other.name,
  photo: other.profilePhoto
});
```

**UI Components:**
- **Header:** Yellow background with back button, avatar, and name
- **ChatWindow:** Full-height message interface

---

### 3. Chat Window Component

**Location:** `frontend/src/components/ChatWindow.jsx`

**Purpose:** Core chat functionality with real-time messaging

**State Management:**
```javascript
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const messagesEndRef = useRef(null);
```

**Lifecycle Flow:**

#### A. Component Mount
```javascript
useEffect(() => {
  if (!socket) return;

  // Join the booking room
  socket.emit('join-room', bookingId);

  // Fetch message history
  getMessagesByBooking(bookingId)
    .then(data => {
      setMessages(data.messages || []);
      markMessagesRead(bookingId).catch(() => {});
    });

  // Cleanup on unmount
  return () => {
    socket.emit('leave-room', bookingId);
  };
}, [socket, bookingId]);
```

**Actions:**
1. Join Socket.IO room for the booking
2. Fetch all previous messages from database
3. Mark messages as read
4. Leave room on component unmount

---

#### B. Real-time Message Listener
```javascript
useEffect(() => {
  if (!socket) return;

  const handleNewMessage = (message) => {
    setMessages(prev => {
      // Prevent duplicates by ID
      if (message._id && prev.some(m => m._id === message._id)) {
        return prev;
      }
      // Prevent duplicates by content and timestamp
      if (!message._id && prev.some(m => 
        m.content === message.content && 
        Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000
      )) {
        return prev;
      }
      return [...prev, message];
    });
    markMessagesRead(bookingId).catch(() => {});
  };

  socket.on('new-message', handleNewMessage);

  return () => {
    socket.off('new-message', handleNewMessage);
  };
}, [socket, bookingId]);
```

**Features:**
- Listen for `new-message` events
- Prevent duplicate messages
- Auto-mark as read
- Cleanup listener on unmount

---

#### C. Auto-scroll to Bottom
```javascript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

**Purpose:** Automatically scroll to latest message when new messages arrive

---

#### D. Send Message Function
```javascript
const handleSend = async () => {
  if (!input.trim()) return;

  const content = input.trim();
  setInput('');

  try {
    // Save to database via REST API
    const response = await sendMessageAPI(bookingId, content);
    
    // Add to local state
    setMessages(prev => [...prev, response.message]);
    
    // Broadcast via WebSocket
    socket.emit('send-message', response.message);
  } catch (err) {
    console.error(err);
  }
};
```

**Flow:**
1. Validate input (not empty)
2. Clear input field immediately
3. Send message to backend (REST API)
4. Add message to local state
5. Broadcast to other user via WebSocket

---

#### E. Keyboard Shortcuts
```javascript
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};
```

**Feature:** Press Enter to send (Shift+Enter for new line)

---

**Message Rendering:**
```javascript
messages.map((msg, idx) => {
  const isMine = msg.senderId?._id === user._id || msg.sender === user._id;
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${
        isMine ? 'bg-[#FFD400] text-[#111111]' : 'bg-gray-100 text-gray-900'
      } rounded-2xl px-4 py-3 shadow-sm`}>
        <p>{msg.content}</p>
        <div className="text-xs mt-1">
          {new Date(msg.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
})
```

**Styling:**
- **Own messages:** Yellow background, right-aligned
- **Other messages:** Gray background, left-aligned
- **Max width:** 70% of container
- **Timestamp:** Small text below message

---

## API Layer

### API Functions

**Location:** `frontend/src/api/index.js`

#### 1. Get Conversations
```javascript
export const getConversations = () => 
  axios.get('/messages/conversations').then(res => res.data);
```

**Purpose:** Fetch all chat conversations for the user

---

#### 2. Get Messages by Booking
```javascript
export const getMessagesByBooking = (bookingId) => 
  axios.get(`/messages/booking/${bookingId}`).then(res => res.data);
```

**Purpose:** Fetch all messages for a specific booking

**Returns:**
```javascript
{
  success: true,
  messages: [
    {
      _id: "message_id",
      bookingId: "booking_id",
      senderId: {
        _id: "user_id",
        name: "User Name",
        profilePhoto: "url"
      },
      receiverId: "receiver_id",
      content: "Message text",
      isRead: false,
      createdAt: "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

#### 3. Send Message
```javascript
export const sendMessage = (bookingId, content) => 
  axios.post('/messages', { bookingId, content }).then(res => res.data);
```

**Purpose:** Send a new message

**Request Body:**
```javascript
{
  bookingId: "booking_id",
  content: "Message text"
}
```

**Returns:**
```javascript
{
  success: true,
  message: {
    _id: "message_id",
    bookingId: "booking_id",
    senderId: { _id, name, profilePhoto },
    receiverId: "receiver_id",
    content: "Message text",
    isRead: false,
    createdAt: "2024-01-01T10:00:00Z"
  }
}
```

---

#### 4. Mark Messages as Read
```javascript
export const markMessagesRead = (bookingId) => 
  axios.put(`/messages/booking/${bookingId}/read`).then(res => res.data);
```

**Purpose:** Mark all unread messages in a booking as read

**Returns:**
```javascript
{
  success: true,
  updated: 5  // Number of messages marked as read
}
```

---

## Backend Implementation

### 1. Routes

**Location:** `backend/src/routes/messages.routes.js`

**Endpoints:**
```javascript
router.get('/conversations', verifyJWT, getConversations);
router.get('/booking/:bookingId', verifyJWT, getMessages);
router.post('/', verifyJWT, sendMessage);
router.put('/booking/:bookingId/read', verifyJWT, markMessagesRead);
```

**Middleware:** All routes require JWT authentication (`verifyJWT`)

---

### 2. Controllers

**Location:** `backend/src/controllers/messages.controller.js`

#### A. Get Conversations
```javascript
const getConversations = async (req, res) => {
  // Find all bookings where user is passenger or driver
  const bookings = await Booking.find({
    $or: [{ passengerId: req.user._id }, { driverId: req.user._id }]
  })
    .populate('rideId', 'from to')
    .populate('passengerId', 'name profilePhoto')
    .populate('driverId', 'name profilePhoto');

  // For each booking, get latest message and unread count
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
};
```

**Purpose:** Get all chat conversations with metadata

**Returns:**
- Booking details
- Other user info
- Latest message
- Unread message count

---

#### B. Get Messages
```javascript
const getMessages = async (req, res) => {
  // Verify booking exists
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Verify user is part of the booking
  if (req.user._id.toString() !== booking.passengerId.toString() && 
      req.user._id.toString() !== booking.driverId.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  // Fetch all messages
  const messages = await Message.find({ bookingId: req.params.bookingId })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name profilePhoto');

  res.status(200).json({ success: true, messages });
};
```

**Authorization:**
- User must be either passenger or driver of the booking
- 403 error if unauthorized

**Sorting:** Messages sorted by creation time (oldest first)

---

#### C. Send Message
```javascript
const sendMessage = async (req, res) => {
  const { bookingId, content } = req.body;

  // Validate content
  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Message content is required' });
  }

  // Verify booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Verify authorization
  if (req.user._id.toString() !== booking.passengerId.toString() && 
      req.user._id.toString() !== booking.driverId.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  // Determine receiver
  const receiverId = req.user._id.toString() === booking.passengerId.toString()
    ? booking.driverId
    : booking.passengerId;

  // Create message
  const message = await Message.create({
    bookingId,
    senderId: req.user._id,
    receiverId,
    content
  });

  // Populate sender details
  const populatedMessage = await Message.findById(message._id)
    .populate('senderId', 'name profilePhoto');

  // Create notification for receiver
  await createNotification(
    receiverId,
    'new_message',
    `New message from ${req.user.name}`,
    `/chat/${bookingId}`
  );

  res.status(201).json({ success: true, message: populatedMessage });
};
```

**Flow:**
1. Validate message content
2. Verify booking exists
3. Verify user authorization
4. Determine receiver ID
5. Create message in database
6. Populate sender details
7. Create notification for receiver
8. Return populated message

---

#### D. Mark Messages as Read
```javascript
const markMessagesRead = async (req, res) => {
  const result = await Message.updateMany(
    {
      bookingId: req.params.bookingId,
      receiverId: req.user._id,
      isRead: false
    },
    { isRead: true }
  );

  res.status(200).json({ success: true, updated: result.modifiedCount });
};
```

**Purpose:** Mark all unread messages for the user in a booking as read

**Query:** Only updates messages where:
- Booking matches
- User is the receiver
- Message is unread

---

### 3. Database Model

**Location:** `backend/src/models/Message.js`

**Schema:**
```javascript
const messageSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true, 
    maxlength: 1000 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });
```

**Fields:**
- `bookingId` - Reference to Booking (required)
- `senderId` - Reference to User who sent (required)
- `receiverId` - Reference to User who receives (required)
- `content` - Message text (max 1000 chars, required)
- `isRead` - Read status (default: false)
- `createdAt` - Auto-generated timestamp
- `updatedAt` - Auto-generated timestamp

**Indexes (Recommended):**
```javascript
messageSchema.index({ bookingId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
```

---

## WebSocket Implementation

### 1. Socket Server Setup

**Location:** `backend/src/config/socket.js`

**Initialization:**
```javascript
const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Event handlers...

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};
```

**CORS Configuration:**
- Allows connections from frontend URL
- Supports GET and POST methods

---

### 2. Socket Events

#### A. Join Room
```javascript
socket.on('join-room', (bookingId) => {
  socket.join(bookingId);
  console.log(`Socket ${socket.id} joined room ${bookingId}`);
});
```

**Purpose:** User joins a room specific to their booking

**Room Naming:** Uses `bookingId` as room identifier

---

#### B. Leave Room
```javascript
socket.on('leave-room', (bookingId) => {
  socket.leave(bookingId);
  console.log(`Socket ${socket.id} left room ${bookingId}`);
});
```

**Purpose:** User leaves room when navigating away from chat

---

#### C. Send Message
```javascript
socket.on('send-message', async (message) => {
  try {
    io.to(message.bookingId).emit('new-message', message);
  } catch (error) {
    console.error('Error sending message:', error);
  }
});
```

**Purpose:** Broadcast message to all users in the booking room

**Flow:**
1. Receive message from sender
2. Broadcast to room (including sender)
3. All connected clients in room receive `new-message` event

---

#### D. Disconnect
```javascript
socket.on('disconnect', () => {
  console.log('User disconnected:', socket.id);
});
```

**Purpose:** Log when user disconnects

**Auto-cleanup:** Socket.IO automatically removes user from all rooms

---

## Message Flow Diagram

### Sending a Message

```
User types message
    ↓
Clicks Send / Presses Enter
    ↓
handleSend() called
    ↓
POST /messages (REST API)
    ↓
Backend validates & saves to DB
    ↓
Returns saved message
    ↓
Frontend adds to local state
    ↓
socket.emit('send-message')
    ↓
Socket server receives
    ↓
io.to(bookingId).emit('new-message')
    ↓
All clients in room receive
    ↓
Frontend updates message list
    ↓
Auto-scroll to bottom
```

---

### Receiving a Message

```
Other user sends message
    ↓
Socket server broadcasts
    ↓
socket.on('new-message') triggered
    ↓
Duplicate check
    ↓
Add to messages state
    ↓
Mark as read (API call)
    ↓
UI updates
    ↓
Auto-scroll to bottom
```

---

## Security Considerations

### 1. Authentication
- **JWT Required:** All REST API endpoints require valid JWT token
- **Socket Connection:** Should implement JWT authentication for WebSocket (future enhancement)

### 2. Authorization
- **Booking Verification:** User must be passenger or driver of the booking
- **Message Access:** Users can only access messages from their own bookings

### 3. Input Validation
- **Content Required:** Empty messages rejected
- **Max Length:** 1000 characters per message
- **Trim Whitespace:** Leading/trailing spaces removed

### 4. Data Privacy
- **Room Isolation:** Messages only sent to specific booking room
- **No Cross-booking Access:** Users cannot see messages from other bookings

---

## Performance Optimizations

### 1. Duplicate Prevention
```javascript
// Check by ID
if (message._id && prev.some(m => m._id === message._id)) {
  return prev;
}

// Check by content and timestamp
if (!message._id && prev.some(m => 
  m.content === message.content && 
  Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000
)) {
  return prev;
}
```

**Purpose:** Prevent same message appearing multiple times

---

### 2. Efficient Queries
- **Indexed Fields:** bookingId, receiverId, isRead
- **Selective Population:** Only populate required fields (name, profilePhoto)
- **Sorted Results:** Messages sorted by timestamp

---

### 3. Auto-scroll Optimization
```javascript
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
```

**Purpose:** Smooth scroll to latest message without jarring jumps

---

## Error Handling

### Frontend
```javascript
try {
  const response = await sendMessageAPI(bookingId, content);
  setMessages(prev => [...prev, response.message]);
  socket.emit('send-message', response.message);
} catch (err) {
  console.error(err);
  // Message not added to state if API fails
}
```

**Behavior:**
- Message only added to UI if API call succeeds
- Errors logged to console
- No user-facing error message (could be enhanced)

---

### Backend
```javascript
try {
  // Message logic
  res.status(201).json({ success: true, message: populatedMessage });
} catch (error) {
  res.status(500).json({ success: false, message: error.message });
}
```

**Error Responses:**
- 400: Invalid input (empty content)
- 403: Not authorized
- 404: Booking not found
- 500: Server error

---

## Integration Points

### Where Chat is Accessed

1. **Passenger Dashboard**
   - Upcoming rides with "Message Driver" button
   - Only visible for accepted bookings

2. **Driver Dashboard**
   - Booking requests with "Message" button
   - Only visible for accepted bookings

3. **Booking Details Pages**
   - Direct link to chat for accepted bookings

4. **Notifications**
   - New message notifications link to chat

---

## Database Relationships

```
User (Driver)
    ↓
Booking ← Message.bookingId
    ↓
User (Passenger)

Message.senderId → User
Message.receiverId → User
```

**Key Relationships:**
- Message belongs to Booking
- Message has sender (User)
- Message has receiver (User)
- Booking connects driver and passenger

---

## Future Enhancements

### 1. Typing Indicators
```javascript
socket.emit('typing', { bookingId, userId });
socket.on('user-typing', (data) => {
  // Show "User is typing..." indicator
});
```

### 2. Message Delivery Status
- Sent (✓)
- Delivered (✓✓)
- Read (✓✓ blue)

### 3. File Attachments
- Image sharing
- Document sharing
- Location sharing

### 4. Message Reactions
- Emoji reactions
- Like/thumbs up

### 5. Message Search
- Search within conversation
- Filter by date

### 6. Push Notifications
- Browser notifications for new messages
- Mobile push notifications

### 7. Message Encryption
- End-to-end encryption
- Secure message storage

### 8. Chat History Export
- Download conversation as PDF
- Email conversation transcript

### 9. Block/Report User
- Block abusive users
- Report inappropriate messages

### 10. Voice Messages
- Record and send voice notes
- Audio playback in chat

---

## Testing Scenarios

### Test Case 1: Send Message
**Steps:**
1. Open chat for accepted booking
2. Type message
3. Click send

**Expected:**
- Message appears immediately
- Other user receives message in real-time
- Message saved to database

---

### Test Case 2: Receive Message
**Steps:**
1. Have chat open
2. Other user sends message

**Expected:**
- Message appears without refresh
- Auto-scroll to bottom
- Message marked as read

---

### Test Case 3: Offline Message
**Steps:**
1. User A sends message while User B is offline
2. User B comes online and opens chat

**Expected:**
- User B sees all messages including offline ones
- Messages loaded from database

---

### Test Case 4: Duplicate Prevention
**Steps:**
1. Send message with slow network
2. Message broadcasts via WebSocket

**Expected:**
- Message appears only once
- No duplicates in UI

---

### Test Case 5: Authorization
**Steps:**
1. Try to access chat for booking user is not part of

**Expected:**
- 403 Forbidden error
- No messages displayed

---

### Test Case 6: Empty Message
**Steps:**
1. Try to send empty message or only whitespace

**Expected:**
- Message not sent
- No API call made

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Message Delivery Time**
   - Time from send to receive
   - Target: < 100ms

2. **WebSocket Connection Stability**
   - Connection drops
   - Reconnection rate

3. **Message Read Rate**
   - % of messages marked as read
   - Average time to read

4. **Active Conversations**
   - Number of active chats
   - Messages per conversation

5. **Error Rate**
   - Failed message sends
   - Authorization failures

---

## Configuration

### Environment Variables

**Frontend:**
```
VITE_SOCKET_URL=http://localhost:5000
```

**Backend:**
```
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Adjustable Parameters

```javascript
// Message max length
maxlength: 1000

// Message bubble max width
max-w-[70%]

// Auto-scroll behavior
behavior: 'smooth'

// Duplicate detection window
Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000
```

---

## Conclusion

The Chat implementation provides real-time messaging between passengers and drivers using a hybrid approach:
- **REST API** for message persistence and history
- **WebSocket** for real-time delivery
- **Room-based** architecture for isolation
- **Duplicate prevention** for reliability
- **Authorization** for security

The system ensures messages are delivered instantly when users are online and persisted for offline access, providing a seamless communication experience.
