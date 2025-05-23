import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon, BookmarkIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { likeArticle as fbLikeArticle, unlikeArticle as fbUnlikeArticle } from '../../firebase/articles';
import { formatDate } from '../../utils/dateFormatter';
import { truncateText } from '../../utils/textFormatter';

/**
 * Component to display an article card in a swipeable layout
 * @param {Object} props - Component props
 * @param {Object} props.article - Article object
 * @returns {JSX.Element} ArticleCard component
 */
function ArticleCard({ article }) {
  const { currentUser, userData, addBookmark, removeBookmark } = useAuth();

  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(article.likes || 0);

  useEffect(() => {
    if (currentUser && article.likedBy) {
      setLocalIsLiked(article.likedBy.includes(currentUser.uid));
    } else {
      setLocalIsLiked(false);
    }
    setLocalLikes(article.likes || 0);
  }, [article.likedBy, article.likes, currentUser]);
  
  // Use userData from context to determine if bookmarked
  const isBookmarkedFromContext = userData?.bookmarks?.includes(article.id);
  // Local state for optimistic UI update of bookmark icon, if desired,
  // but relying on context's userData update is simpler.
  // For now, we'll use isBookmarkedFromContext directly for the icon.

  const formattedDate = formatDate(article.publication_date);
  const excerpt = truncateText(article.content, 250) || 'No content available';

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in to like articles.');
      return;
    }

    const originalIsLiked = localIsLiked;
    const originalLikes = localLikes;

    // Optimistic update
    setLocalIsLiked(!originalIsLiked);
    setLocalLikes(originalIsLiked ? originalLikes - 1 : originalLikes + 1);

    try {
      if (originalIsLiked) {
        await fbUnlikeArticle(article.id, currentUser.uid);
      } else {
        await fbLikeArticle(article.id, currentUser.uid);
      }
      // If the parent needs to know about the update (e.g., to refetch a list),
      // an onLikeUpdate prop could be called here.
    } catch (error) {
      console.error('Error toggling like on card:', error);
      alert('Failed to update like status.');
      // Revert optimistic update on error
      setLocalIsLiked(originalIsLiked);
      setLocalLikes(originalLikes);
    }
  };

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in to bookmark articles.');
      return;
    }
    try {
      if (isBookmarkedFromContext) {
        await removeBookmark(article.id);
      } else {
        await addBookmark(article.id);
      }
    } catch (error) {
      console.error('Error toggling bookmark on card:', error);
      alert('Failed to update bookmark.');
      // No local state to revert here as we rely on context for isBookmarkedFromContext
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    // Basic share functionality (e.g., copy link or use Web Share API if available)
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Check out this article: ${article.title}`,
        url: window.location.origin + `/article/${article.id}`,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.origin + `/article/${article.id}`);
      alert('Article link copied to clipboard!');
    }
  };

  // Placeholder image if article.imageUrl is not available
  const imageUrl = article.imageUrl || `https://picsum.photos/seed/${article.id}/800/600`;

  return (
    <div className="h-full w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Image Section */}
      <div className="w-full h-2/5 relative"> {/* Adjusted image height */}
        <img
          src={imageUrl}
          alt={article.title} 
          className="w-full h-full object-cover" 
        />
        {/* Optional: Overlay for better text contrast if title is on image */}
        {/* <div className="absolute inset-0 bg-black opacity-20"></div> */}
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col flex-grow"> {/* Reduced padding */}
        <div className="flex-grow"> {/* Wrapper for text content to grow */}
          {/* Date and Category (Category placeholder) */}
          <div className="mb-2 flex justify-between items-center">
            <p className="text-xs text-gray-500">{formattedDate}</p>
            {article.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                {article.category}
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/article/${article.id}`} className="block mb-2 hover:text-primary-600"> {/* Reduced margin bottom */}
            <h2 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2" title={article.title}> {/* Reduced title size */}
              {article.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <p className="text-sm text-gray-700 mb-3 line-clamp-5"> {/* Increased line-clamp, removed flex-grow */}
            {excerpt}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600"> {/* Reduced padding top */}
          <div className="flex items-center space-x-3"> {/* Reduced spacing */}
            <button
              onClick={handleToggleLike}
              className="flex items-center hover:text-red-500 transition-colors duration-200"
              aria-label={localIsLiked ? "Unlike article" : "Like article"}
              disabled={!currentUser} // Optionally disable if not logged in, though alert handles it
            >
              {localIsLiked ? (
                <HeartIconSolid className="h-4 w-4 mr-1 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-xs">{localLikes}</span>
            </button>
            <Link to={`/article/${article.id}#comments`} className="flex items-center hover:text-primary-600 transition-colors duration-200">
              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
              {/* Assuming article.commentsCount is available or article.comments.length */}
              <span className="text-xs">{article.commentsCount || article.comments?.length || 0}</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="hover:text-primary-600 transition-colors duration-200"
              aria-label="Share article"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
            {currentUser && (
              <button
                onClick={handleToggleBookmark}
                className="hover:text-primary-600 transition-colors duration-200"
                aria-label={isBookmarkedFromContext ? "Remove bookmark" : "Bookmark article"}
              >
                {isBookmarkedFromContext ? (
                  <BookmarkIconSolid className="h-4 w-4 text-primary-500" />
                ) : (
                  <BookmarkIcon className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;