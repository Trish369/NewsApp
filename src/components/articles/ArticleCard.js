import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon, BookmarkIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { likeArticle } from '../../firebase/articles'; // Assuming this handles unliking too or we add it
import { formatDate } from '../../utils/dateFormatter';
import { truncateText } from '../../utils/textFormatter';

/**
 * Component to display an article card in a swipeable layout
 * @param {Object} props - Component props
 * @param {Object} props.article - Article object
 * @returns {JSX.Element} ArticleCard component
 */
function ArticleCard({ article }) {
  const { currentUser, userData } = useAuth();

  const isBookmarked = userData?.bookmarks?.includes(article.id);
  const isLiked = userData?.likedArticles?.includes(article.id); // Check if current user liked this article

  const formattedDate = formatDate(article.publication_date);
  const excerpt = truncateText(article.content, 100) || 'No content available'; // Shorter excerpt for card

  const handleLike = async (e) => {
    e.stopPropagation(); // Prevent card click-through if any
    if (!currentUser) {
      alert('Please log in to like articles.');
      return;
    }
    try {
      await likeArticle(article.id, currentUser.uid); // Pass userId if needed by backend
      // TODO: Optimistically update UI or refetch article/userData
    } catch (error) {
      console.error('Error liking article:', error);
      alert('Failed to like article.');
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in to bookmark articles.');
      return;
    }
    // TODO: Implement bookmark functionality (e.g., calling a firebase function)
    // await toggleBookmark(article.id, currentUser.uid);
    console.log('Bookmark clicked for article:', article.id);
    alert('Bookmark functionality not yet implemented.');
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
      <div className="w-full h-3/5 sm:h-2/3 md:h-3/5 lg:h-2/3 xl:h-3/5 relative">
        <img 
          src={imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover" 
        />
        {/* Optional: Overlay for better text contrast if title is on image */}
        {/* <div className="absolute inset-0 bg-black opacity-20"></div> */}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
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
        <Link to={`/article/${article.id}`} className="block mb-3 hover:text-primary-600">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 line-clamp-2" title={article.title}>
            {article.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-grow">
          {excerpt}
        </p>

        {/* Action Buttons */}
        <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="flex items-center hover:text-red-500 transition-colors duration-200"
              aria-label="Like article"
            >
              {isLiked ? (
                <HeartIconSolid className="h-5 w-5 mr-1 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 mr-1" />
              )}
              <span>{article.likes || 0}</span>
            </button>
            <Link to={`/article/${article.id}#comments`} className="flex items-center hover:text-primary-600 transition-colors duration-200">
              <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
              <span>{article.comments?.length || 0}</span>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleShare}
              className="hover:text-primary-600 transition-colors duration-200"
              aria-label="Share article"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            {currentUser && (
              <button 
                onClick={handleBookmark} 
                className="hover:text-primary-600 transition-colors duration-200"
                aria-label="Bookmark article"
              >
                {isBookmarked ? (
                  <BookmarkIconSolid className="h-5 w-5 text-primary-500" />
                ) : (
                  <BookmarkIcon className="h-5 w-5" />
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