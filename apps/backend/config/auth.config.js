module.exports = {
  secret: process.env.JWT_SECRET || "medical-appointment-system-secret-key",
  // Token expiration time (in seconds)
  jwtExpiration: 86400, // 24 hours
  // Refresh token expiration time (in seconds)
  jwtRefreshExpiration: 604800, // 7 days
};
