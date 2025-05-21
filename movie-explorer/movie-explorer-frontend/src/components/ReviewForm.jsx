import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addReview, updateReview, getUserReviewForMovie, deleteReview } from '../services/reviewService';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const ReviewForm = ({ movieId, movieTitle, posterPath, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        const checkExistingReview = async () => {
            if (!currentUser || !movieId) return;

            try {
                const review = await getUserReviewForMovie(currentUser.uid, movieId);
                if (review) {
                    setExistingReview(review);
                    // If in edit mode, populate the form
                    if (isEditing) {
                        setRating(review.rating);
                        setComment(review.comment);
                    } else {
                        // If not in edit mode (viewing existing review or initial load),
                        // don't populate form fields, they'll be reset or are for new input.
                        // However, if an existing review is found and we are NOT editing,
                        // the component will render the "Your Review" display block.
                        // If we want to start fresh for a new review if one exists but not editing:
                        setRating(0);
                        setComment('');
                    }
                } else {
                    // No existing review found for this user and movie
                    setExistingReview(null);
                    setIsEditing(false); // Not editing if no review
                    setRating(0);
                    setComment('');
                }
            } catch (error) {
                console.error('Error checking for existing review:', error);
                // toast.error('Could not check your review status.');
            }
        };

        checkExistingReview();
    }, [currentUser, movieId, isEditing]); // isEditing dependency handles re-populating form on edit

    const handleEditClick = () => {
        if (existingReview) {
            setIsEditing(true);
            // The useEffect will now populate the form because isEditing is true
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // The useEffect will reset form fields because isEditing is false and existingReview is still present
    };

    const handleDeleteReview = async () => {
        if (!existingReview) return;

        if (!confirm('Are you sure you want to delete your review?')) {
            return;
        }

        try {
            setIsSubmitting(true);
            await deleteReview(existingReview.id);

            setExistingReview(null);
            setIsEditing(false);
            setRating(0);
            setComment('');

            toast.success('Review deleted successfully');

            if (onReviewSubmitted) {
                setTimeout(() => {
                    onReviewSubmitted();
                }, 500);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error('Please sign in to submit a review');
            return;
        }

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setIsSubmitting(true);

            const reviewData = {
                movieId: parseInt(movieId, 10),
                movieTitle,
                posterPath,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous User',
                userPhotoURL: currentUser.photoURL || null,
                rating,
                comment: comment.trim(),
            };

            if (existingReview && isEditing) {
                await updateReview(existingReview.id, reviewData);
                const updatedReview = {
                    ...existingReview,
                    ...reviewData,
                    updatedAt: new Date(),
                };
                setExistingReview(updatedReview);
                setIsEditing(false); // Exit edit mode
                toast.success('Review updated successfully');
            } else {
                const docId = await addReview(reviewData);
                const newReview = {
                    ...reviewData,
                    id: docId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                setExistingReview(newReview); // Show the new review immediately
                setIsEditing(false); // Ensure not in edit mode
                toast.success('Review submitted successfully');
            }

            // Reset form fields for potential next review (though usually we show the submitted one)
            // If showing the submitted review immediately, this reset might not be what's desired
            // for the form itself if it remains visible. However, the component logic will switch
            // to displaying the "Your Review" block if existingReview is set.
            setRating(0);
            setComment('');

            if (onReviewSubmitted) {
                setTimeout(() => {
                    onReviewSubmitted();
                }, 500);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (existingReview && !isEditing) {
        return (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Review</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleEditClick}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDeleteReview}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm disabled:opacity-50"
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>

                <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <StarSolid
                            key={star}
                            className={`h-5 w-5 ${star <= existingReview.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                                }`}
                        />
                    ))}
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {existingReview.rating}/5
                    </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {existingReview.comment || "No comment provided."}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isEditing ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your review will be visible to all users.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rating
                    </label>
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none"
                            >
                                {star <= (hoverRating || rating) ? (
                                    <StarSolid className="h-8 w-8 text-yellow-400" />
                                ) : (
                                    <StarOutline className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                                )}
                            </button>
                        ))}
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                            {rating > 0 ? `${rating}/5` : 'Select a rating'}
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="comment"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Your Comments (Optional)
                    </label>
                    <textarea
                        id="comment"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Share your thoughts about this movie..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex space-x-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
                    </button>

                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md shadow-sm disabled:opacity-70"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;