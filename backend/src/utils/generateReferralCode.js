const generateReferralCode = (userId) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const idStr = userId.toString();
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const index = idStr.charCodeAt(i % idStr.length) % chars.length;
    code += chars[index];
  }
  
  return code;
};

module.exports = generateReferralCode;
