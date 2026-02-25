const RideAnalytics = require('../models/RideAnalytics');

const getRouteAnalytics = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;

    // Top 10 most booked routes
    const topRoutes = await RideAnalytics.aggregate([
      {
        $group: {
          _id: { from: '$routeFrom', to: '$routeTo' },
          totalBookings: { $sum: '$bookingCount' }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          route: { $concat: ['$_id.from', ' → ', '$_id.to'] },
          from: '$_id.from',
          to: '$_id.to',
          totalBookings: 1
        }
      }
    ]);

    // Peak travel days (grouped by day of week)
    const peakDays = await RideAnalytics.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: '$rideDate' },
          totalBookings: { $sum: '$bookingCount' }
        }
      },
      { $sort: { totalBookings: -1 } },
      {
        $project: {
          _id: 0,
          dayOfWeek: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 1] }, then: 'Sunday' },
                { case: { $eq: ['$_id', 2] }, then: 'Monday' },
                { case: { $eq: ['$_id', 3] }, then: 'Tuesday' },
                { case: { $eq: ['$_id', 4] }, then: 'Wednesday' },
                { case: { $eq: ['$_id', 5] }, then: 'Thursday' },
                { case: { $eq: ['$_id', 6] }, then: 'Friday' },
                { case: { $eq: ['$_id', 7] }, then: 'Saturday' }
              ]
            }
          },
          totalBookings: 1
        }
      }
    ]);

    // High-demand corridors (routes with booking_count > threshold)
    const highDemandCorridors = await RideAnalytics.aggregate([
      {
        $group: {
          _id: { from: '$routeFrom', to: '$routeTo' },
          totalBookings: { $sum: '$bookingCount' },
          avgBookingsPerDay: { $avg: '$bookingCount' }
        }
      },
      { $match: { totalBookings: { $gt: threshold } } },
      { $sort: { totalBookings: -1 } },
      {
        $project: {
          _id: 0,
          route: { $concat: ['$_id.from', ' → ', '$_id.to'] },
          from: '$_id.from',
          to: '$_id.to',
          totalBookings: 1,
          avgBookingsPerDay: { $round: ['$avgBookingsPerDay', 2] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        topRoutes,
        peakDays,
        highDemandCorridors: {
          threshold,
          routes: highDemandCorridors
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRouteAnalytics };
