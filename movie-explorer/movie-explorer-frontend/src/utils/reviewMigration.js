import { db } from '../firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getMovieDetails } from '../services/movieService';

/**
 * Utility function to update existing reviews that might not have a posterPath
 * This would run automatically when a user visits their reviews page
 */
export const updateExistingReviews = async (userId) => {
    try {
        // Get user's reviews
        const q = query(collection(db, 'reviews'));
        const querySnapshot = await getDocs(q);

        let updatedCount = 0;
        const updatePromises = [];

        // For each review without a posterPath
        for (const docSnapshot of querySnapshot.docs) {
            const reviewData = docSnapshot.data();

            // If this review doesn't have a posterPath
            if (reviewData.movieId && !reviewData.posterPath) {
                try {
                    // Fetch movie details to get the poster path
                    const movieDetails = await getMovieDetails(reviewData.movieId);

                    if (movieDetails && movieDetails.poster_path) {
                        // Update the review with the poster path
                        const reviewRef = doc(db, 'reviews', docSnapshot.id);
                        const updatePromise = updateDoc(reviewRef, {
                            posterPath: movieDetails.poster_path
                        });
                        updatePromises.push(updatePromise);
                        updatedCount++;
                    }
                } catch (movieError) {
                    console.warn(`Could not fetch movie details for ID: ${reviewData.movieId}`, movieError);
                }
            }
        }

        // Wait for all updates to complete
        await Promise.all(updatePromises);
        console.log(`Updated ${updatedCount} reviews with missing poster paths`);

        return updatedCount;
    } catch (error) {
        console.error('Error updating existing reviews:', error);
        return 0;
    }
};

export default updateExistingReviews;