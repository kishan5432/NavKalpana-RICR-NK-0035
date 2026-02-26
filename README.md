# RideShareX - Rideshare Platform

A full-stack carpooling/rideshare platform built with MERN stack, featuring real-time chat, intelligent pricing, monetization system, and ride optimization.

## 🚀 Features

### Core Functionality
- **Dual Role System**: Separate interfaces for drivers and passengers
- **Smart Search**: Location-based ride search with filters (date, seats, price)
- **Real-time Chat**: Socket.io powered messaging between drivers and passengers
- **Booking Management**: Request, accept, reject, and cancel bookings
- **Rating System**: Mutual rating system for drivers and passengers
- **Reliability Scoring**: Automated reliability calculation based on user behavior

### Monetization
- **Service Fee (10%)**: Automatic platform commission on completed rides
- **Premium Visibility (₹99/7 days)**: Boost rides to top of search results
- **Instant Confirmation Badge (₹199/month)**: Profile badge for quick responders

### Intelligent Features
- **AI Price Suggestion**: Dynamic pricing based on distance, demand, and saved routes
- **Ride Optimization**: Low booking rate detection with actionable suggestions
- **Personalized Recommendations**: Route suggestions based on user activity
- **Saved Routes**: Passengers can save frequent routes for notifications

### Additional Features
- **Referral System**: ₹100 credit for successful referrals
- **Email Verification**: OTP-based email/phone verification
- **Profile Management**: Upload photos, manage vehicle details
- **Earnings Dashboard**: Detailed transaction history and charts
- **Notifications**: Real-time in-app notifications

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **SendGrid/Nodemailer** - Email service

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router v7** - Navigation
- **Tailwind CSS v4** - Styling
- **Shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Socket.io-client** - WebSocket client
- **Sonner** - Toast notifications

## 📁 Project Structure

```
NavKalpana-RICR-NK-0035/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── monetization.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   └── socket.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── rides.controller.js
│   │   │   ├── bookings.controller.js
│   │   │   ├── earnings.controller.js
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Ride.js
│   │   │   ├── Booking.js
│   │   │   ├── Transaction.js
│   │   │   └── ...
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── driver/
│   │   │   ├── passenger/
│   │   │   └── shared/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd NavKalpana-RICR-NK-0035
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@navkalpana.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. **Run the Application**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/send-otp` - Send OTP for verification
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Rides
- `GET /api/rides` - Search rides (public)
- `POST /api/rides` - Create ride (driver only)
- `GET /api/rides/:id` - Get ride details
- `PUT /api/rides/:id` - Update ride (driver only)
- `PATCH /api/rides/:id/cancel` - Cancel ride
- `PATCH /api/rides/:id/start` - Start ride
- `PATCH /api/rides/:id/complete` - Complete ride
- `POST /api/rides/:id/boost` - Boost ride visibility (₹99)

### Bookings
- `POST /api/bookings` - Create booking (passenger only)
- `GET /api/bookings/my` - Get user bookings
- `PATCH /api/bookings/:id/accept` - Accept booking (driver only)
- `PATCH /api/bookings/:id/reject` - Reject booking (driver only)
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Earnings
- `GET /api/driver/earnings` - Get driver earnings dashboard

### Price Suggestion
- `GET /api/price-suggestion` - Get AI price suggestion (driver only)

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/upload-photo` - Upload profile photo
- `POST /api/users/driver/subscribe/instant-badge` - Subscribe to instant badge (₹199)

## 💰 Monetization System

### Service Fee
- **Rate**: 10% of ride value
- **Calculation**: Automatic on booking acceptance
- **Formula**: `fee = (price_per_seat × seats_booked) × 0.10`

### Premium Visibility
- **Price**: ₹99 per ride
- **Duration**: 7 days
- **Benefit**: Ride appears at top of search results

### Instant Confirmation Badge
- **Price**: ₹199 per month
- **Duration**: 30 days
- **Benefit**: Profile badge showing quick response time

## 🧮 Price Suggestion Algorithm

```
Base Price = Distance (km) × ₹4

Demand Analysis:
  - Seats booked in ±3 days
  - Saved routes count
  
Demand Levels:
  - High (>10 seats): +20%
  - Moderate (4-10 seats): +10%
  - Low (<4 seats): No adjustment
  
Saved Routes Boost:
  - If >5 saved routes: Bump demand tier

Price Range: Base ± 10%
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Role-based access control
- OTP verification (10-minute expiry)
- CORS configuration
- Input validation with express-validator

## 🎨 UI Theme

- **Primary**: Purple (#3A2A5A)
- **Accent**: Pink (#EC3399)
- **Gradient**: Purple to Pink
- **Design**: Mobile-first responsive

## 📊 Database Models

- **User**: Profile, vehicle, ratings, reliability, badges
- **Ride**: Trip details, pricing, status, premium visibility
- **Booking**: Requests, acceptance, status tracking
- **Transaction**: Earnings, fees, premium purchases
- **Message**: Real-time chat messages
- **Rating**: User reviews
- **SavedRoute**: Passenger route preferences
- **Notification**: In-app notifications

## 🔄 Booking Flow

### Passenger Journey
1. Search rides by location, date, seats
2. View ride details and driver profile
3. Request booking
4. Wait for driver acceptance
5. Chat with driver
6. Complete ride
7. Rate driver

### Driver Journey
1. Post ride with details
2. Receive booking requests
3. Accept/reject requests
4. Start ride
5. Complete ride
6. Rate passengers
7. View earnings

## 📈 Future Enhancements

- Payment gateway integration (Razorpay/Stripe)
- Mobile app (React Native)
- Google Maps integration for distance calculation
- Push notifications
- Admin dashboard
- Multi-language support
- Advanced analytics
- Subscription plans

