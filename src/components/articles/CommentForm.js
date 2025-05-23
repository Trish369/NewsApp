import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addComment } from '../../firebase/comments';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Component for adding comments to an article
 * @param {Object} props - Component props
 * @param {string} props.articleId - ID of the article to comment on
 * @param {Function} props.onCommentAdded - Callback function when comment is added
 * @returns {JSX.Element} CommentForm component
 */
function CommentForm({ articleId, onCommentAdded }) {
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to comment');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const commentData = {
        article_id: articleId,
        user_id: currentUser.uid,
        user_name: isAnonymous ? null : currentUser.displayName || currentUser.email,
        text: commentText.trim(),
        is_anonymous: isAnonymous
      };
      
      const commentId = await addComment(commentData);
      
      // Add the ID and created_at to the comment data for the UI
      const newComment = {
        id: commentId,
        ...commentData,
        created_at: { seconds: Math.floor(Date.now() / 1000) } // Approximate timestamp for UI
      };
      
      // Call the callback with the new comment
      onCommentAdded(newComment);
      
      // Reset form
      setCommentText('');
      setIsAnonymous(false);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Add a comment
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          className="shadow-sm block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300 rounded-md p-2"
          placeholder="Share your thoughts..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={submitting}
        />
      </div>
      
      <div className="flex items-center">
        <input
          id="anonymous"
          name="anonymous"
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          disabled={submitting}
        />
        <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
          Post anonymously
        </label>
      </div>
      
      {error && <ErrorMessage error={error} />}
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={submitting || !commentText.trim()}
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}

export default CommentForm;