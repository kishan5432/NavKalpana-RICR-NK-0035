const otpStore = new Map();

const setOTP = (identifier, otp) => {
  console.log('Setting OTP for:', identifier, 'OTP:', otp);
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
  console.log('OTP Store - Identifier:', identifier);
  console.log('OTP Store - Entry:', entry);
  console.log('OTP Store - Input OTP:', inputOtp, 'Type:', typeof inputOtp);
  if (!entry) {
    console.log('No OTP found for identifier');
    return false;
  }
  if (Date.now() > entry.expiresAt) {
    console.log('OTP expired');
    deleteOTP(identifier);
    return false;
  }
  console.log('Comparing:', entry.otp, '===', inputOtp, ':', entry.otp === inputOtp);
  return entry.otp === inputOtp;
};

module.exports = { setOTP, getOTP, deleteOTP, verifyOTP };
