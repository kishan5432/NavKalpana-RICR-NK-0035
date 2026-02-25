const SavedRoute = require('../models/SavedRoute');

const saveRoute = async (req, res) => {
  try {
    const { fromLocation, toLocation } = req.body;

    if (!fromLocation || !toLocation) {
      return res.status(400).json({ success: false, message: 'From and to locations are required' });
    }

    const existingRoute = await SavedRoute.findOne({
      userId: req.user._id,
      fromLocation,
      toLocation
    });

    if (existingRoute) {
      return res.status(400).json({ success: false, message: 'Route already saved' });
    }

    const savedRoute = await SavedRoute.create({
      userId: req.user._id,
      fromLocation,
      toLocation
    });

    res.status(201).json({ success: true, savedRoute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSavedRoutes = async (req, res) => {
  try {
    const savedRoutes = await SavedRoute.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, savedRoutes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { saveRoute, getSavedRoutes };
