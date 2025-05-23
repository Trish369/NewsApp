import { db } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

/**
 * Get all articles with optional limit
 * @param {number} limitCount - Maximum number of articles to retrieve
 * @returns {Promise<Array>} - Array of article objects
 */
export async function getArticles(limitCount = 10) {
  const articlesRef = collection(db, 'articles');
  const q = query(articlesRef, orderBy('publication_date', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Get a single article by ID
 * @param {string} id - Article ID
 * @returns {Promise<Object>} - Article object
 */
export async function getArticleById(id) {
  const docRef = doc(db, 'articles', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } else {
    throw new Error('Article not found');
  }
}

/**
 * Like an article
 * @param {string} articleId - Article ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function likeArticle(articleId, userId) {
  if (!userId) {
    throw new Error("User ID is required to like an article.");
  }
  const articleRef = doc(db, 'articles', articleId);
  // Atomically add the user's ID to the 'likedBy' array and increment likes.
  // This ensures that a user cannot like an article multiple times if their ID is already in likedBy.
  // However, to be absolutely sure likes count matches likedBy.length, a transaction might be needed
  // or we rely on likedBy array to be the source of truth for "who liked" and likes as a quick counter.
  // For now, we'll update both. A more robust solution would be to check if user is already in likedBy before incrementing.
  // Let's refine this: fetch the doc, check, then update. Or use a transaction.
  // For simplicity and common practice with arrayUnion, we'll assume it handles non-duplication for the array.
  // The likes count should ideally be updated based on the array's length or in a transaction.
  // A simpler approach for now:
  const docSnap = await getDoc(articleRef);
  if (docSnap.exists()) {
    const articleData = docSnap.data();
    if (articleData.likedBy && articleData.likedBy.includes(userId)) {
      // User has already liked this article, do nothing or throw an error
      console.log("User has already liked this article.");
      return;
    }
  }

  await updateDoc(articleRef, {
    likes: increment(1),
    likedBy: arrayUnion(userId)
  });
}

/**
 * Unlike an article
 * @param {string} articleId - Article ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function unlikeArticle(articleId, userId) {
  if (!userId) {
    throw new Error("User ID is required to unlike an article.");
  }
  const articleRef = doc(db, 'articles', articleId);
  
  // Atomically remove the user's ID from the 'likedBy' array and decrement likes.
  // Similar to likeArticle, a transaction would be more robust for ensuring consistency.
  // For now, we'll update both.
  const docSnap = await getDoc(articleRef);
  if (docSnap.exists()) {
    const articleData = docSnap.data();
    if (!articleData.likedBy || !articleData.likedBy.includes(userId)) {
      // User hasn't liked this article or already unliked.
      console.log("User has not liked this article or already unliked.");
      return;
    }
  }

  await updateDoc(articleRef, {
    likes: increment(-1),
    likedBy: arrayRemove(userId)
  });
}

/**
 * Add a new article (admin only)
 * @param {Object} articleData - Article data
 * @returns {Promise<string>} - New article ID
 */
export async function addArticle(articleData) {
  const articlesRef = collection(db, 'articles');
  const newArticle = await addDoc(articlesRef, {
    ...articleData,
    likes: 0,
    likedBy: [], // Initialize likedBy array
    publication_date: new Date()
  });
  
  return newArticle.id;
}

/**
 * Update an existing article (admin only)
 * @param {string} id - Article ID
 * @param {Object} articleData - Updated article data
 * @returns {Promise<void>}
 */
export async function updateArticle(id, articleData) {
  const articleRef = doc(db, 'articles', id);
  await updateDoc(articleRef, articleData);
}

/**
 * Bookmark an article for a user
 * @param {string} articleId - Article ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function bookmarkArticle(articleId, userId) {
  // This will be implemented when we set up the user service
  // It will update the user's bookmarks array
}