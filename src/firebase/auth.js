import { auth, db } from './firebaseConfig';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @returns {Promise<Object>} - User credentials
 */
export async function registerUser(email, password, displayName) {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    // Create a user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      displayName: displayName,
      bookmarks: [],
      role: 'user', // Default role
      createdAt: new Date()
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User credentials
 */
export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Logout the current user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Get user data from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export async function getUserData(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return {
      id: userSnap.id,
      ...userSnap.data()
    };
  } else {
    return null;
  }
}

/**
 * Check if user is an admin
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} - True if user is admin
 */
export async function isUserAdmin(uid) {
  const userData = await getUserData(uid);
  return userData?.role === 'admin';
}