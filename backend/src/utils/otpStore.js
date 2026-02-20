const otpStore = new Map();

const setOTP = (identifier, otp) => {
  otpStore.set(identifier, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000
  });
};

const getOTP = (identifier) => {
  return otpStore.get(identifier) || null;
};

const deleteOTP = (identifier) => {
  otpStore.delete(identifier);
};

const verifyOTP = (identifier, inputOtp) => {
  const entry = getOTP(identifier);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    deleteOTP(identifier);
    return false;
  }
  return entry.otp === inputOtp;
};

module.exports = { setOTP, getOTP, deleteOTP, verifyOTP };
