const { getRecommendedRides } = require('../utils/recommendations');

const getRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const recommendations = await getRecommendedRides(userId);
    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRecommendations };
