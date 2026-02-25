# Manual Testing Guide - Monetization System

## Prerequisites
1. Backend server running on `http://localhost:5000`
2. Frontend running on `http://localhost:5173`
3. MongoDB connected
4. Two user accounts:
   - **Driver account** (role: driver)
   - **Passenger account** (role: passenger)

---

## Test 1: Service Fee Calculation & Recording

### Setup
1. Login as **Driver**
2. Post a new ride:
   - From: Mumbai
   - To: Pune
   - Price per seat: ₹100
   - Total seats: 4
   - Date: Tomorrow

### Test Steps
1. **Passenger books the ride:**
   - Logout and login as **Passenger**
   - Search for the ride (Mumbai → Pune)
   - Book 2 seats
   - Expected: Booking status = "requested"

2. **Driver accepts booking:**
   - Logout and login as **Driver**
   - Go to Dashboard → Booking Requests
   - Accept the booking
   - Expected: Booking status = "accepted"

3. **Verify transaction created:**
   - **API Test:** `GET /api/driver/earnings`
   - **Expected Response:**
     ```json
     {
       "total_earned": 180,
       "total_rides": 1,
       "total_platform_fee": 20,
       "recent_transactions": [
         {
           "route": "Mumbai → Pune",
           "amount": 180
         }
       ]
     }
     ```
   - **Calculation:**
     - Total ride value: ₹100 × 2 = ₹200
     - Platform fee (10%): ₹20
     - Driver payout: ₹180

4. **Check Dashboard:**
   - Go to Driver Dashboard
   - Scroll to "Earnings" section
   - Verify:
     - Total Earned: ₹180
     - Total Rides: 1
     - Platform Fee Paid: ₹20
     - Recent transaction shows the ride

### Database Verification
```javascript
// In MongoDB
db.transactions.find({ type: 'service_fee' })

// Expected:
{
  booking_id: ObjectId("..."),
  rider_id: ObjectId("..."),
  driver_id: ObjectId("..."),
  total_ride_value: 200,
  fee_amount: 20,
  driver_payout: 180,
  fee_percent: 10,
  type: "service_fee",
  status: "pending"
}
```

---

## Test 2: Premium Visibility (Ride Boost)

### Test Steps
1. **Login as Driver**
2. **Post a new ride** (or use existing ride)
3. **Boost the ride:**
   - **API Test:** `POST /api/rides/:ride_id/boost`
   - **Request Body:**
     ```json
     {
       "payment_confirmed": true
     }
     ```
   - **Expected Response:**
     ```json
     {
       "success": true,
       "message": "Ride boosted successfully",
       "ride": {
         "is_premium_visible": true,
         "premium_visible_until": "2024-01-22T..." // 7 days from now
       }
     }
     ```

4. **Verify in search results:**
   - Logout and search for rides
   - The boosted ride should appear at the TOP
   - Look for "⭐ Featured" badge on the ride card

5. **Check transaction:**
   - **API Test:** `GET /api/driver/earnings`
   - Should show ₹99 deduction in recent transactions

### Database Verification
```javascript
// Check ride
db.rides.findOne({ _id: ObjectId("ride_id") })
// Expected:
{
  is_premium_visible: true,
  premium_visible_until: ISODate("2024-01-22...")
}

// Check transaction
db.transactions.find({ type: 'premium_visibility' })
// Expected:
{
  driver_id: ObjectId("..."),
  ride_id: ObjectId("..."),
  type: "premium_visibility",
  amount: 99,
  status: "completed"
}
```

### Visual Verification
- **Ride Card:** Should show "⭐ Featured" badge
- **Search Results:** Boosted ride appears first, even if price is higher

---

## Test 3: Instant Confirmation Badge

### Test Steps
1. **Login as Driver**
2. **Subscribe to instant badge:**
   - **API Test:** `POST /api/users/driver/subscribe/instant-badge`
   - **Request Body:**
     ```json
     {
       "payment_confirmed": true
     }
     ```
   - **Expected Response:**
     ```json
     {
       "success": true,
       "message": "Instant badge activated",
       "user": {
         "instant_badge_active": true,
         "instant_badge_until": "2024-02-15T..." // 30 days from now
       }
     }
     ```

3. **Verify badge display:**
   - Post a new ride
   - Logout and view the ride as passenger
   - **Ride Card:** Should show "⚡ Instant Confirm" badge next to driver name
   - **Ride Detail Page:** Should show "⚡ Instant Confirm" badge below driver name

4. **Check transaction:**
   - Login as driver
   - Go to Dashboard → Earnings section
   - Should show ₹199 transaction

### Database Verification
```javascript
// Check user
db.users.findOne({ _id: ObjectId("driver_id") })
// Expected:
{
  instant_badge_active: true,
  instant_badge_until: ISODate("2024-02-15...")
}

// Check transaction
db.transactions.find({ type: 'instant_confirmation_badge' })
// Expected:
{
  driver_id: ObjectId("..."),
  type: "instant_confirmation_badge",
  amount: 199,
  status: "completed"
}
```

### Auto-Expiration Test
1. **Manually expire the badge:**
   ```javascript
   // In MongoDB
   db.users.updateOne(
     { _id: ObjectId("driver_id") },
     { $set: { instant_badge_until: new Date("2024-01-01") } }
   )
   ```

2. **Make any API request as driver** (e.g., refresh dashboard)
3. **Verify badge is auto-disabled:**
   ```javascript
   db.users.findOne({ _id: ObjectId("driver_id") })
   // Expected:
   {
     instant_badge_active: false,
     instant_badge_until: ISODate("2024-01-01")
   }
   ```

---

## Test 4: Driver Earnings Dashboard

### Test Steps
1. **Create multiple transactions:**
   - Accept 3-4 bookings (service fees)
   - Boost 1-2 rides (premium visibility)
   - Subscribe to instant badge

2. **View earnings:**
   - Go to Driver Dashboard
   - Scroll to "Earnings" section

3. **Verify display:**
   - **Total Earned:** Sum of all driver payouts
   - **Total Rides:** Count of service fee transactions
   - **Platform Fee Paid:** Sum of all service fees
   - **Recent Transactions Table:** Shows last 10 with route, date, payout

### Expected Calculations
```
Example with 3 bookings:
- Booking 1: ₹200 total → ₹20 fee → ₹180 payout
- Booking 2: ₹300 total → ₹30 fee → ₹270 payout
- Booking 3: ₹150 total → ₹15 fee → ₹135 payout

Dashboard should show:
- Total Earned: ₹585
- Total Rides: 3
- Platform Fee Paid: ₹65
```

---

## Test 5: Search Result Prioritization

### Test Steps
1. **Create 3 rides:**
   - Ride A: Mumbai → Pune, ₹50/seat (NOT boosted)
   - Ride B: Mumbai → Pune, ₹200/seat (BOOSTED)
   - Ride C: Mumbai → Pune, ₹100/seat (NOT boosted)

2. **Boost Ride B** (most expensive)

3. **Search for rides:**
   - Search: Mumbai → Pune
   - Sort by: Price (Low to High)

4. **Expected Order:**
   - **First:** Ride B (₹200) - Because it's boosted
   - **Second:** Ride A (₹50) - Cheapest non-boosted
   - **Third:** Ride C (₹100) - Next cheapest

5. **Visual Check:**
   - Only Ride B should have "⭐ Featured" badge

---

## Test 6: Multiple Features Combined

### Test Steps
1. **Login as Driver**
2. **Subscribe to instant badge** (₹199)
3. **Post a new ride**
4. **Boost the ride** (₹99)
5. **Get a booking and accept it** (e.g., ₹300 total → ₹270 payout)

### Expected Results
- **Ride Card shows:**
  - "⭐ Featured" badge (premium visibility)
  - "⚡ Instant Confirm" badge (instant badge)
  
- **Earnings Dashboard shows:**
  - Total Earned: ₹270
  - Total Rides: 1
  - Platform Fee Paid: ₹30
  - Recent Transactions: 3 entries
    1. Service fee transaction (₹270)
    2. Premium visibility (₹99)
    3. Instant badge (₹199)

---

## API Testing with Postman/Thunder Client

### 1. Get Driver Earnings
```
GET http://localhost:5000/api/driver/earnings
Headers:
  Authorization: Bearer <driver_token>
```

### 2. Boost Ride
```
POST http://localhost:5000/api/rides/:ride_id/boost
Headers:
  Authorization: Bearer <driver_token>
Body:
{
  "payment_confirmed": true
}
```

### 3. Subscribe to Instant Badge
```
POST http://localhost:5000/api/users/driver/subscribe/instant-badge
Headers:
  Authorization: Bearer <driver_token>
Body:
{
  "payment_confirmed": true
}
```

---

## Common Issues & Troubleshooting

### Issue 1: Transaction not created
- **Check:** Booking status is "accepted"
- **Check:** `calculateServiceFee()` is called in `acceptBooking`
- **Check:** MongoDB connection is active

### Issue 2: Badge not showing
- **Check:** `is_premium_visible = true` in database
- **Check:** `premium_visible_until > now`
- **Check:** Frontend is fetching updated ride data

### Issue 3: Earnings not showing
- **Check:** User role is "driver"
- **Check:** Transactions exist in database
- **Check:** API endpoint returns data

### Issue 4: Search prioritization not working
- **Check:** MongoDB query includes sort expression
- **Check:** Ride has `is_premium_visible = true`
- **Check:** `premium_visible_until` is in the future

---

## Quick Verification Checklist

- [ ] Service fee calculated correctly (10%)
- [ ] Transaction created on booking acceptance
- [ ] Driver earnings dashboard shows correct totals
- [ ] Premium visibility costs ₹99
- [ ] Boosted rides appear first in search
- [ ] "⭐ Featured" badge displays on boosted rides
- [ ] Instant badge costs ₹199
- [ ] "⚡ Instant Confirm" badge displays on driver profile
- [ ] Instant badge expires after 30 days
- [ ] All transactions recorded in database
- [ ] Recent transactions table shows last 10 entries
