import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../firebase/auth';
import { getArticleById } from '../firebase/articles'; // To fetch bookmarked articles
import Button from '../components/common/Button';
import ArticleList from '../components/articles/ArticleList'; // To display bookmarked articles
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ProfilePage = () => {
  const { currentUser, userData, loading: authLoading } = useAuth(); // Get loading state from useAuth
  const navigate = useNavigate();
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [bookmarksError, setBookmarksError] = useState(null);

  useEffect(() => {
    const fetchBookmarkedArticles = async () => {
      if (userData?.bookmarks && userData.bookmarks.length > 0) {
        setLoadingBookmarks(true);
        setBookmarksError(null);
        try {
          const articlesPromises = userData.bookmarks.map(articleId => getArticleById(articleId));
          const fetchedArticles = await Promise.all(articlesPromises);
          // Filter out any null results if an article was deleted but bookmark remained
          setBookmarkedArticles(fetchedArticles.filter(article => article !== null));
        } catch (error) {
          console.error("Error fetching bookmarked articles:", error);
          setBookmarksError("Failed to load bookmarked articles.");
        } finally {
          setLoadingBookmarks(false);
        }
      } else {
        setBookmarkedArticles([]); // Clear if no bookmarks
      }
    };

    fetchBookmarkedArticles();
  }, [userData?.bookmarks]); // Rerun when bookmarks array changes

  const handleLogout = async () => {
    try {
      await logoutUser(); // Changed to logoutUser()
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      // Handle error (e.g., show a message to the user)
    }
  };

  // Show loading for user data if AuthContext is still loading
  if (authLoading) {
      return <Loading text="Loading profile..." />;
  }

  if (!currentUser) {
    // Redirect to login or show a message
    // This check should come after authLoading is false
    navigate('/login', { state: { from: '/profile' } });
    return <Loading text="Redirecting to login..." />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Profile</h1>
        
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Account Information</h2>
          <p className="text-gray-600"><strong>Email:</strong> {currentUser.email}</p>
          {currentUser.displayName && (
            <p className="text-gray-600"><strong>Name:</strong> {currentUser.displayName}</p>
          )}
        </div>
        
        {/* Placeholder for other profile settings */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">User Settings</h2>
          <p className="text-gray-600">Profile settings adjustment options will be here.</p>
        </div>

        <Button onClick={handleLogout} variant="danger" className="w-full sm:w-auto">
          Logout
        </Button>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Bookmarks</h2>
        {loadingBookmarks ? (
          <Loading text="Loading bookmarks..." />
        ) : bookmarksError ? (
          <ErrorMessage error={bookmarksError} />
        ) : bookmarkedArticles.length > 0 ? (
          <ArticleList articles={bookmarkedArticles} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't bookmarked any articles yet.</p>
            <Button onClick={() => navigate('/')} variant="primary">
              Explore Articles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;