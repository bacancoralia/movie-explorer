import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Get reviews for a specific movie
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<Array>} - Array of review objects
 */
export const getMovieReviews = async (movieId) => {
    try {
        // First try with the compound index
        try {
            const q = query(
                collection(db, 'reviews'),
                where('movieId', '==', parseInt(movieId)),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const reviews = [];

            querySnapshot.forEach((doc) => {
                reviews.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return reviews;
        } catch (indexError) {
            console.warn('Movie reviews index not ready yet, falling back to basic query:', indexError);

            // If index isn't ready, fall back to a simple query without ordering
            const basicQuery = query(
                collection(db, 'reviews'),
                where('movieId', '==', parseInt(movieId))
            );

            const querySnapshot = await getDocs(basicQuery);
            const reviews = [];

            querySnapshot.forEach((doc) => {
                reviews.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort locally instead since we can't use the index yet
            reviews.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA; // Descending order (newest first)
            });

            return reviews;
        }
    } catch (error) {
        console.error('Error getting movie reviews:', error);
        // Return empty array instead of throwing to prevent app crashes
        return [];
    }
};

/**
 * Get a user's review for a specific movie
 * @param {string} userId - User ID
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<Object|null>} - Review object or null if not found
 */
export const getUserReviewForMovie = async (userId, movieId) => {
    try {
        const q = query(
            collection(db, 'reviews'),
            where('userId', '==', userId),
            where('movieId', '==', parseInt(movieId))
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        // Return the first matching review
        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('Error getting user review:', error);
        throw new Error('Failed to get user review');
    }
};

/**
 * Add a new review
 * @param {Object} reviewData - Review data
 * @returns {Promise<string>} - ID of the new review
 */
export const addReview = async (reviewData) => {
    try {
        // Add timestamp
        const reviewWithTimestamp = {
            ...reviewData,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'reviews'), reviewWithTimestamp);
        return docRef.id;
    } catch (error) {
        console.error('Error adding review:', error);
        throw new Error('Failed to add review');
    }
};

/**
 * Update an existing review
 * @param {string} reviewId - Review document ID
 * @param {Object} reviewData - Updated review data
 * @returns {Promise<void>}
 */
export const updateReview = async (reviewId, reviewData) => {
    try {
        // Add timestamp for last update
        const reviewWithTimestamp = {
            ...reviewData,
            updatedAt: serverTimestamp()
        };

        const reviewRef = doc(db, 'reviews', reviewId);
        await updateDoc(reviewRef, reviewWithTimestamp);
    } catch (error) {
        console.error('Error updating review:', error);
        throw new Error('Failed to update review');
    }
};

/**
 * Delete a review
 * @param {string} reviewId - Review document ID
 * @returns {Promise<void>}
 */
export const deleteReview = async (reviewId) => {
    try {
        await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (error) {
        console.error('Error deleting review:', error);
        throw new Error('Failed to delete review');
    }
};

/**
 * Get all reviews by a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of review objects
 */
export const getUserReviews = async (userId) => {
    try {
        // First try with the compound index
        try {
            const q = query(
                collection(db, 'reviews'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const reviews = [];

            querySnapshot.forEach((doc) => {
                reviews.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return reviews;
        } catch (indexError) {
            console.warn('Index not ready yet, falling back to basic query:', indexError);

            // If index isn't ready, fall back to a simple query without ordering
            const basicQuery = query(
                collection(db, 'reviews'),
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(basicQuery);
            const reviews = [];

            querySnapshot.forEach((doc) => {
                reviews.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort locally instead since we can't use the index yet
            reviews.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA; // Descending order (newest first)
            });

            return reviews;
        }
    } catch (error) {
        console.error('Error getting user reviews:', error);
        // Return empty array instead of throwing to prevent app crashes
        return [];
    }
};