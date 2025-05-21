import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserReviews, deleteReview } from '../services/reviewService';
import { getImageUrl, getMovieDetails } from '../services/movieService';
import { StarIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import updateExistingReviews from '../utils/reviewMigration';

const MyReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchReviews = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Try to update any reviews missing poster paths
                try {
                    await updateExistingReviews(currentUser.uid);
                } catch (migrationError) {
                    console.warn('Error running review migration:', migrationError);
                }

                const data = await getUserReviews(currentUser.uid);

                // Fetch missing poster paths for reviews if needed
                const reviewsWithPosters = await Promise.all(
                    data.map(async (review) => {
                        if (!review.posterPath && review.movieId) {
                            try {
                                const movieDetails = await getMovieDetails(review.movieId);
                                return {
                                    ...review,
                                    posterPath: movieDetails?.poster_path || null
                                };
                            } catch (error) {
                                console.warn(`Could not fetch poster for movie ID: ${review.movieId}`, error);
                                return review;
                            }
                        }
                        return review;
                    })
                );

                setReviews(reviewsWithPosters);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user reviews:', err);
                setError('Failed to load your reviews. Please try again later.');
                setReviews([]); // Set empty array to prevent undefined errors
                setLoading(false);
            }
        };

        fetchReviews();
    }, [currentUser]);

    // Handle deleting a review
    const handleDeleteReview = async (reviewId) => {
        try {
            if (!confirm('Are you sure you want to delete this review?')) {
                return;
            }

            await deleteReview(reviewId);
            setReviews(reviews.filter(review => review.id !== reviewId));
            toast.success('Review deleted successfully');
        } catch (err) {
            console.error('Error deleting review:', err);
            toast.error('Failed to delete review');
        }
    };

    // Format date from Firestore timestamp
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown date';

        // Handle Firestore timestamps
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    // Redirect if not logged in
    if (!currentUser && !loading) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 text-lg">{error}</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
                    <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reviews</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Movies and shows you've reviewed
                        </p>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't reviewed any movies yet</p>
                            <Link
                                to="/"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                            >
                                Explore Movies
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {reviews.map(review => (
                                <div key={review.id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-4">
                                    <div className="sm:w-24 md:w-32 flex-shrink-0">
                                        <Link to={`/movie/${review.movieId}`}>
                                            {review.posterPath ? (
                                                <img
                                                    src={getImageUrl(review.posterPath)}
                                                    alt={review.movieTitle}
                                                    className="rounded-md shadow-sm w-full"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div className="bg-gray-300 dark:bg-gray-700 rounded-md h-40 flex items-center justify-center">
                                                    <span className="text-gray-500 dark:text-gray-400">No Image</span>
                                                </div>
                                            )}
                                        </Link>
                                    </div>

                                    <div className="flex-grow">
                                        <Link
                                            to={`/movie/${review.movieId}`}
                                            className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                                        >
                                            {review.movieTitle}
                                        </Link>

                                        <div className="flex items-center mt-2 mb-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <StarIcon
                                                    key={star}
                                                    className={`h-5 w-5 ${star <= review.rating
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                />
                                            ))}
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">
                                                {review.rating}/5
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            Reviewed on {formatDate(review.createdAt)}
                                            {review.updatedAt && review.updatedAt !== review.createdAt &&
                                                ` (Edited on ${formatDate(review.updatedAt)})`}
                                        </p>

                                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                                            {review.comment || 'No comment provided.'}
                                        </p>

                                        <div className="flex justify-between items-center">
                                            <Link
                                                to={`/movie/${review.movieId}`}
                                                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                            >
                                                View Movie
                                            </Link>

                                            <div className="flex space-x-3">
                                                <Link
                                                    to={`/movie/${review.movieId}`}
                                                    className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                                                >
                                                    <PencilIcon className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Link>

                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="text-red-600 hover:text-red-700 flex items-center text-sm"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyReviewsPage;