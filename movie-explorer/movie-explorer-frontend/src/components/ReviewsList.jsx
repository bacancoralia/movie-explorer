import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { getImageUrl } from '../services/movieService';

const ReviewsList = ({ reviews }) => {
    // Format date from Firestore timestamp
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown date';

        try {
            // Handle Firestore timestamps
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).format(date);
        } catch (error) {
            console.warn("Error formatting date:", error);
            return 'Unknown date';
        }
    };

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-start">
                        {/* User avatar */}
                        <div className="flex-shrink-0 mr-4">
                            {review.userPhotoURL ? (
                                <img
                                    src={review.userPhotoURL}
                                    alt={review.userName}
                                    className="h-10 w-10 rounded-full"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/40?text=User';
                                    }}
                                />
                            ) : (
                                <UserCircleIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                            )}
                        </div>

                        {/* Review content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {review.userName || 'Anonymous User'}
                                </h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {review.createdAt ? formatDate(review.createdAt) : 'Just now'}
                                </span>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon
                                        key={star}
                                        className={`h-4 w-4 ${star <= review.rating
                                                ? 'text-yellow-400'
                                                : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                    />
                                ))}
                                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                                    {review.rating}/5
                                </span>
                            </div>

                            {/* Review text */}
                            {review.comment && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {review.comment}
                                </p>
                            )}

                            {/* Edited indicator */}
                            {review.updatedAt && review.updatedAt !== review.createdAt && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                    Edited {formatDate(review.updatedAt)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewsList;