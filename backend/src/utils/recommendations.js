const UserActivity = require('../models/UserActivity');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Booking = require('../models/Booking');

const recommendationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getRecommendedRides = async (userId) => {
  const cacheKey = userId.toString();
  const cached = recommendationCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Fetch user activities
    const activities = await UserActivity.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Count route frequencies
    const routeCount = {};
    activities.forEach(activity => {
      const route = `${activity.fromLocation}|${activity.toLocation}`;
      routeCount[route] = (routeCount[route] || 0) + 1;
    });

    // Get top 3 routes
    const topRoutes = Object.entries(routeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([route]) => {
        const [from, to] = route.split('|');
        return { from, to };
      });

    // Add saved routes
    const user = await User.findById(userId);
    if (user?.savedRoutes) {
      user.savedRoutes.forEach(route => {
        if (!topRoutes.some(r => r.from === route.from && r.to === route.to)) {
          topRoutes.push({ from: route.from, to: route.to });
        }
      });
    }

    let recommendations = [];

    // Find rides for top routes
    if (topRoutes.length > 0) {
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
    }

    // Fallback: popular rides
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

      for (const booking of popularBookings) {
        const rides = await Ride.find({
          from: booking._id.from,
          to: booking._id.to,
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
            recommendationReason: 'Popular route'
          });
        });
      }
    }

    // Limit to 5 recommendations
    recommendations = recommendations.slice(0, 5);

    // Cache result
    recommendationCache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now()
    });

    return recommendations;
  } catch (error) {
    console.error('Get recommendations error:', error);
    return [];
  }
};

module.exports = { getRecommendedRides };
