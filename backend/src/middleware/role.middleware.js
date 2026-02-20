const requireDriver = (req, res, next) => {
  if (req.user.role === 'driver' || req.user.role === 'both') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Driver access required' });
};

const requirePassenger = (req, res, next) => {
  if (req.user.role === 'passenger' || req.user.role === 'both') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Passenger access required' });
};

module.exports = { requireDriver, requirePassenger };
