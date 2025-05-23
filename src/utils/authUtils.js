/**
 * Check if a user has admin privileges
 * @param {Object} userData - User data from Firestore
 * @returns {boolean} True if user is an admin
 */
export function isAdmin(userData) {
  return userData?.role === 'admin';
}

/**
 * Check if a user can edit a comment
 * @param {Object} comment - Comment object
 * @param {Object} user - Current user object
 * @param {Object} userData - User data from Firestore
 * @returns {boolean} True if user can edit the comment
 */
export function canEditComment(comment, user, userData) {
  if (!user || !comment) return false;
  
  // User can edit their own comments
  if (comment.user_id === user.uid) return true;
  
  // Admins can edit any comment
  if (isAdmin(userData)) return true;
  
  return false;
}

/**
 * Check if a user can delete a comment
 * @param {Object} comment - Comment object
 * @param {Object} user - Current user object
 * @param {Object} userData - User data from Firestore
 * @returns {boolean} True if user can delete the comment
 */
export function canDeleteComment(comment, user, userData) {
  // Same rules as editing for now
  return canEditComment(comment, user, userData);
}

/**
 * Check if a user can edit an article
 * @param {Object} article - Article object
 * @param {Object} user - Current user object
 * @param {Object} userData - User data from Firestore
 * @returns {boolean} True if user can edit the article
 */
export function canEditArticle(article, user, userData) {
  if (!user || !article) return false;
  
  // Only admins can edit articles
  if (isAdmin(userData)) return true;
  
  // Author can edit their own articles
  if (article.author_id === user.uid) return true;
  
  return false;
}

/**
 * Get user display name
 * @param {Object} user - Firebase user object
 * @returns {string} User display name or email
 */
export function getUserDisplayName(user) {
  if (!user) return 'Guest';
  
  return user.displayName || user.email || 'User';
}

/**
 * Get user initials for avatar
 * @param {Object} user - Firebase user object
 * @returns {string} User initials
 */
export function getUserInitials(user) {
  if (!user) return 'G';
  
  if (user.displayName) {
    // Get initials from display name
    return user.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  // Get first letter of email
  return (user.email?.[0] || 'U').toUpperCase();
}