# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📝 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "driver",
  "referredBy": "ABC123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "driver",
    "isEmailVerified": false,
    "isPhoneVerified": false
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "driver",
    "rating": { "average": 4.5, "count": 10 },
    "profilePhoto": "https://...",
    "isEmailVerified": true
  }
}
```

### Send OTP
```http
POST /auth/send-otp
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

### Verify OTP
```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "type": "email"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Verified successfully"
}
```

### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

### Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 👤 User Endpoints

### Get Current User
```http
GET /users/me
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "driver",
    "profilePhoto": "https://...",
    "bio": "Experienced driver",
    "vehicle": {
      "make": "Toyota",
      "model": "Camry",
      "color": "Black",
      "plate": "MH01AB1234",
      "year": "2020"
    },
    "rating": { "average": 4.5, "count": 10 },
    "reliabilityScore": 85,
    "reliabilityLabel": "High",
    "instant_badge_active": true,
    "instant_badge_until": "2024-02-15T00:00:00.000Z",
    "credits": 100
  }
}
```

### Update Profile
```http
PUT /users/me
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Professional driver with 5 years experience",
  "vehicle": {
    "make": "Honda",
    "model": "Civic",
    "color": "White",
    "plate": "MH02CD5678",
    "year": "2021"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": { /* updated user object */ }
}
```

### Upload Profile Photo
```http
POST /users/me/upload-photo
```
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
photo: <file>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "profilePhoto": "https://res.cloudinary.com/..."
}
```

### Get User by ID
```http
GET /users/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "profilePhoto": "https://...",
    "rating": { "average": 4.5, "count": 10 },
    "reliabilityScore": 85,
    "reliabilityLabel": "High",
    "instant_badge_active": true
  }
}
```

### Subscribe to Instant Badge
```http
POST /users/driver/subscribe/instant-badge
```
**Auth Required:** Yes (Driver only)

**Request Body:**
```json
{
  "payment_confirmed": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Instant badge activated successfully",
  "user": { /* updated user with badge */ }
}
```

---

## 🚗 Ride Endpoints

### Search Rides
```http
GET /rides?from=Mumbai&to=Pune&date=2024-01-15&seats=2&minPrice=100&maxPrice=500&sort=price&page=1&limit=10
```

**Query Parameters:**
- `from` (string): Departure location
- `to` (string): Destination location
- `date` (string): Travel date (YYYY-MM-DD)
- `seats` (number): Required seats
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sort` (string): Sort by `price`, `departure`, or `newest`
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "total": 25,
  "page": 1,
  "rides": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "driverId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "profilePhoto": "https://...",
        "rating": { "average": 4.5, "count": 10 },
        "reliabilityScore": 85,
        "instant_badge_active": true
      },
      "from": "Mumbai",
      "to": "Pune",
      "stops": ["Lonavala"],
      "date": "2024-01-15T00:00:00.000Z",
      "departureTime": "08:00",
      "totalSeats": 4,
      "availableSeats": 2,
      "pricePerSeat": 300,
      "vehicle": {
        "make": "Toyota",
        "model": "Camry",
        "color": "Black",
        "plate": "MH01AB1234"
      },
      "luggageAllowance": "small",
      "preferences": {
        "smoking": false,
        "pets": false,
        "music": true
      },
      "status": "active",
      "is_premium_visible": true,
      "premium_visible_until": "2024-01-22T00:00:00.000Z"
    }
  ]
}
```

### Create Ride
```http
POST /rides
```
**Auth Required:** Yes (Driver only)

**Request Body:**
```json
{
  "from": "Mumbai",
  "to": "Pune",
  "stops": ["Lonavala"],
  "date": "2024-01-15",
  "departureTime": "08:00",
  "totalSeats": 4,
  "pricePerSeat": 300,
  "vehicle": {
    "make": "Toyota",
    "model": "Camry",
    "color": "Black",
    "plate": "MH01AB1234"
  },
  "luggageAllowance": "small",
  "preferences": {
    "smoking": false,
    "pets": false,
    "music": true
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "ride": { /* created ride object */ }
}
```

### Get Ride by ID
```http
GET /rides/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "ride": { /* ride object with driver details */ }
}
```

### Update Ride
```http
PUT /rides/:id
```
**Auth Required:** Yes (Driver only, own ride)

**Request Body:**
```json
{
  "pricePerSeat": 350,
  "departureTime": "09:00",
  "stops": ["Lonavala", "Khandala"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "ride": { /* updated ride object */ }
}
```

### Get My Posted Rides
```http
GET /rides/my-rides
```
**Auth Required:** Yes (Driver only)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "rides": [ /* array of rides */ ]
}
```

### Get Driver Stats
```http
GET /rides/driver-stats
```
**Auth Required:** Yes (Driver only)

**Response:** `200 OK`
```json
{
  "success": true,
  "stats": {
    "totalRides": 25,
    "activeRides": 3,
    "completedRides": 20,
    "cancelledRides": 2,
    "totalBookings": 45,
    "acceptedBookings": 40,
    "totalEarnings": 15000,
    "upcomingRides": [ /* array of upcoming rides */ ]
  }
}
```

### Cancel Ride
```http
PATCH /rides/:id/cancel
```
**Auth Required:** Yes (Driver only, own ride)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Ride cancelled",
  "cancelledBookings": 3
}
```

### Start Ride
```http
PATCH /rides/:id/start
```
**Auth Required:** Yes (Driver only, own ride)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Ride started",
  "ride": { /* updated ride object */ }
}
```

### Complete Ride
```http
PATCH /rides/:id/complete
```
**Auth Required:** Yes (Driver only, own ride)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Ride completed"
}
```

### Boost Ride (Premium Visibility)
```http
POST /rides/:id/boost
```
**Auth Required:** Yes (Driver only, own ride)

**Request Body:**
```json
{
  "payment_confirmed": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Ride boosted successfully",
  "ride": {
    "is_premium_visible": true,
    "premium_visible_until": "2024-01-22T00:00:00.000Z"
  }
}
```

### Get Optimization Suggestions
```http
GET /rides/:id/optimization-suggestions
```
**Auth Required:** Yes (Driver only, own ride)

**Response:** `200 OK`
```json
{
  "success": true,
  "low_booking_rate": true,
  "fill_rate": 0.25,
  "suggestions": [
    {
      "type": "price",
      "message": "Your price is 20% higher than average. Consider lowering to ₹280."
    },
    {
      "type": "details",
      "message": "Add more details about your route to attract passengers."
    }
  ]
}
```

---

## 📅 Booking Endpoints

### Create Booking
```http
POST /bookings
```
**Auth Required:** Yes (Passenger only)

**Request Body:**
```json
{
  "rideId": "507f1f77bcf86cd799439011",
  "seatsBooked": 2
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "booking": {
    "_id": "507f1f77bcf86cd799439013",
    "rideId": { /* ride details */ },
    "passengerId": { /* passenger details */ },
    "driverId": "507f1f77bcf86cd799439012",
    "seatsBooked": 2,
    "totalPrice": 600,
    "status": "requested",
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

### Get My Bookings
```http
GET /bookings/my
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "bookings": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "rideId": { /* ride details */ },
      "passengerId": { /* passenger details */ },
      "driverId": { /* driver details */ },
      "seatsBooked": 2,
      "totalPrice": 600,
      "status": "accepted",
      "hasRated": {
        "driver": false,
        "passenger": false
      },
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

### Get Booking by ID
```http
GET /bookings/:id
```
**Auth Required:** Yes (Participant only)

**Response:** `200 OK`
```json
{
  "success": true,
  "booking": { /* booking details */ }
}
```

### Accept Booking
```http
PATCH /bookings/:id/accept
```
**Auth Required:** Yes (Driver only)

**Response:** `200 OK`
```json
{
  "success": true,
  "booking": { /* updated booking with status: "accepted" */ }
}
```

### Reject Booking
```http
PATCH /bookings/:id/reject
```
**Auth Required:** Yes (Driver only)

**Response:** `200 OK`
```json
{
  "success": true,
  "booking": { /* updated booking with status: "rejected" */ }
}
```

### Cancel Booking
```http
PATCH /bookings/:id/cancel
```
**Auth Required:** Yes (Driver or Passenger)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Booking cancelled",
  "booking": {
    "status": "cancelled",
    "cancelledBy": "passenger"
  }
}
```

---

## 💬 Message Endpoints

### Get Conversations
```http
GET /messages/conversations
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "conversations": [
    {
      "bookingId": "507f1f77bcf86cd799439013",
      "otherUser": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "profilePhoto": "https://..."
      },
      "lastMessage": {
        "content": "See you tomorrow!",
        "createdAt": "2024-01-10T15:30:00.000Z"
      },
      "unreadCount": 2
    }
  ]
}
```

### Get Messages by Booking
```http
GET /messages/booking/:bookingId
```
**Auth Required:** Yes (Participant only)

**Response:** `200 OK`
```json
{
  "success": true,
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "bookingId": "507f1f77bcf86cd799439013",
      "senderId": "507f1f77bcf86cd799439012",
      "receiverId": "507f1f77bcf86cd799439015",
      "content": "What time should I pick you up?",
      "isRead": true,
      "createdAt": "2024-01-10T14:00:00.000Z"
    }
  ]
}
```

### Send Message
```http
POST /messages
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "bookingId": "507f1f77bcf86cd799439013",
  "content": "I'll be ready at 8 AM"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": { /* created message object */ }
}
```

### Mark Messages as Read
```http
PUT /messages/booking/:bookingId/read
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

## ⭐ Rating Endpoints

### Submit Rating
```http
POST /ratings
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "bookingId": "507f1f77bcf86cd799439013",
  "ratedUserId": "507f1f77bcf86cd799439012",
  "stars": 5,
  "comment": "Great driver, very punctual!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "rating": { /* created rating object */ }
}
```

### Get User Ratings
```http
GET /ratings/user/:userId
```

**Response:** `200 OK`
```json
{
  "success": true,
  "ratings": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "raterId": {
        "name": "Jane Smith",
        "profilePhoto": "https://..."
      },
      "stars": 5,
      "comment": "Excellent service!",
      "createdAt": "2024-01-10T16:00:00.000Z"
    }
  ]
}
```

---

## 💰 Earnings Endpoints

### Get Driver Earnings
```http
GET /driver/earnings
```
**Auth Required:** Yes (Driver only)

**Response:** `200 OK`
```json
{
  "success": true,
  "total_earned": 15000,
  "total_rides": 25,
  "total_platform_fee": 1500,
  "earnings_chart": [
    { "date": "2024-01-08", "earnings": 500 },
    { "date": "2024-01-09", "earnings": 750 },
    { "date": "2024-01-10", "earnings": 600 }
  ],
  "recent_transactions": [
    {
      "type": "service_fee",
      "description": "Mumbai → Pune",
      "date": "2024-01-10T10:00:00.000Z",
      "amount": 270,
      "status": "completed"
    },
    {
      "type": "premium_visibility",
      "description": "Boost: Delhi → Jaipur",
      "date": "2024-01-09T15:00:00.000Z",
      "amount": -99,
      "status": "completed"
    }
  ]
}
```

---

## 💡 Price Suggestion Endpoints

### Get Price Suggestion
```http
GET /price-suggestion?from_location=Mumbai&to_location=Pune&ride_date=2024-01-15&distance_km=150
```
**Auth Required:** Yes (Driver only)

**Query Parameters:**
- `from_location` (string): Departure location
- `to_location` (string): Destination location
- `ride_date` (string): Travel date (YYYY-MM-DD)
- `distance_km` (number): Distance in kilometers

**Response:** `200 OK`
```json
{
  "success": true,
  "suggested_min": 648,
  "suggested_max": 792,
  "demand_level": "high",
  "based_on_routes": 12,
  "demand_signal": {
    "total_seats_booked": 12,
    "saved_route_count": 8
  }
}
```

---

## 🔖 Saved Routes Endpoints

### Save Route
```http
POST /saved-routes
```
**Auth Required:** Yes (Passenger only)

**Request Body:**
```json
{
  "fromLocation": "Mumbai",
  "toLocation": "Pune"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "savedRoute": {
    "_id": "507f1f77bcf86cd799439017",
    "userId": "507f1f77bcf86cd799439015",
    "fromLocation": "Mumbai",
    "toLocation": "Pune",
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

### Get Saved Routes
```http
GET /saved-routes
```
**Auth Required:** Yes (Passenger only)

**Response:** `200 OK`
```json
{
  "success": true,
  "savedRoutes": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "fromLocation": "Mumbai",
      "toLocation": "Pune",
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

---

## 🔔 Notification Endpoints

### Get Notifications
```http
GET /users/me/notifications
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439018",
      "type": "booking_accepted",
      "message": "Your booking was accepted",
      "link": "/passenger/bookings",
      "isRead": false,
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

### Mark Notification as Read
```http
PATCH /users/me/notifications/:id/read
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read
```http
PATCH /users/me/notifications/read-all
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 🎯 Recommendations Endpoints

### Get Recommendations
```http
GET /recommendations/:userId
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "recommendations": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "from": "Mumbai",
      "to": "Pune",
      "date": "2024-01-15T00:00:00.000Z",
      "pricePerSeat": 300,
      "availableSeats": 2,
      "driverId": { /* driver details */ }
    }
  ]
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message details"
}
```

---

## 🔌 WebSocket Events (Socket.io)

### Client Events

**Join Room:**
```javascript
socket.emit('join-room', bookingId);
```

**Leave Room:**
```javascript
socket.emit('leave-room', bookingId);
```

**Send Message:**
```javascript
socket.emit('send-message', {
  bookingId: '507f1f77bcf86cd799439013',
  senderId: '507f1f77bcf86cd799439012',
  receiverId: '507f1f77bcf86cd799439015',
  content: 'Hello!'
});
```

### Server Events

**New Message:**
```javascript
socket.on('new-message', (message) => {
  // Handle new message
});
```

---

## 📊 Rate Limits

Currently no rate limiting implemented. Recommended for production:
- Authentication endpoints: 5 requests/minute
- Search endpoints: 30 requests/minute
- Other endpoints: 60 requests/minute

---

## 🔒 Security Notes

1. All passwords are hashed with bcrypt (12 rounds)
2. JWT tokens expire after 30 days
3. OTP codes expire after 10 minutes
4. CORS is configured for specific origins
5. Input validation on all endpoints
6. Role-based access control enforced

---

**Last Updated:** January 2024  
**API Version:** 1.0
