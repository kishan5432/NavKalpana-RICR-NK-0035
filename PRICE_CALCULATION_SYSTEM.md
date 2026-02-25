# Price Calculation & Suggestion System

## Overview
Intelligent pricing system that suggests optimal ride prices based on distance, demand, historical data, and saved routes.

---

## Architecture

### Components
1. **Utility Functions** (`backend/src/utils/`)
   - `getAverageRoutePrice.js` - Historical price analysis
   - `getSeatDemand.js` - Demand calculation with saved routes intelligence

2. **Controller** (`backend/src/controllers/`)
   - `priceSuggestion.controller.js` - Price suggestion endpoint

3. **Routes** (`backend/src/routes/`)
   - `priceSuggestion.routes.js` - API routing

4. **Frontend** (`frontend/src/pages/driver/`)
   - `CreateRide.jsx` - Price suggestion UI integration

---

## API Endpoint

### GET `/api/price-suggestion`

**Access:** Driver role only (JWT + requireDriver middleware)

**Query Parameters:**
```javascript
{
  from_location: string,    // e.g., "Mumbai"
  to_location: string,      // e.g., "Pune"
  ride_date: string,        // ISO date: "2024-01-15"
  distance_km: number       // e.g., 150
}
```

**Response:**
```json
{
  "success": true,
  "suggested_min": 612,
  "suggested_max": 748,
  "demand_level": "high",
  "based_on_routes": 12,
  "demand_signal": {
    "total_seats_booked": 15,
    "saved_route_count": 8
  }
}
```

---

## Price Calculation Logic

### Step 1: Base Price Calculation
```javascript
basePrice = distance_km × ₹4
```
- **Constant:** `PRICE_PER_KM = 4`
- **Example:** 150 km × ₹4 = ₹600

### Step 2: Demand Analysis

#### A. Seat Demand Calculation (`getSeatDemand()`)

**Data Sources:**
1. **Bookings Table** - Seats booked within ±3 days
2. **SavedRoutes Table** - Passengers who saved this route

**Logic:**
```javascript
// Count seats booked (±3 days from ride_date)
totalSeats = sum of seatsBooked where:
  - rideId.from = from_location
  - rideId.to = to_location
  - rideId.date between (ride_date - 3 days) and (ride_date + 3 days)
  - booking.status in ['accepted', 'completed']

// Count saved routes
savedRouteCount = count of SavedRoute where:
  - fromLocation = from_location
  - toLocation = to_location

// Base demand level
if (totalSeats > 10) → "high"
else if (totalSeats >= 4) → "moderate"
else → "low"

// Bump demand tier if saved routes > 5
if (savedRouteCount > 5) {
  "low" → "moderate"
  "moderate" → "high"
  "high" → "high" (no change)
}
```

#### B. Demand Adjustment
```javascript
if (demand_level === "high") {
  basePrice *= 1.2  // +20%
} else if (demand_level === "moderate") {
  basePrice *= 1.1  // +10%
} else {
  // No adjustment for "low" demand
}
```

### Step 3: Price Range Calculation
```javascript
suggested_min = basePrice × 0.9  // -10%
suggested_max = basePrice × 1.1  // +10%
```

---

## Complete Example

### Scenario: Mumbai → Pune (150 km)

**Input:**
- Distance: 150 km
- Date: 2024-01-15
- Historical data:
  - 12 seats booked (±3 days)
  - 8 passengers saved this route

**Calculation:**

1. **Base Price:**
   ```
   150 km × ₹4 = ₹600
   ```

2. **Demand Analysis:**
   ```
   totalSeats = 12 → "high" (> 10)
   savedRouteCount = 8 → bump tier (> 5)
   Final: "high" (already high, no change)
   ```

3. **Demand Adjustment:**
   ```
   ₹600 × 1.2 = ₹720 (high demand +20%)
   ```

4. **Price Range:**
   ```
   Min: ₹720 × 0.9 = ₹648
   Max: ₹720 × 1.1 = ₹792
   ```

**Response:**
```json
{
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

## Frontend Integration

### Location: `CreateRide.jsx`

**Features:**
1. **Auto Distance Calculation**
   - Triggers when from/to locations are filled
   - Default: 100 km (can be manually adjusted)

2. **Manual Distance Override**
   - Input field: "Estimated Distance (km)"
   - Driver can adjust before getting suggestion

3. **Price Suggestion Button**
   - "Get Price Suggestion" button
   - Calls API with form data

4. **Suggestion Display**
   - Non-blocking hint below price input
   - Shows: range, demand level, data source
   - Price input remains fully editable

**UI Flow:**
```
1. Driver fills: From, To, Date
2. Distance auto-set to 100 km (editable)
3. Click "Get Price Suggestion"
4. See: "Recommended price range: ₹648 – ₹792 based on similar routes"
5. Driver can use suggestion or enter custom price
6. Submit form (no validation changes)
```

---

## Utility Functions

### 1. `getAverageRoutePrice(fromLocation, toLocation)`

**Purpose:** Get historical average price for a route

**Logic:**
```javascript
// Query completed rides
rides = Ride.find({
  from: fromLocation,
  to: toLocation,
  status: 'completed'
})

// Return null if < 3 rides
if (rides.length < 3) return null

// Calculate average
return Math.round(sum(pricePerSeat) / count)
```

**Returns:** `number | null`

---

### 2. `getSeatDemand(fromLocation, toLocation, rideDate)`

**Purpose:** Calculate demand level with saved routes intelligence

**Logic:**
```javascript
// 1. Find rides within ±3 days
rides = Ride.find({
  from: fromLocation,
  to: toLocation,
  date: { $gte: rideDate - 3 days, $lte: rideDate + 3 days }
})

// 2. Count booked seats
totalSeats = sum of seatsBooked from accepted/completed bookings

// 3. Count saved routes
savedRouteCount = SavedRoute.countDocuments({
  fromLocation,
  toLocation
})

// 4. Determine base demand
if (totalSeats > 10) demandLevel = "high"
else if (totalSeats >= 4) demandLevel = "moderate"
else demandLevel = "low"

// 5. Bump tier if saved routes > 5
if (savedRouteCount > 5) {
  if (demandLevel === "low") demandLevel = "moderate"
  else if (demandLevel === "moderate") demandLevel = "high"
}

return {
  demand_level: demandLevel,
  demand_signal: {
    total_seats_booked: totalSeats,
    saved_route_count: savedRouteCount
  }
}
```

**Returns:** `{ demand_level: string, demand_signal: object }`

---

## Database Tables Used

### 1. Ride
- **Fields:** from, to, date, pricePerSeat, status
- **Usage:** Historical pricing, demand calculation

### 2. Booking
- **Fields:** rideId, seatsBooked, status
- **Usage:** Seat demand calculation

### 3. SavedRoute
- **Fields:** fromLocation, toLocation, userId
- **Usage:** Future demand signal

---

## Access Control

### Endpoint Protection
```javascript
router.get('/', verifyJWT, requireDriver, getPriceSuggestion)
```

**Allowed:**
- ✅ Drivers (role === 'driver')

**Blocked:**
- ❌ Passengers (403 Forbidden)
- ❌ Admins (403 Forbidden)
- ❌ Unauthenticated users (401 Unauthorized)

---

## Configuration

### Constants (`priceSuggestion.controller.js`)
```javascript
const PRICE_PER_KM = 4;  // Base rate per kilometer
```

### Demand Thresholds
```javascript
HIGH_DEMAND = totalSeats > 10
MODERATE_DEMAND = totalSeats >= 4 && totalSeats <= 10
LOW_DEMAND = totalSeats < 4

SAVED_ROUTE_THRESHOLD = 5  // Bump tier if > 5 saved routes
```

### Adjustments
```javascript
HIGH_DEMAND_MULTIPLIER = 1.2   // +20%
MODERATE_DEMAND_MULTIPLIER = 1.1  // +10%
PRICE_RANGE_VARIANCE = 0.1     // ±10%
```

---

## Error Handling

### Missing Parameters
```json
{
  "success": false,
  "message": "Missing required parameters: from_location, to_location, ride_date, distance_km"
}
```

### Invalid Distance
```json
{
  "success": false,
  "message": "Invalid distance_km"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Error message details"
}
```

---

## Future Enhancements

### 1. Real Distance Calculation
- Integrate Google Maps Distance Matrix API
- Use Haversine formula with geocoded coordinates
- Replace 100km default with actual distances

### 2. Dynamic Pricing Factors
- Time of day (peak hours)
- Day of week (weekends vs weekdays)
- Seasonal trends
- Weather conditions

### 3. Machine Learning
- Train model on historical pricing data
- Predict optimal price based on multiple factors
- A/B test pricing strategies

### 4. Competitor Analysis
- Compare with market rates
- Suggest competitive pricing

---

## Testing

### Test Cases

**1. Low Demand Route**
```
Input: Delhi → Agra, 2 seats booked, 1 saved route
Expected: demand_level = "low", no adjustment
```

**2. Moderate Demand Route**
```
Input: Mumbai → Pune, 6 seats booked, 3 saved routes
Expected: demand_level = "moderate", +10% adjustment
```

**3. High Demand Route**
```
Input: Bangalore → Chennai, 15 seats booked, 2 saved routes
Expected: demand_level = "high", +20% adjustment
```

**4. Saved Routes Bump**
```
Input: Delhi → Jaipur, 3 seats booked, 8 saved routes
Expected: demand_level = "moderate" (bumped from "low")
```

---

## API Integration Example

### Frontend Call
```javascript
import { getPriceSuggestion } from '../../api';

const result = await getPriceSuggestion({
  from_location: 'Mumbai',
  to_location: 'Pune',
  ride_date: '2024-01-15',
  distance_km: 150
});

console.log(result);
// {
//   suggested_min: 648,
//   suggested_max: 792,
//   demand_level: "high",
//   based_on_routes: 12,
//   demand_signal: { ... }
// }
```

---

## Changelog

### v1.0 - Initial Release
- Base price calculation (distance × ₹4)
- Demand-based adjustments
- Historical route analysis

### v1.1 - Saved Routes Intelligence
- Added SavedRoute table integration
- Demand tier bumping logic
- Enhanced demand_signal response

---

## Support

For issues or questions:
- Backend: `backend/src/controllers/priceSuggestion.controller.js`
- Frontend: `frontend/src/pages/driver/CreateRide.jsx`
- Utilities: `backend/src/utils/getSeatDemand.js`
