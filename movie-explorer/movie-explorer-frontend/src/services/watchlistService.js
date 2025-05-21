import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    doc
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Get user's watchlist from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of movie objects
 */
export const getUserWatchlist = async (userId) => {
    try {
        const q = query(
            collection(db, 'watchlist'),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const watchlist = [];

        querySnapshot.forEach((doc) => {
            watchlist.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return watchlist;
    } catch (error) {
        console.error('Error getting watchlist:', error);
        throw new Error('Failed to get watchlist');
    }
};

/**
 * Add a movie to user's watchlist
 * @param {string} userId - User ID
 * @param {Object} movie - Movie data to add
 * @returns {Promise<string>} - Document ID of added movie
 */
export const addToWatchlist = async (userId, movie) => {
    try {
        // Check if movie is already in watchlist
        const q = query(
            collection(db, 'watchlist'),
            where('userId', '==', userId),
            where('movieId', '==', movie.id)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            throw new Error('Movie already in watchlist');
        }

        // Add to watchlist
        const docRef = await addDoc(collection(db, 'watchlist'), {
            userId,
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            releaseDate: movie.release_date,
            overview: movie.overview,
            voteAverage: movie.vote_average,
            addedAt: new Date()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        throw error;
    }
};

/**
 * Remove a movie from user's watchlist
 * @param {string} docId - Firestore document ID of watchlist item
 * @returns {Promise<void>}
 */
export const removeFromWatchlist = async (docId) => {
    try {
        await deleteDoc(doc(db, 'watchlist', docId));
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        throw new Error('Failed to remove from watchlist');
    }
};

/**
 * Check if a movie is in user's watchlist
 * @param {string} userId - User ID
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<Object|null>} - Watchlist document or null
 */
export const isInWatchlist = async (userId, movieId) => {
    try {
        const q = query(
            collection(db, 'watchlist'),
            where('userId', '==', userId),
            where('movieId', '==', movieId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        // Return the document data with ID
        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('Error checking watchlist:', error);
        return null;
    }
};