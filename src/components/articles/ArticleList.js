import React from 'react';
import ArticleCard from './ArticleCard';

/**
 * Component to display a list of articles
 * @param {Object} props - Component props
 * @param {Array} props.articles - Array of article objects
 * @returns {JSX.Element} ArticleList component
 */
function ArticleList({ articles }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export default ArticleList;