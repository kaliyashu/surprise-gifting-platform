// server/utils/email.js
// Stub implementations for email utilities used in auth.js

// Sends a verification email (stub)
function sendVerificationEmail(email, token) {
  // In production, integrate with an email service
  return Promise.resolve({ success: true, email, token });
}

// Sends a password reset email (stub)
function sendPasswordResetEmail(email, token) {
  // In production, integrate with an email service
  return Promise.resolve({ success: true, email, token });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
