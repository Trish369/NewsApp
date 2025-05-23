import { useState, useEffect } from 'react';
import { getCommentsByArticleId, addComment, deleteComment } from '../firebase/comments';
import { useAuth } from '../context/AuthContext';
import { logError, handleApiError } from '../utils/errorHandler';

/**
 * Custom hook for fetching and managing comments for an article
 * @param {string} articleId - Article ID
 * @returns {Object} Comments data, loading state, error state, and comment management functions
 */
export function useComments(articleId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  const fetchComments = async () => {
    if (!articleId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const commentsData = await getCommentsByArticleId(articleId);
      setComments(commentsData);
      setError(null);
    } catch (err) {
      // Don't show error for missing collection, just return empty array
      if (err.code === 'permission-denied' || err.code === 'not-found') {
        setComments([]);
        setError(null);
      } else {
        logError(err, 'useComments.fetchComments', { articleId });
        setError(handleApiError(err, 'fetching comments'));
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, [articleId]);
  
  /**
   * Add a new comment to the article
   * @param {string} text - Comment text
   * @param {boolean} isAnonymous - Whether the comment is anonymous
   * @returns {Promise<Object>} New comment object
   */
  const postComment = async (text, isAnonymous = false) => {
    if (!currentUser) {
      throw new Error('You must be logged in to comment');
    }
    
    if (!text.trim()) {
      throw new Error('Comment cannot be empty');
    }
    
    try {
      const commentData = {
        article_id: articleId,
        user_id: currentUser.uid,
        user_name: isAnonymous ? null : currentUser.displayName || currentUser.email,
        text: text.trim(),
        is_anonymous: isAnonymous
      };
      
      const commentId = await addComment(commentData);
      
      // Add the ID and created_at to the comment data for the UI
      const newComment = {
        id: commentId,
        ...commentData,
        created_at: { seconds: Math.floor(Date.now() / 1000) } // Approximate timestamp for UI
      };
      
      // Update local state
      setComments(prevComments => [newComment, ...prevComments]);
      
      return newComment;
    } catch (err) {
      logError(err, 'useComments.postComment', { articleId });
      throw err;
    }
  };
  
  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<void>}
   */
  const removeComment = async (commentId) => {
    if (!currentUser) {
      throw new Error('You must be logged in to delete a comment');
    }
    
    try {
      await deleteComment(commentId);
      
      // Update local state
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    } catch (err) {
      logError(err, 'useComments.removeComment', { commentId });
      throw err;
    }
  };
  
  return { 
    comments, 
    loading, 
    error, 
    refetch: fetchComments,
    postComment,
    removeComment
  };
}