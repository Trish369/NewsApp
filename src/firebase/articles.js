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
  increment
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
 * @param {string} id - Article ID
 * @returns {Promise<void>}
 */
export async function likeArticle(id) {
  const articleRef = doc(db, 'articles', id);
  await updateDoc(articleRef, {
    likes: increment(1)
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