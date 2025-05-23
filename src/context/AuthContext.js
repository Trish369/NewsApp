import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserData, isUserAdmin } from '../firebase/auth';

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

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDataFromFirestore = await getUserData(user.uid);
          setUserData(userDataFromFirestore);
          
          // Check if user is admin
          const adminStatus = await isUserAdmin(user.uid);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    userData,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}