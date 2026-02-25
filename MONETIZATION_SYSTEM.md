# Monetization System Documentation

## Overview
The NavKalpana platform implements a comprehensive monetization system with service fees and premium features for drivers. All monetization logic references a centralized configuration file to ensure consistency.

---

## Configuration (`config/monetization.js`)

All monetization values are defined in a single configuration file:

```javascript
{
  DEFAULT_SERVICE_FEE_PERCENT: 10,      // Default platform fee
  MIN_SERVICE_FEE_PERCENT: 5,           // Minimum allowed fee
  MAX_SERVICE_FEE_PERCENT: 15,          // Maximum allowed fee
  PREMIUM_VISIBILITY_PRICE: 99,         // ₹99 per ride post
  INSTANT_CONFIRMATION_BADGE_PRICE: 199 // ₹199 per month
}
```

**Important:** All monetization logic must reference this config file. Never hardcode these values elsewhere.

---

## 1. Service Fee System

### How It Works
When a booking is accepted, the platform automatically calculates and records the service fee.

### Calculation Logic (`utils/calculateServiceFee.js`)
```
total_ride_value = price_per_seat × seats_booked
fee_amount = (total_ride_value × DEFAULT_SERVICE_FEE_PERCENT) / 100
driver_payout = total_ride_value - fee_amount
```

### Example
- Price per seat: ₹100
- Seats booked: 3
- Total ride value: ₹300
- Platform fee (10%): ₹30
- Driver payout: ₹270

### Implementation Flow
1. **Booking Acceptance** (`bookings.controller.js` → `acceptBooking`)
   - Driver accepts a booking request
   - Ride seats are updated
   - Booking status changes to "accepted"

2. **Automatic Fee Calculation**
   - `calculateServiceFee()` is called with ride's `pricePerSeat` and booking's `seatsBooked`
   - Returns: `{ total_ride_value, fee_amount, driver_payout, fee_percent }`

3. **Transaction Recording**
   - New record created in `transactions` table:
     ```javascript
     {
       booking_id: booking._id,
       rider_id: booking.passengerId,
       driver_id: booking.driverId,
       total_ride_value: 300,
       fee_amount: 30,
       driver_payout: 270,
       fee_percent: 10,
       type: 'service_fee',
       status: 'pending'
     }
     ```

### Database Schema
**Transaction Model** (`models/Transaction.js`)
- `booking_id`: Reference to booking
- `rider_id`: Passenger who booked
- `driver_id`: Driver providing ride
- `total_ride_value`: Total amount paid
- `fee_amount`: Platform's commission
- `driver_payout`: Amount driver receives
- `fee_percent`: Fee percentage applied
- `type`: Transaction type (service_fee, premium_visibility, instant_confirmation_badge)
- `status`: pending/completed/failed
- `created_at`: Timestamp

---

## 2. Premium Visibility Feature

### What It Does
Drivers can boost their ride posts to appear at the top of search results for 7 days.

### Pricing
- **Cost:** ₹99 per ride post
- **Duration:** 7 days from purchase

### Database Fields (`models/Ride.js`)
- `is_premium_visible`: Boolean (default: false)
- `premium_visible_until`: DateTime (expiry date)

### Purchase Flow

#### API Endpoint: `POST /api/rides/:ride_id/boost`
**Request:**
```json
{
  "payment_confirmed": true
}
```

**Process:**
1. Verify driver owns the ride
2. Validate payment confirmation
3. Set `is_premium_visible = true`
4. Set `premium_visible_until = now + 7 days`
5. Create transaction record:
   ```javascript
   {
     driver_id: driver._id,
     ride_id: ride._id,
     type: 'premium_visibility',
     amount: 99,
     status: 'completed'
   }
   ```

### Search Prioritization
**Modified in:** `rides.controller.js` → `getRides`

Premium rides are sorted first:
```javascript
.sort({ 
  $expr: { 
    $cond: [
      { $and: [
        { $eq: ['$is_premium_visible', true] }, 
        { $gt: ['$premium_visible_until', now] }
      ]}, 
      0,  // Premium rides (sort first)
      1   // Regular rides (sort after)
    ]
  },
  ...existingSortCriteria  // Then apply price/time/rating sort
})
```

### UI Display
**Badge:** "⭐ Featured" appears on ride cards when `is_premium_visible = true`

---

## 3. Instant Confirmation Badge

### What It Does
Drivers can subscribe to display an "⚡ Instant Confirm" badge on their profile, signaling fast booking acceptance.

### Pricing
- **Cost:** ₹199 per month
- **Duration:** 30 days from purchase

### Database Fields (`models/User.js`)
- `instant_badge_active`: Boolean (default: false)
- `instant_badge_until`: DateTime (expiry date)

### Purchase Flow

#### API Endpoint: `POST /api/users/driver/subscribe/instant-badge`
**Request:**
```json
{
  "payment_confirmed": true
}
```

**Process:**
1. Validate payment confirmation
2. Set `instant_badge_active = true`
3. Set `instant_badge_until = now + 30 days`
4. Create transaction record:
   ```javascript
   {
     driver_id: driver._id,
     type: 'instant_confirmation_badge',
     amount: 199,
     status: 'completed'
   }
   ```

### Auto-Expiration
**Implemented in:** `middleware/auth.middleware.js`

On every authenticated request:
```javascript
if (user.instant_badge_active && user.instant_badge_until < now) {
  user.instant_badge_active = false;
  await user.save();
}
```

### UI Display
**Badge:** "⚡ Instant Confirm" appears on:
- Ride listing cards (next to driver name)
- Ride detail page (driver profile section)

---

## 4. Driver Earnings Dashboard

### API Endpoint: `GET /api/driver/earnings`
**Authentication:** Driver role required

**Response:**
```json
{
  "total_earned": 15000,
  "total_rides": 25,
  "total_platform_fee": 1500,
  "recent_transactions": [
    {
      "booking_id": "...",
      "route": "Mumbai → Pune",
      "date": "2024-01-15",
      "amount": 270
    }
    // ... last 10 transactions
  ]
}
```

### Calculation Logic
- `total_earned`: Sum of all `driver_payout` for this driver
- `total_rides`: Count of all transactions
- `total_platform_fee`: Sum of all `fee_amount`
- `recent_transactions`: Last 10 transactions with booking details

### Dashboard Display
Located in Driver Dashboard after existing sections:
- **Total Earned (Lifetime)** - Green card
- **Total Rides Completed** - Blue card
- **Platform Fee Paid** - Purple card
- **Recent Transactions Table** - Route, Date, Payout columns

---

## 5. Migration Scripts

### Premium Visibility Fields
**File:** `migrations/add_premium_visibility_fields.js`
```bash
node migrations/add_premium_visibility_fields.js
```
Adds `is_premium_visible` and `premium_visible_until` to existing rides.

### Instant Badge Fields
**File:** `migrations/add_instant_badge_fields.js`
```bash
node migrations/add_instant_badge_fields.js
```
Adds `instant_badge_active` and `instant_badge_until` to existing users.

---

## 6. Payment Integration (Future Scope)

Currently, the system accepts `{ payment_confirmed: true }` to simulate payment. 

### To Integrate Real Payment Gateway:
1. Replace payment confirmation check with actual gateway API call
2. Handle payment success/failure callbacks
3. Update transaction status based on payment result
4. Implement refund logic if needed

---

## 7. Transaction Types

| Type | Description | Amount | Duration |
|------|-------------|--------|----------|
| `service_fee` | Platform commission on bookings | 10% of ride value | Per booking |
| `premium_visibility` | Boost ride to top of search | ₹99 | 7 days |
| `instant_confirmation_badge` | Display instant confirm badge | ₹199 | 30 days |

---

## 8. Key Design Principles

1. **Centralized Configuration:** All pricing in `config/monetization.js`
2. **Pure Functions:** `calculateServiceFee()` has no side effects
3. **Automatic Recording:** Transactions created automatically on events
4. **Read-Only Endpoints:** Earnings endpoint doesn't modify data
5. **Minimal Changes:** New features added without modifying existing logic
6. **Auto-Expiration:** Badges expire automatically via middleware

---

## 9. API Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/driver/earnings` | GET | Driver | View earnings & transactions |
| `/api/rides/:ride_id/boost` | POST | Driver | Purchase premium visibility |
| `/api/users/driver/subscribe/instant-badge` | POST | Driver | Subscribe to instant badge |

---

## 10. Future Enhancements

- Dynamic service fee based on ride distance/demand
- Bulk purchase discounts for premium features
- Subscription plans for frequent drivers
- Referral bonuses and credits system
- Analytics dashboard for revenue tracking
- Automated payout scheduling
- Tax calculation and reporting
