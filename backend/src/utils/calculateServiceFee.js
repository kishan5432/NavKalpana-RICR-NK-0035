const { DEFAULT_SERVICE_FEE_PERCENT } = require('../../config/monetization');

const calculateServiceFee = (price_per_seat, seats_booked) => {
  const total_ride_value = price_per_seat * seats_booked;
  const fee_amount = (total_ride_value * DEFAULT_SERVICE_FEE_PERCENT) / 100;
  const driver_payout = total_ride_value - fee_amount;

  return {
    total_ride_value,
    fee_amount,
    driver_payout,
    fee_percent: DEFAULT_SERVICE_FEE_PERCENT,
  };
};

module.exports = calculateServiceFee;
