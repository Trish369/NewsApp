import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useArticle } from '../hooks/useArticles';
import { useComments } from '../hooks/useComments';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import ArticleDetail from '../components/articles/ArticleDetail';
import CommentList from '../components/articles/CommentList';
import CommentForm from '../components/articles/CommentForm';

/**
 * Article detail page component
 * @returns {JSX.Element} ArticleDetailPage component
 */
function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData, addBookmark, removeBookmark } = useAuth();
  
  // Use custom hooks for article and comments
  const {
    article,
    loading,
    error,
    // refetch, // refetch is handled by like/unlike handlers now for optimistic updates
    handleLikeArticle,
    handleUnlikeArticle
  } = useArticle(id);
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    postComment
  } = useComments(id);
  
  // Check if article is bookmarked by current user
  const isBookmarked = userData?.bookmarks?.includes(id);

  const handleToggleLike = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/article/${id}` } });
      return;
    }
    if (!article) return;

    const hasLiked = article.likedBy && article.likedBy.includes(currentUser.uid);

    try {
      if (hasLiked) {
        await handleUnlikeArticle();
      } else {
        await handleLikeArticle();
      }
    } catch (err) {
      // Error is already logged and set in the useArticle hook
      console.error('Error toggling like:', err);
    }
  };
  
  const handleToggleBookmark = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/article/${id}` } });
      return;
    }
    if (!article) return;

    try {
      if (isBookmarked) {
        await removeBookmark(article.id);
      } else {
        await addBookmark(article.id);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      // Optionally, show an error message to the user
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" text="Loading article..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage error={error} />
        <div className="mt-4">
          <Button onClick={() => navigate('/')} variant="secondary">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')} variant="primary">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button onClick={() => navigate('/')} variant="outline" size="sm">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
      
      {/* Article content */}
      <ArticleDetail
        article={article}
        isBookmarked={isBookmarked}
        onLikeUnlike={handleToggleLike}
        onBookmark={handleToggleBookmark}
      />
      
      {/* Comments section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Comments</h2>
        
        {/* Comment form */}
        {currentUser ? (
          <div className="mb-8">
            <CommentForm articleId={id} onCommentAdded={postComment} />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <p className="text-gray-700">
              Please <Button onClick={() => navigate('/login')} variant="outline" size="sm">login</Button> to leave a comment.
            </p>
          </div>
        )}
        
        {/* Comments list */}
        {commentsLoading ? (
          <div className="flex justify-center py-6">
            <Loading size="md" text="Loading comments..." />
          </div>
        ) : commentsError ? (
          <ErrorMessage error={commentsError} />
        ) : comments.length > 0 ? (
          <CommentList comments={comments} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleDetailPage;