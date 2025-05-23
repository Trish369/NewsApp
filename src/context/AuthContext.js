import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getUserData,
  isUserAdmin,
  addBookmark as fbAddBookmark,
  removeBookmark as fbRemoveBookmark
} from '../firebase/auth';

// Create the context
const AuthContext = createContext();

/**
 * Custom hook to use the auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Auth provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (user) => {
    if (user) {
      try {
        const data = await getUserData(user.uid);
        setUserData(data);
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null); // Clear data on error
        setIsAdmin(false);
      }
    } else {
      setUserData(null);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await fetchUserData(user);
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchUserData]);

  const addBookmarkToContext = useCallback(async (articleId) => {
    if (!currentUser || !userData) {
      throw new Error("User not logged in or user data not available.");
    }
    try {
      await fbAddBookmark(currentUser.uid, articleId);
      setUserData(prevData => ({
        ...prevData,
        bookmarks: [...(prevData?.bookmarks || []), articleId]
      }));
    } catch (error) {
      console.error("Error adding bookmark in context:", error);
      throw error; // Re-throw for component to handle
    }
  }, [currentUser, userData]);

  const removeBookmarkFromContext = useCallback(async (articleId) => {
    if (!currentUser || !userData) {
      throw new Error("User not logged in or user data not available.");
    }
    try {
      await fbRemoveBookmark(currentUser.uid, articleId);
      setUserData(prevData => ({
        ...prevData,
        bookmarks: (prevData?.bookmarks || []).filter(id => id !== articleId)
      }));
    } catch (error) {
      console.error("Error removing bookmark in context:", error);
      throw error; // Re-throw for component to handle
    }
  }, [currentUser, userData]);

  // Context value
  const value = {
    currentUser,
    userData,
    isAdmin,
    loading,
    addBookmark: addBookmarkToContext,
    removeBookmark: removeBookmarkFromContext,
    refreshUserData: () => fetchUserData(currentUser) // Expose a way to refresh user data if needed
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}