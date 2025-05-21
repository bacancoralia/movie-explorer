import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserWatchlist, removeFromWatchlist } from '../services/watchlistService';
import { getImageUrl } from '../services/movieService';
import { StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const WatchlistPage = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchWatchlist = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getUserWatchlist(currentUser.uid);

                // Sort by date added (newest first)
                data.sort((a, b) => b.addedAt.toDate() - a.addedAt.toDate());

                setWatchlist(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching watchlist:', err);
                setError('Failed to load your watchlist. Please try again later.');
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, [currentUser]);

    // Handle removing from watchlist
    const handleRemove = async (docId) => {
        try {
            await removeFromWatchlist(docId);
            setWatchlist(watchlist.filter(item => item.id !== docId));
            toast.success('Removed from watchlist');
        } catch (err) {
            console.error('Error removing from watchlist:', err);
            toast.error('Failed to remove from watchlist');
        }
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Watchlist</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Movies and shows you want to watch
                        </p>
                    </div>

                    {watchlist.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">Your watchlist is empty</p>
                            <Link
                                to="/"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                            >
                                Explore Movies
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {watchlist.map(item => (
                                <div key={item.id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-4">
                                    <div className="sm:w-24 md:w-32 flex-shrink-0">
                                        <Link to={`/movie/${item.movieId}`}>
                                            {item.posterPath ? (
                                                <img
                                                    src={getImageUrl(item.posterPath, 'w500')}
                                                    alt={item.title}
                                                    className="rounded-md shadow-sm w-full"
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
                                            to={`/movie/${item.movieId}`}
                                            className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                                        >
                                            {item.title}
                                        </Link>

                                        <div className="flex items-center mt-2 mb-3">
                                            {item.releaseDate && (
                                                <span className="text-sm text-gray-600 dark:text-gray-300 mr-4">
                                                    {new Date(item.releaseDate).getFullYear()}
                                                </span>
                                            )}

                                            {item.voteAverage > 0 && (
                                                <span className="flex items-center text-sm bg-blue-600 text-white px-2 py-1 rounded">
                                                    <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                                                    {item.voteAverage.toFixed(1)}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                            {item.overview || 'No overview available.'}
                                        </p>

                                        <div className="flex justify-between items-center">
                                            <Link
                                                to={`/movie/${item.movieId}`}
                                                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                            >
                                                View Details
                                            </Link>

                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                className="text-red-600 hover:text-red-700 flex items-center text-sm"
                                            >
                                                <TrashIcon className="h-4 w-4 mr-1" />
                                                Remove
                                            </button>
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

export default WatchlistPage;