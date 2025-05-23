import { auth, db } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

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

/**
 * Helper function to create or update user data in Firestore after social login
 * @param {Object} user - Firebase user object
 * @returns {Promise<void>}
 */
async function upsertUserInFirestore(user) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // If user doesn't exist, create a new document
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || 'User', // Use a default if displayName is null
      photoURL: user.photoURL,
      bookmarks: [],
      role: 'user', // Default role
      createdAt: new Date(),
      providerId: user.providerData[0]?.providerId || 'unknown'
    });
  } else {
    // Optionally, update existing user data if needed, e.g., last login, photoURL
    // For now, we'll just ensure the basic fields are there if they logged in via a new provider
    const existingData = userSnap.data();
    await setDoc(userRef, {
      ...existingData,
      email: user.email || existingData.email,
      displayName: user.displayName || existingData.displayName || 'User',
      photoURL: user.photoURL || existingData.photoURL,
      lastLogin: new Date(),
      providerId: user.providerData[0]?.providerId || existingData.providerId || 'unknown'
    }, { merge: true });
  }
}

/**
 * Sign in with Google
 * @returns {Promise<Object>} - User credentials
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    await upsertUserInFirestore(result.user);
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    // Handle specific errors like popup closed by user, account exists with different credential, etc.
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In popup closed by user.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.');
    }
    throw error;
  }
}

/**
 * Add an article to the user's bookmarks
 * @param {string} userId - User ID
 * @param {string} articleId - Article ID to bookmark
 * @returns {Promise<void>}
 */
export async function addBookmark(userId, articleId) {
  if (!userId || !articleId) {
    throw new Error('User ID and Article ID are required to add a bookmark.');
  }
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      bookmarks: arrayUnion(articleId)
    });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }
}

/**
 * Remove an article from the user's bookmarks
 * @param {string} userId - User ID
 * @param {string} articleId - Article ID to remove from bookmarks
 * @returns {Promise<void>}
 */
export async function removeBookmark(userId, articleId) {
  if (!userId || !articleId) {
    throw new Error('User ID and Article ID are required to remove a bookmark.');
  }
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      bookmarks: arrayRemove(articleId)
    });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
}

/**
 * Sign in with Apple
 * @returns {Promise<Object>} - User credentials
 */
export async function signInWithApple() {
  const provider = new OAuthProvider('apple.com');
  // You can add custom parameters if needed, e.g., for specific scopes
  // provider.addScope('email');
  // provider.addScope('name');
  try {
    const result = await signInWithPopup(auth, provider);
    // Apple sign-in might not always return email/displayName directly
    // You might need to handle this based on your Firebase project settings and Apple Developer configuration
    await upsertUserInFirestore(result.user);
    return result;
  } catch (error)
 {
    console.error('Error signing in with Apple:', error);
    // Handle specific errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Apple Sign-In popup closed by user.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.');
    } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Apple Sign-In is not enabled. Please enable it in the Firebase console.');
    }
    throw error;
  }
}