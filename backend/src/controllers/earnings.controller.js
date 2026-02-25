const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');

const getDriverEarnings = async (req, res) => {
  try {
    const transactions = await Transaction.find({ driver_id: req.user._id });

    const serviceFeeTransactions = transactions.filter(t => t.type === 'service_fee');
    const total_earned = serviceFeeTransactions.reduce((sum, t) => sum + (t.driver_payout || 0), 0);
    const total_rides = serviceFeeTransactions.length;
    const total_platform_fee = serviceFeeTransactions.reduce((sum, t) => sum + (t.fee_amount || 0), 0);

    // Calculate earnings for last 7 days from transactions
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const earnings_chart = last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayEarnings = serviceFeeTransactions
        .filter(t => {
          const tDate = new Date(t.created_at);
          return tDate >= date && tDate < nextDay;
        })
        .reduce((sum, t) => sum + (t.driver_payout || 0), 0);
      
      return {
        date: date.toISOString().split('T')[0],
        earnings: dayEarnings
      };
    });

    const recentTransactions = await Transaction.find({ driver_id: req.user._id })
      .sort({ created_at: -1 })
      .limit(10)
      .populate({
        path: 'booking_id',
        populate: { path: 'rideId', select: 'from to date' }
      })
      .populate('ride_id', 'from to');

    const recent_transactions = recentTransactions.map(t => {
      let description = '';
      let amount = 0;
      let type = t.type || 'service_fee';
      
      if (type === 'service_fee') {
        if (t.booking_id?.rideId) {
          description = `${t.booking_id.rideId.from} → ${t.booking_id.rideId.to}`;
        } else {
          description = 'Ride Booking';
        }
        amount = Number(t.driver_payout) || 0;
      } else if (type === 'premium_visibility') {
        if (t.ride_id) {
          description = `Boost: ${t.ride_id.from} → ${t.ride_id.to}`;
        } else {
          description = 'Ride Boost';
        }
        amount = -(Number(t.amount) || 0);
      } else if (type === 'instant_confirmation_badge') {
        description = 'Instant Badge Subscription';
        amount = -(Number(t.amount) || 0);
      } else {
        description = 'Transaction';
        amount = Number(t.driver_payout || t.amount) || 0;
      }
      
      return {
        type,
        description,
        date: t.created_at,
        amount,
        status: t.status
      };
    });

    res.status(200).json({
      success: true,
      total_earned,
      total_rides,
      total_platform_fee,
      earnings_chart,
      recent_transactions,
    });
  } catch (error) {
    console.error('Get driver earnings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDriverEarnings };
