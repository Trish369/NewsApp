/**
 * Centralized error handling utility
 */

/**
 * Log an error to the console with additional context
 * @param {Error} error - The error object
 * @param {string} context - Context information about where the error occurred
 * @param {Object} additionalData - Any additional data that might be helpful for debugging
 */
export function logError(error, context = '', additionalData = {}) {
  console.error(`Error in ${context}:`, error);
  
  if (Object.keys(additionalData).length > 0) {
    console.error('Additional data:', additionalData);
  }
  
  // In a production app, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}

/**
 * Format an error message for display to the user
 * @param {Error|string} error - The error object or message
 * @param {string} fallbackMessage - Fallback message if error is undefined
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(error, fallbackMessage = 'An unexpected error occurred') {
  if (!error) {
    return fallbackMessage;
  }
  
  // If it's an error object with a message property
  if (error.message) {
    return error.message;
  }
  
  // If it's a Firebase auth error with a code
  if (error.code) {
    return formatFirebaseAuthError(error.code);
  }
  
  // If it's just a string
  if (typeof error === 'string') {
    return error;
  }
  
  return fallbackMessage;
}

/**
 * Format Firebase authentication error codes into user-friendly messages
 * @param {string} errorCode - Firebase auth error code
 * @returns {string} User-friendly error message
 */
function formatFirebaseAuthError(errorCode) {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'This email is already in use';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    default:
      return `Authentication error: ${errorCode}`;
  }
}

/**
 * Handle API errors
 * @param {Error} error - The error object
 * @param {string} context - Context information
 * @returns {string} User-friendly error message
 */
export function handleApiError(error, context = '') {
  logError(error, context);
  
  // Return a user-friendly message
  return formatErrorMessage(error, 'Failed to fetch data. Please try again later.');
}