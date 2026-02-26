# Driver Reliability System Documentation

## Overview
The Driver Reliability System calculates a comprehensive score (0-100) for each user based on their behavior as both a driver and passenger. This score helps build trust in the platform and allows users to make informed decisions when booking rides.

---

## Reliability Score Components

The reliability score is calculated using **4 weighted factors**:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Ride Completion Rate** | 40% | Percentage of rides completed successfully |
| **Cancellation Frequency** | 25% | Inverse of cancellation rate (lower cancellations = higher score) |
| **Rating Average** | 25% | User's average rating from other users |
| **Response Score** | 10% | Driver's acceptance rate for booking requests |

**Total Score Range:** 0-100

---

## Score Calculation Logic

### Location
**File:** `backend/src/utils/calculateReliability.js`

### Function: `calculateReliabilityScore(userId)`

#### 1. Ride Completion Rate (40 points max)

**Formula:**
```javascript
completionRate = ((completedPassenger + completedDriver) / totalTrips) × 40
```

**Data Sources:**
- **Passenger bookings:** `Booking.find({ passengerId: userId, status: 'completed' })`
- **Driver rides:** `Ride.find({ driverId: userId, status: 'completed' })`

**Default:** If no trips exist, score = 20 (50% of max)

**Example:**
- Total trips: 20
- Completed trips: 18
- Completion rate: (18/20) × 40 = **36 points**

---

#### 2. Cancellation Frequency (25 points max)

**Formula:**
```javascript
cancellationRatio = (cancelledPassenger + cancelledDriver) / totalTrips
cancellationRate = (1 - cancellationRatio) × 25
```

**Data Sources:**
- **Passenger cancellations:** `Booking.find({ passengerId: userId, status: 'cancelled', cancelledBy: 'passenger' })`
- **Driver cancellations:** `Ride.find({ driverId: userId, status: 'cancelled' })`

**Default:** If no trips exist, score = 12.5 (50% of max)

**Example:**
- Total trips: 20
- Cancelled trips: 2
- Cancellation ratio: 2/20 = 0.1
- Cancellation rate: (1 - 0.1) × 25 = **22.5 points**

---

#### 3. Rating Average (25 points max)

**Formula:**
```javascript
ratingScore = (user.rating.average / 5) × 25
```

**Data Source:**
- **User rating:** `User.rating.average` (0-5 scale)
- **Rating count:** `User.rating.count`

**Default:** If no ratings exist, score = 12.5 (50% of max)

**Example:**
- Average rating: 4.5/5
- Rating score: (4.5/5) × 25 = **22.5 points**

---

#### 4. Response Score (10 points max)

**Formula:**
```javascript
responseRatio = acceptedCount / requestedBookings
responseScore = responseRatio × 10
```

**Data Sources:**
- **Accepted bookings:** `Booking.find({ driverId: userId, status: 'accepted' })`
- **Total requests:** `Booking.find({ driverId: userId, status: ['accepted', 'rejected'] })`

**Default:** If no requests exist, score = 5 (50% of max)

**Note:** This only applies to drivers (passengers don't accept/reject bookings)

**Example:**
- Total booking requests: 30
- Accepted: 27
- Response ratio: 27/30 = 0.9
- Response score: 0.9 × 10 = **9 points**

---

## Reliability Labels

Based on the final score, users are assigned a label:

| Score Range | Label | Badge Color |
|-------------|-------|-------------|
| 0-40 | **Low** | Red |
| 41-70 | **Moderate** | Yellow |
| 71-100 | **High** | Green |

---

## Database Schema

### User Model (`models/User.js`)

```javascript
{
  reliabilityScore: { 
    type: Number, 
    default: 50,  // New users start at 50 (Moderate)
    min: 0, 
    max: 100 
  },
  reliabilityLabel: { 
    type: String, 
    enum: ['Low', 'Moderate', 'High'], 
    default: 'Moderate' 
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}
```

### Booking Model (`models/Booking.js`)

```javascript
{
  rideId: ObjectId,
  passengerId: ObjectId,
  driverId: ObjectId,
  seatsBooked: Number,
  totalPrice: Number,
  status: ['requested', 'accepted', 'rejected', 'cancelled', 'completed'],
  cancelledBy: ['driver', 'passenger']  // Only set when status = 'cancelled'
}
```

### Ride Model (`models/Ride.js`)

```javascript
{
  driverId: ObjectId,
  from: String,
  to: String,
  status: ['active', 'fully_booked', 'in_progress', 'cancelled', 'completed']
}
```

---

## Calculation Triggers

The reliability score is **automatically recalculated** when:

### 1. Booking Accepted
**Endpoint:** `POST /api/bookings/:id/accept`
**Controller:** `bookings.controller.js` → `acceptBooking()`

```javascript
await calculateReliabilityScore(req.user._id.toString());
```

**Why:** Driver's response score increases (accepted a booking request)

---

### 2. Booking Rejected
**Endpoint:** `POST /api/bookings/:id/reject`
**Controller:** `bookings.controller.js` → `rejectBooking()`

```javascript
await calculateReliabilityScore(req.user._id.toString());
```

**Why:** Driver's response score may decrease (rejected a booking request)

---

### 3. Booking Cancelled
**Endpoint:** `POST /api/bookings/:id/cancel`
**Controller:** `bookings.controller.js` → `cancelBooking()`

```javascript
await calculateReliabilityScore(booking.passengerId.toString());
await calculateReliabilityScore(booking.driverId.toString());
```

**Why:** 
- Cancellation frequency increases for the cancelling party
- Both passenger and driver scores are recalculated

---

### 4. Ride Completed
**Endpoint:** `POST /api/rides/:id/complete`
**Controller:** `rides.controller.js` → `completeRide()`

```javascript
await calculateReliabilityScore(ride.driverId.toString());
// Also recalculates for all passengers in that ride
```

**Why:** Completion rate increases for all participants

---

### 5. Rating Submitted
**Endpoint:** `POST /api/bookings/:id/rate`
**Controller:** `bookings.controller.js` → `rateBooking()`

```javascript
await calculateReliabilityScore(ratedUserId);
```

**Why:** User's average rating changes, affecting their reliability score

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTION TRIGGERS                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
  Accept Booking      Reject Booking       Cancel Booking
  Complete Ride       Submit Rating
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         calculateReliabilityScore(userId) CALLED             │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
  Fetch User Data    Fetch Bookings         Fetch Rides
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  CALCULATE 4 COMPONENTS                      │
│  1. Completion Rate (40%)                                    │
│  2. Cancellation Frequency (25%)                             │
│  3. Rating Average (25%)                                     │
│  4. Response Score (10%)                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    Sum all components
                              ↓
                    Round to nearest integer
                              ↓
                    Determine label:
                    0-40: Low
                    41-70: Moderate
                    71-100: High
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              UPDATE USER DOCUMENT IN DATABASE                │
│  User.reliabilityScore = finalScore                          │
│  User.reliabilityLabel = label                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND DISPLAYS BADGE                     │
│  <ReliabilityBadge label={user.reliabilityLabel} />         │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Implementation

### Component: `ReliabilityBadge.jsx`

**Location:** `frontend/src/components/ReliabilityBadge.jsx`

```javascript
import { Badge } from './ui/badge';
import { Shield } from 'lucide-react';

export default function ReliabilityBadge({ label }) {
  const colors = {
    Low: 'bg-red-500 text-white border-red-600',
    Moderate: 'bg-yellow-500 text-white border-yellow-600',
    High: 'bg-green-500 text-white border-green-600'
  };

  return (
    <Badge className={`${colors[label] || colors.Moderate} font-medium px-2 py-0.5 text-xs flex items-center gap-1`}>
      <Shield className="w-3 h-3" />
      {label}
    </Badge>
  );
}
```

### Usage in Frontend

The reliability badge is displayed in multiple locations:

#### 1. Ride Search Results
```javascript
<ReliabilityBadge label={ride.driverId.reliabilityLabel} />
```

#### 2. Ride Detail Page
```javascript
<div className="flex items-center gap-2">
  <span>{driver.name}</span>
  <ReliabilityBadge label={driver.reliabilityLabel} />
</div>
```

#### 3. Booking Requests (Driver View)
```javascript
<div className="passenger-info">
  <span>{passenger.name}</span>
  <ReliabilityBadge label={passenger.reliabilityLabel} />
</div>
```

#### 4. User Profile
```javascript
<div className="profile-stats">
  <div>Reliability Score: {user.reliabilityScore}/100</div>
  <ReliabilityBadge label={user.reliabilityLabel} />
</div>
```

---

## API Endpoints

### Get User Profile (includes reliability)
**Endpoint:** `GET /api/users/profile`
**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "reliabilityScore": 85,
    "reliabilityLabel": "High",
    "rating": {
      "average": 4.5,
      "count": 20
    }
  }
}
```

### Get Bookings (includes reliability for both users)
**Endpoint:** `GET /api/bookings`
**Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "...",
      "passengerId": {
        "name": "Jane Smith",
        "reliabilityScore": 72,
        "reliabilityLabel": "High"
      },
      "driverId": {
        "name": "John Doe",
        "reliabilityScore": 85,
        "reliabilityLabel": "High"
      }
    }
  ]
}
```

---

## Example Calculation

### User Profile:
- **Total trips:** 50 (30 as passenger, 20 as driver)
- **Completed trips:** 45 (27 as passenger, 18 as driver)
- **Cancelled trips:** 3 (2 as passenger, 1 as driver)
- **Average rating:** 4.2/5 (from 35 ratings)
- **Booking requests received:** 40 (as driver)
- **Booking requests accepted:** 36 (as driver)

### Calculation:

**1. Completion Rate:**
```
(45 / 50) × 40 = 0.9 × 40 = 36 points
```

**2. Cancellation Frequency:**
```
(1 - (3 / 50)) × 25 = 0.94 × 25 = 23.5 points
```

**3. Rating Average:**
```
(4.2 / 5) × 25 = 0.84 × 25 = 21 points
```

**4. Response Score:**
```
(36 / 40) × 10 = 0.9 × 10 = 9 points
```

**Final Score:**
```
36 + 23.5 + 21 + 9 = 89.5 → 90 points (rounded)
```

**Label:** High (90 > 71)

---

## Key Design Principles

1. **Automatic Calculation:** Score updates automatically on relevant actions
2. **Dual Role Support:** Considers behavior as both driver and passenger
3. **Fair Defaults:** New users start at 50 (Moderate) to avoid penalizing them
4. **Weighted Components:** Most important factors (completion, cancellation) have higher weights
5. **Real-time Updates:** Score recalculates immediately after each action
6. **Transparent Display:** Users can see their score and understand how to improve it

---

## Impact on Platform

### For Passengers:
- Can see driver reliability before booking
- Make informed decisions about ride safety
- Trust drivers with "High" reliability badges

### For Drivers:
- Incentivized to maintain high completion rates
- Encouraged to respond promptly to booking requests
- Rewarded for good behavior with better visibility

### For Platform:
- Builds trust and credibility
- Reduces cancellations and no-shows
- Improves overall user experience
- Creates accountability for both parties

---

## Future Enhancements

1. **Time-weighted scoring:** Recent behavior weighted more heavily
2. **Streak bonuses:** Reward consecutive completed rides
3. **Penalty recovery:** Allow users to improve score faster after penalties
4. **Detailed breakdown:** Show users exactly how their score is calculated
5. **Reliability tiers:** Unlock premium features at certain score thresholds
6. **Comparative metrics:** Show user's score vs. platform average
7. **Notification system:** Alert users when their score drops below thresholds
8. **Dispute resolution:** Allow users to contest unfair cancellations

---

## Monitoring & Analytics

### Recommended Metrics to Track:

1. **Average reliability score** across all users
2. **Distribution of labels** (Low/Moderate/High percentages)
3. **Score improvement rate** over time
4. **Correlation between score and booking success rate**
5. **Impact of score on user retention**
6. **Cancellation rates by reliability tier**

### Database Queries for Analytics:

```javascript
// Average score across platform
db.users.aggregate([
  { $group: { _id: null, avgScore: { $avg: "$reliabilityScore" } } }
])

// Distribution of labels
db.users.aggregate([
  { $group: { _id: "$reliabilityLabel", count: { $sum: 1 } } }
])

// Users with declining scores (requires historical tracking)
db.users.find({ 
  reliabilityScore: { $lt: 50 },
  role: "driver"
}).sort({ reliabilityScore: 1 })
```

---

## Troubleshooting

### Issue: Score not updating after action
**Solution:** Check if `calculateReliabilityScore()` is called in the controller

### Issue: Score stuck at 50 for new users
**Solution:** This is expected behavior. Score updates after first completed trip.

### Issue: Score seems incorrect
**Solution:** Verify all 4 components are calculating correctly. Check database for accurate booking/ride counts.

### Issue: Label doesn't match score
**Solution:** Ensure label thresholds are correct (0-40: Low, 41-70: Moderate, 71-100: High)

---

## Testing Scenarios

### Test Case 1: New User
- **Expected:** Score = 50, Label = "Moderate"
- **Verify:** Check default values in User model

### Test Case 2: Perfect Driver
- **Setup:** 20 completed rides, 0 cancellations, 5.0 rating, 100% acceptance
- **Expected:** Score = 100, Label = "High"

### Test Case 3: Frequent Canceller
- **Setup:** 10 completed, 5 cancelled, 3.5 rating, 80% acceptance
- **Expected:** Score ≈ 55-65, Label = "Moderate"

### Test Case 4: Low Responder
- **Setup:** 15 completed, 1 cancelled, 4.0 rating, 50% acceptance
- **Expected:** Score ≈ 65-70, Label = "Moderate"

---

## Conclusion

The Driver Reliability System provides a comprehensive, fair, and transparent way to measure user trustworthiness on the platform. By considering multiple factors and updating in real-time, it creates accountability and encourages positive behavior from all users.
