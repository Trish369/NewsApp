import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArticles, addArticle, updateArticle } from '../firebase/articles';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

/**
 * Admin page component for managing articles
 * @returns {JSX.Element} AdminPage component
 */
function AdminPage() {
  const navigate = useNavigate();
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('finance');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Fetch articles when component mounts
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const articlesData = await getArticles(20); // Get latest 20 articles
        setArticles(articlesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && currentUser && isAdmin) {
      fetchArticles();
    }
  }, [authLoading, currentUser, isAdmin]);
  
  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) {
      navigate('/', { replace: true });
    }
  }, [authLoading, currentUser, isAdmin, navigate]);
  
  // Reset form
  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('finance');
    setFormMode('create');
    setSelectedArticle(null);
    setFormError(null);
  };
  
  // Set form for editing
  const handleEdit = (article) => {
    setTitle(article.title);
    setContent(article.content);
    setCategory(article.category || 'finance');
    setFormMode('edit');
    setSelectedArticle(article);
    setFormError(null);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim() || !content.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError(null);
      
      const articleData = {
        title: title.trim(),
        content: content.trim(),
        category: category,
        author_id: currentUser.uid
      };
      
      if (formMode === 'create') {
        // Create new article
        const newArticleId = await addArticle(articleData);
        
        // Add to local state
        const newArticle = {
          id: newArticleId,
          ...articleData,
          publication_date: { seconds: Math.floor(Date.now() / 1000) },
          likes: 0
        };
        
        setArticles([newArticle, ...articles]);
      } else {
        // Update existing article
        await updateArticle(selectedArticle.id, articleData);
        
        // Update local state
        const updatedArticles = articles.map(article => 
          article.id === selectedArticle.id 
            ? { ...article, ...articleData } 
            : article
        );
        
        setArticles(updatedArticles);
      }
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error('Error saving article:', err);
      setFormError('Failed to save article. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }
  
  if (!currentUser || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Create and manage articles
        </p>
      </div>
      
      {/* Article Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {formMode === 'create' ? 'Create New Article' : 'Edit Article'}
        </h2>
        
        {formError && <ErrorMessage error={formError} className="mb-4" />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
            >
              <option value="finance">Finance</option>
              <option value="markets">Markets</option>
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="technology">Technology</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            {formMode === 'edit' && (
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting 
                ? (formMode === 'create' ? 'Creating...' : 'Updating...') 
                : (formMode === 'create' ? 'Create Article' : 'Update Article')}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Articles List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage Articles
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" text="Loading articles..." />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorMessage error={error} />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {article.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {article.publication_date ? 
                          new Date(article.publication_date.seconds * 1000).toLocaleDateString() : 
                          'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {article.category || 'Finance'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.likes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/article/${article.id}`)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;