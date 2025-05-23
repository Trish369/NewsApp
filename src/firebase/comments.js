import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';

/**
 * Get comments for an article
 * @param {string} articleId - Article ID
 * @returns {Promise<Array>} - Array of comment objects
 */
export async function getCommentsByArticleId(articleId) {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('article_id', '==', articleId),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    // If the collection doesn't exist yet, return an empty array
    if (error.code === 'permission-denied' || error.code === 'not-found') {
      return [];
    }
    throw error;
  }
}

/**
 * Add a comment to an article
 * @param {Object} commentData - Comment data including article_id, user_id, text, and is_anonymous
 * @returns {Promise<string>} - New comment ID
 */
export async function addComment(commentData) {
  const commentsRef = collection(db, 'comments');
  const newComment = await addDoc(commentsRef, {
    ...commentData,
    created_at: new Date()
  });
  
  return newComment.id;
}

/**
 * Delete a comment (for user who created it or admin)
 * @param {string} commentId - Comment ID
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId) {
  const commentRef = doc(db, 'comments', commentId);
  await deleteDoc(commentRef);
}

/**
 * Get comments by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of comment objects
 */
export async function getCommentsByUserId(userId) {
  const commentsRef = collection(db, 'comments');
  const q = query(
    commentsRef, 
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}