import { useState, useEffect, useCallback } from 'react';
import { getArticles, getArticleById, likeArticle as fbLikeArticle, unlikeArticle as fbUnlikeArticle } from '../firebase/articles';
import { useAuth } from '../context/AuthContext';
import { logError, handleApiError } from '../utils/errorHandler';

/**
 * Custom hook for fetching articles
 * @param {number} limit - Maximum number of articles to fetch
 * @returns {Object} Articles data, loading state, error state, and refetch function
 */
export function useArticles(limit = 10) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const articlesData = await getArticles(limit);
      setArticles(articlesData);
      setError(null);
    } catch (err) {
      logError(err, 'useArticles.fetchArticles', { limit });
      setError(handleApiError(err, 'fetching articles'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchArticles();
  }, [limit]);
  
  return { articles, loading, error, refetch: fetchArticles };
}

/**
 * Custom hook for fetching a single article by ID
 * @param {string} id - Article ID
 * @returns {Object} Article data, loading state, error state, and refetch function
 */
export function useArticle(id) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const fetchArticle = useCallback(async () => {
    if (!id) {
      setArticle(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const articleData = await getArticleById(id);
      setArticle(articleData);
      setError(null);
    } catch (err) {
      logError(err, 'useArticle.fetchArticle', { id });
      setError(handleApiError(err, 'fetching article'));
      setArticle(null); // Clear article on error
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleLikeArticle = async () => {
    if (!currentUser) {
      setError('You must be logged in to like an article.');
      return;
    }
    if (!article) return;

    try {
      await fbLikeArticle(article.id, currentUser.uid);
      // Optimistic update or refetch
      setArticle(prev => {
        if (!prev) return null;
        const alreadyLiked = prev.likedBy && prev.likedBy.includes(currentUser.uid);
        return {
          ...prev,
          likes: alreadyLiked ? prev.likes : (prev.likes || 0) + 1,
          likedBy: alreadyLiked ? prev.likedBy : [...(prev.likedBy || []), currentUser.uid]
        };
      });
      setError(null); // Clear previous errors
    } catch (err) {
      logError(err, 'useArticle.handleLikeArticle', { articleId: article.id, userId: currentUser.uid });
      setError(handleApiError(err, 'liking article'));
    }
  };

  const handleUnlikeArticle = async () => {
    if (!currentUser) {
      setError('You must be logged in to unlike an article.');
      return;
    }
    if (!article) return;

    try {
      await fbUnlikeArticle(article.id, currentUser.uid);
      // Optimistic update or refetch
      setArticle(prev => {
        if (!prev) return null;
        const wasLiked = prev.likedBy && prev.likedBy.includes(currentUser.uid);
        return {
          ...prev,
          likes: wasLiked && prev.likes > 0 ? prev.likes - 1 : prev.likes,
          likedBy: wasLiked ? prev.likedBy.filter(uid => uid !== currentUser.uid) : prev.likedBy
        };
      });
      setError(null); // Clear previous errors
    } catch (err) {
      logError(err, 'useArticle.handleUnlikeArticle', { articleId: article.id, userId: currentUser.uid });
      setError(handleApiError(err, 'unliking article'));
    }
  };
  
  return { article, loading, error, refetch: fetchArticle, handleLikeArticle, handleUnlikeArticle };
}