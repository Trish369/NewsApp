import React from 'react';
import { HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { formatArticleDate } from '../../utils/dateFormatter';
import { formatArticleContent } from '../../utils/textFormatter';
import { useAuth } from '../../context/AuthContext';

/**
 * Component to display the full article content
 * @param {Object} props - Component props
 * @param {Object} props.article - Article object
 * @param {boolean} props.isBookmarked - Whether the article is bookmarked by the current user
 * @param {Function} props.onLike - Function to call when the like button is clicked
 * @param {Function} props.onBookmark - Function to call when the bookmark button is clicked
 * @returns {JSX.Element} ArticleDetail component
 */
function ArticleDetail({ article, isBookmarked, onLike, onBookmark }) {
  const { currentUser } = useAuth();
  
  if (!article) return null;
  
  // Format publication date
  const formattedDate = formatArticleDate(article.publication_date);
  
  // Format article content
  const paragraphs = formatArticleContent(article.content);
  
  return (
    <article className="max-w-3xl mx-auto">
      {/* Article header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {formattedDate}
          </p>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onLike}
              className="flex items-center text-gray-500 hover:text-red-500"
              aria-label="Like article"
            >
              {article.userLiked ? (
                <HeartIconSolid className="h-5 w-5 mr-1 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 mr-1" />
              )}
              <span>{article.likes || 0}</span>
            </button>
            
            {currentUser && (
              <button 
                onClick={onBookmark}
                className="text-gray-500 hover:text-primary-600"
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
              >
                {isBookmarked ? (
                  <BookmarkIconSolid className="h-5 w-5 text-primary-600" />
                ) : (
                  <BookmarkIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Article content */}
      <div className="prose max-w-none">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      
      {/* Article footer */}
      <footer className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Category: <span className="font-medium">{article.category || 'Finance'}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={onLike}
              className="flex items-center text-gray-500 hover:text-red-500"
              aria-label="Like article"
            >
              {article.userLiked ? (
                <HeartIconSolid className="h-5 w-5 mr-1 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 mr-1" />
              )}
              <span>{article.likes || 0} likes</span>
            </button>
          </div>
        </div>
      </footer>
    </article>
  );
}

export default ArticleDetail;