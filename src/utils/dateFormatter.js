import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a date to a readable string
 * @param {Date|Object|number} date - Date object, Firestore timestamp, or Unix timestamp in seconds
 * @param {string} formatString - Format string for date-fns
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatString = 'MMM d, yyyy') {
  if (!date) return 'Unknown date';
  
  // Convert Firestore timestamp to Date
  if (date && typeof date === 'object' && date.seconds) {
    return format(new Date(date.seconds * 1000), formatString);
  }
  
  // Convert Unix timestamp (seconds) to Date
  if (typeof date === 'number') {
    return format(new Date(date * 1000), formatString);
  }
  
  // Regular Date object
  return format(new Date(date), formatString);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param {Date|Object|number} date - Date object, Firestore timestamp, or Unix timestamp in seconds
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return 'Unknown time';
  
  let dateObj;
  
  // Convert Firestore timestamp to Date
  if (date && typeof date === 'object' && date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  }
  // Convert Unix timestamp (seconds) to Date
  else if (typeof date === 'number') {
    dateObj = new Date(date * 1000);
  }
  // Regular Date object
  else {
    dateObj = new Date(date);
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a date for article display
 * @param {Date|Object|number} date - Date object, Firestore timestamp, or Unix timestamp in seconds
 * @returns {string} Formatted date string
 */
export function formatArticleDate(date) {
  return formatDate(date, 'MMMM d, yyyy');
}

/**
 * Format a date and time for comment display
 * @param {Date|Object|number} date - Date object, Firestore timestamp, or Unix timestamp in seconds
 * @returns {string} Formatted date and time string
 */
export function formatCommentDate(date) {
  return formatDate(date, 'MMM d, yyyy • h:mm a');
}