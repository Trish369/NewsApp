import { useState, useEffect } from 'react';
import { getArticles, getArticleById } from '../firebase/articles';
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
  
  const fetchArticle = async () => {
    if (!id) {
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
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchArticle();
  }, [id]);
  
  return { article, loading, error, refetch: fetchArticle };
}