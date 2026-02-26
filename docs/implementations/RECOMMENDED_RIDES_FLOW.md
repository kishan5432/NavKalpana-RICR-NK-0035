# Recommended Rides Flow Documentation

## Overview
The Recommended Rides feature provides personalized ride suggestions to passengers based on their travel history, saved routes, and popular routes in the system.

---

## Architecture Flow

```
Frontend Component (RideRecommendations.jsx)
    ↓
API Call (getRecommendations)
    ↓
Backend Route (/recommendations/:userId)
    ↓
Controller (recommendations.controller.js)
    ↓
Utility Function (recommendations.js)
    ↓
Database Queries (UserActivity, Ride, User, Booking)
    ↓
Response with Recommendations
    ↓
Frontend Display
```

---

## Frontend Implementation

### Component: `RideRecommendations.jsx`

**Location:** `frontend/src/components/RideRecommendations.jsx`

**Purpose:** Display personalized ride recommendations to passengers on their dashboard

**Key Features:**
- Only visible to users with role 'passenger'
- Shows loading skeleton while fetching data
- Displays empty state if no recommendations
- Shows up to 5 recommended rides in a grid layout
- Each ride card is clickable and navigates to ride details

**State Management:**
```javascript
const [recommendations, setRecommendations] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(false);
```

**Data Flow:**
1. Component mounts and checks if user is a passenger
2. Calls `fetchRecommendations()` function
3. Makes API call to `getRecommendations(user._id)`
4. Updates state with received recommendations
5. Renders ride cards with recommendation reasons

**UI States:**
- **Loading:** Shows 3 skeleton cards
- **Empty:** Shows message "Search for rides to get personalized recommendations"
- **Success:** Displays grid of recommended ride cards

**Ride Card Information:**
- Driver avatar and name
- Reliability badge
- Route (from → to)
- Date and departure time
- Price per seat
- Available seats
- Recommendation reason badge
- "View Ride" button

---

## API Layer

### API Function: `getRecommendations`

**Location:** `frontend/src/api/index.js`

**Endpoint:** `GET /recommendations/:userId`

**Implementation:**
```javascript
export const getRecommendations = (userId) => 
  axios.get(`/recommendations/${userId}`).then(res => res.data);
```

**Parameters:**
- `userId` (string): The ID of the passenger requesting recommendations

**Returns:**
```javascript
{
  success: true,
  recommendations: [
    {
      _id: "ride_id",
      from: "Location A",
      to: "Location B",
      date: "2024-01-01",
      departureTime: "10:00",
      pricePerSeat: 500,
      availableSeats: 3,
      driverId: {
        _id: "driver_id",
        name: "Driver Name",
        profilePhoto: "url",
        rating: { average: 4.5, count: 10 },
        reliabilityLabel: "High"
      },
      recommendationReason: "You often travel Location A → Location B"
    }
  ]
}
```

---

## Backend Implementation

### Route: `recommendations.routes.js`

**Location:** `backend/src/routes/recommendations.routes.js`

**Endpoint:** `GET /recommendations/:userId`

**Middleware:** `verifyJWT` - Ensures user is authenticated

**Implementation:**
```javascript
router.get('/:userId', verifyJWT, getRecommendations);
```

---

### Controller: `recommendations.controller.js`

**Location:** `backend/src/controllers/recommendations.controller.js`

**Function:** `getRecommendations`

**Purpose:** Handle the recommendation request and validate authorization

**Logic:**
1. Extract `userId` from request parameters
2. Verify that the authenticated user matches the requested userId (authorization check)
3. Call utility function `getRecommendedRides(userId)`
4. Return recommendations or error

**Authorization Check:**
```javascript
if (req.user._id.toString() !== userId) {
  return res.status(403).json({ 
    success: false, 
    message: 'Not authorized' 
  });
}
```

**Error Handling:**
- 403: Not authorized (user requesting someone else's recommendations)
- 500: Server error

---

### Utility: `recommendations.js`

**Location:** `backend/src/utils/recommendations.js`

**Function:** `getRecommendedRides`

**Purpose:** Core recommendation algorithm that generates personalized ride suggestions

#### Caching Strategy

**Cache Implementation:**
```javascript
const recommendationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

**Benefits:**
- Reduces database queries
- Improves response time
- Cache expires after 5 minutes to ensure fresh data

#### Recommendation Algorithm

**Step 1: Analyze User Activity (Last 30 Days)**

```javascript
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

const activities = await UserActivity.find({
  userId,
  createdAt: { $gte: thirtyDaysAgo }
});
```

**Purpose:** Fetch user's search and booking history from the last 30 days

---

**Step 2: Calculate Route Frequencies**

```javascript
const routeCount = {};
activities.forEach(activity => {
  const route = `${activity.fromLocation}|${activity.toLocation}`;
  routeCount[route] = (routeCount[route] || 0) + 1;
});
```

**Purpose:** Count how many times user searched/booked each route

---

**Step 3: Identify Top Routes**

```javascript
const topRoutes = Object.entries(routeCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([route]) => {
    const [from, to] = route.split('|');
    return { from, to };
  });
```

**Purpose:** Get the 3 most frequently searched routes

---

**Step 4: Include Saved Routes**

```javascript
const user = await User.findById(userId);
if (user?.savedRoutes) {
  user.savedRoutes.forEach(route => {
    if (!topRoutes.some(r => r.from === route.from && r.to === route.to)) {
      topRoutes.push({ from: route.from, to: route.to });
    }
  });
}
```

**Purpose:** Add user's manually saved routes to recommendations

---

**Step 5: Find Active Rides for Top Routes**

```javascript
for (const route of topRoutes) {
  const rides = await Ride.find({
    from: { $regex: route.from, $options: 'i' },
    to: { $regex: route.to, $options: 'i' },
    status: 'active',
    date: { $gte: new Date() },
    availableSeats: { $gt: 0 }
  })
    .limit(2)
    .populate('driverId', 'name profilePhoto rating reliabilityScore reliabilityLabel')
    .sort({ date: 1 });

  rides.forEach(ride => {
    recommendations.push({
      ...ride.toObject(),
      recommendationReason: `You often travel ${route.from} → ${route.to}`
    });
  });
}
```

**Filters:**
- Case-insensitive location matching
- Only active rides
- Future dates only
- Available seats > 0
- Sorted by earliest date
- Limited to 2 rides per route

**Populated Fields:**
- Driver name
- Profile photo
- Rating (average and count)
- Reliability score and label

---

**Step 6: Fallback - Popular Routes (If No Personal History)**

```javascript
if (recommendations.length === 0) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const popularBookings = await Booking.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $lookup: {
        from: 'rides',
        localField: 'rideId',
        foreignField: '_id',
        as: 'ride'
      }
    },
    { $unwind: '$ride' },
    {
      $group: {
        _id: { from: '$ride.from', to: '$ride.to' },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]);
}
```

**Purpose:** If user has no history, show popular routes from the last 7 days

**Aggregation Pipeline:**
1. Match completed bookings from last 7 days
2. Join with rides collection
3. Group by route (from → to)
4. Count bookings per route
5. Sort by count (descending)
6. Limit to top 3 routes

---

**Step 7: Limit and Cache Results**

```javascript
recommendations = recommendations.slice(0, 5);

recommendationCache.set(cacheKey, {
  data: recommendations,
  timestamp: Date.now()
});

return recommendations;
```

**Purpose:** 
- Limit to maximum 5 recommendations
- Cache results for 5 minutes
- Return to controller

---

## Database Models Used

### 1. UserActivity
**Purpose:** Track user search and booking patterns

**Fields:**
- `userId`: Reference to User
- `fromLocation`: Search origin
- `toLocation`: Search destination
- `createdAt`: Timestamp

### 2. Ride
**Purpose:** Store ride information

**Fields:**
- `from`: Origin location
- `to`: Destination location
- `date`: Ride date
- `departureTime`: Departure time
- `pricePerSeat`: Price per seat
- `availableSeats`: Available seats
- `status`: Ride status (active/cancelled/completed)
- `driverId`: Reference to driver User

### 3. User
**Purpose:** Store user information and saved routes

**Fields:**
- `name`: User name
- `profilePhoto`: Profile photo URL
- `rating`: { average, count }
- `reliabilityScore`: Numeric score
- `reliabilityLabel`: "High"/"Moderate"/"Low"
- `savedRoutes`: Array of { from, to }

### 4. Booking
**Purpose:** Track completed bookings for popular route analysis

**Fields:**
- `rideId`: Reference to Ride
- `status`: Booking status
- `createdAt`: Timestamp

---

## Recommendation Reasons

The system provides different recommendation reasons based on the source:

1. **"You often travel [From] → [To]"**
   - Based on user's frequent search/booking history
   - Appears when route is in top 3 most searched

2. **"Popular route"**
   - Based on system-wide booking data
   - Appears when user has no personal history
   - Shows routes with most completed bookings in last 7 days

3. **Saved Route (implicit)**
   - Routes manually saved by user
   - Included in recommendations automatically

---

## Performance Optimizations

### 1. Caching
- In-memory cache with 5-minute TTL
- Reduces database load
- Improves response time for repeated requests

### 2. Query Optimization
- Limited results per route (2 rides)
- Maximum 5 total recommendations
- Indexed fields for faster queries
- Selective field population

### 3. Time-based Filtering
- Only future rides
- Recent activity (30 days for personal, 7 days for popular)
- Reduces data processing

---

## Error Handling

### Frontend
```javascript
try {
  const data = await getRecommendations(user._id);
  setRecommendations(data.recommendations || []);
} catch (err) {
  console.error('Fetch recommendations error:', err);
  setError(true);
}
```

**Behavior on Error:**
- Component returns null (hides recommendations section)
- Error logged to console
- No user-facing error message (graceful degradation)

### Backend
```javascript
try {
  const recommendations = await getRecommendedRides(userId);
  res.status(200).json({ success: true, recommendations });
} catch (error) {
  console.error('Get recommendations error:', error);
  res.status(500).json({ success: false, message: error.message });
}
```

**Error Responses:**
- 403: Authorization failure
- 500: Server/database error
- Empty array returned on utility function errors

---

## Security Considerations

### 1. Authentication
- JWT verification required (`verifyJWT` middleware)
- User must be logged in

### 2. Authorization
- Users can only request their own recommendations
- Controller validates `req.user._id === userId`

### 3. Data Privacy
- Only passenger's own activity is analyzed
- No cross-user data exposure

---

## Integration Points

### Where Recommendations Appear
1. **Passenger Dashboard** (`PassengerDashboard.jsx`)
   - Component: `<RideRecommendations />`
   - Position: Below upcoming rides section

### User Activity Tracking
Recommendations depend on UserActivity records being created when:
- User searches for rides
- User books a ride
- User saves a route

---

## Future Enhancements

### Potential Improvements
1. **Machine Learning Integration**
   - Predict preferred departure times
   - Analyze day-of-week patterns
   - Consider price sensitivity

2. **Advanced Filtering**
   - Driver preferences (rating threshold)
   - Vehicle type preferences
   - Time-of-day preferences

3. **Real-time Updates**
   - WebSocket integration for live recommendations
   - Instant updates when new matching rides are posted

4. **A/B Testing**
   - Test different recommendation algorithms
   - Measure click-through rates
   - Optimize recommendation reasons

5. **Collaborative Filtering**
   - "Users like you also booked..."
   - Similar user pattern analysis

---

## Testing Scenarios

### Test Case 1: New User (No History)
**Expected:** Popular routes from last 7 days

### Test Case 2: Active User
**Expected:** Routes based on personal history

### Test Case 3: User with Saved Routes
**Expected:** Saved routes included in recommendations

### Test Case 4: No Available Rides
**Expected:** Empty state message

### Test Case 5: Cache Hit
**Expected:** Fast response from cache (< 50ms)

### Test Case 6: Cache Miss
**Expected:** Database query + cache update (< 500ms)

---

## Monitoring & Metrics

### Key Metrics to Track
1. **Recommendation Click-through Rate**
   - % of users who click on recommendations
   - Which recommendation reasons perform best

2. **Cache Hit Rate**
   - % of requests served from cache
   - Cache effectiveness

3. **Response Time**
   - Average time to generate recommendations
   - Database query performance

4. **Recommendation Quality**
   - Booking conversion rate from recommendations
   - User feedback on relevance

---

## Configuration

### Adjustable Parameters

```javascript
// Cache TTL
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Activity lookback period
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

// Popular routes lookback
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

// Top routes count
.slice(0, 3)

// Rides per route
.limit(2)

// Total recommendations
recommendations.slice(0, 5)
```

---

## Conclusion

The Recommended Rides feature provides intelligent, personalized ride suggestions by analyzing user behavior patterns, saved preferences, and system-wide trends. The implementation balances personalization with performance through caching and optimized queries, while maintaining security through proper authentication and authorization checks.
