import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useParams } from 'react-router-dom';
import { getMovieDetails, getImageUrl } from '../services/movieService';
import { useAuth } from '../contexts/AuthContext';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../services/watchlistService';
import { getMovieReviews } from '../services/reviewService';
import { StarIcon, ClockIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';
import MovieGrid from '../components/MovieGrid';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';
import toast from 'react-hot-toast';

const MovieDetailsPage = () => {
    const { movieId } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [watchlistDocId, setWatchlistDocId] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const { currentUser } = useAuth();

    // Function to refresh only the reviews section - MOVED INSIDE & MODIFIED
    const refreshReviews = useCallback(async () => {
        if (!movieId) {
            console.warn("refreshReviews called without movieId.");
            return;
        }
        setReviewsLoading(true);
        try {
            const reviewsData = await getMovieReviews(movieId);
            setReviews(reviewsData || []);
            // Optional: toast.success("Reviews updated!");
        } catch (error) {
            console.error('Error refreshing reviews:', error);
            toast.error('Could not refresh reviews. Please try again.');
        } finally {
            setReviewsLoading(false);
        }
    }, [movieId]); // Dependencies for useCallback. getMovieReviews, setReviewsLoading, setReviews, toast are stable.

    // Fetch movie details
    useEffect(() => {
        const fetchMovieData = async () => {
            if (!movieId) return;
            try {
                setLoading(true);
                setError(null); // Clear previous errors
                const data = await getMovieDetails(movieId);
                setMovie(data);

                if (currentUser && data) {
                    const watchlistItem = await isInWatchlist(currentUser.uid, parseInt(data.id, 10));
                    if (watchlistItem) {
                        setInWatchlist(true);
                        setWatchlistDocId(watchlistItem.id);
                    } else {
                        setInWatchlist(false);
                        setWatchlistDocId(null);
                    }
                }
            } catch (err) {
                console.error('Error fetching movie details:', err);
                setError('Failed to load movie details. Please try again later.');
                setMovie(null); // Clear movie data on error
            } finally {
                setLoading(false);
            }
        };

        fetchMovieData();
    }, [movieId, currentUser]);

    // Fetch movie reviews (initial load)
    useEffect(() => {
        const fetchInitialReviews = async () => {
            if (!movieId) return;
            setReviewsLoading(true);
            try {
                const reviewsData = await getMovieReviews(movieId);
                setReviews(reviewsData || []);
            } catch (err) {
                console.error('Error fetching initial reviews:', err);
                toast.error('Failed to load reviews.');
                setReviews([]);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchInitialReviews();
    }, [movieId]);


    const handleWatchlistToggle = async () => {
        if (!currentUser) {
            toast.error('Please sign in to add movies to your watchlist');
            return;
        }
        if (!movie) {
            toast.error('Movie data is not available yet.');
            return;
        }

        try {
            if (inWatchlist && watchlistDocId) {
                await removeFromWatchlist(watchlistDocId);
                setInWatchlist(false);
                setWatchlistDocId(null);
                toast.success(`"${movie.title}" removed from watchlist`);
            } else {
                const docId = await addToWatchlist(currentUser.uid, movie);
                setInWatchlist(true);
                setWatchlistDocId(docId);
                toast.success(`"${movie.title}" added to watchlist`);
            }
        } catch (err) {
            console.error('Error updating watchlist:', err);
            toast.error(err.message || 'Failed to update watchlist');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 text-lg">{error}</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => {
                        // A more React-way to retry would be to re-trigger the useEffects,
                        // e.g., by clearing movieId and setting it again, or having a retry state.
                        // For simplicity, window.location.reload() is kept from original.
                        window.location.reload();
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!movie) { // If not loading, no error, but movie is null (e.g. invalid movieId)
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 text-lg">Movie not found.</p>
            </div>
        );
    }


    const formatRuntime = (minutes) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    const director = movie.credits?.crew?.find(person => person.job === 'Director');
    const topCast = movie.credits?.cast?.slice(0, 6) || [];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Backdrop */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-90"></div>
                <div
                    className="relative flex flex-col justify-end min-h-[500px] bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${getImageUrl(movie.backdrop_path || movie.poster_path, 'original')})`
                    }}
                >
                </div>
            </div>

            {/* Movie details */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:space-x-8 -mt-32 relative z-10 mb-12">
                    {/* Poster */}
                    <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 mb-6 md:mb-0">
                        {movie.poster_path ? (
                            <img
                                src={getImageUrl(movie.poster_path)}
                                alt={movie.title}
                                className="rounded-lg shadow-xl w-full"
                            />
                        ) : (
                            <div className="rounded-lg bg-gray-300 dark:bg-gray-700 h-96 w-full flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-400">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="md:w-2/3 lg:w-3/4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {movie.title}
                        </h1>

                        {movie.tagline && (
                            <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                                "{movie.tagline}"
                            </p>
                        )}

                        <div className="flex flex-wrap items-center space-x-4 mb-6">
                            {movie.release_date && (
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {new Date(movie.release_date).getFullYear()}
                                </span>
                            )}

                            {movie.runtime > 0 && (
                                <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    {formatRuntime(movie.runtime)}
                                </span>
                            )}

                            {movie.vote_average > 0 && (
                                <span className="flex items-center text-sm bg-blue-600 text-white px-2 py-1 rounded">
                                    <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                                    {movie.vote_average.toFixed(1)}
                                </span>
                            )}
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Overview</h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                {movie.overview || 'No overview available.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {movie.genres && movie.genres.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Genres</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genres.map(genre => (
                                            <span
                                                key={genre.id}
                                                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {director && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Director</h2>
                                    <p className="text-gray-700 dark:text-gray-300">{director.name}</p>
                                </div>
                            )}
                        </div>

                        {topCast.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Top Cast</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {topCast.map(person => (
                                        <div key={person.id} className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {person.profile_path ? (
                                                    <img
                                                        src={getImageUrl(person.profile_path, 'w200')}
                                                        alt={person.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {person.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {person.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {person.character}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                            <button
                                onClick={handleWatchlistToggle}
                                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${inWatchlist
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {inWatchlist ? (
                                    <>
                                        <CheckIcon className="h-5 w-5 mr-2" />
                                        In Watchlist
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Add to Watchlist
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {movie.similar?.results?.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                            Similar Movies
                        </h2>
                        <MovieGrid movies={movie.similar.results.slice(0, 6)} />
                    </section>
                )}

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                        Reviews
                    </h2>

                    {currentUser ? (
                        <ReviewForm
                            movieId={movieId}
                            movieTitle={movie.title}
                            posterPath={movie.poster_path}
                            onReviewSubmitted={refreshReviews}
                        />
                    ) : (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6 text-center">
                            <p className="text-gray-700 dark:text-gray-300">
                                Please sign in to leave a review.
                            </p>
                        </div>
                    )}

                    <div className="mt-8">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                            {reviews.length > 0 ? `${reviews.length} Review${reviews.length === 1 ? '' : 's'}` : 'No Reviews Yet'}
                        </h3>

                        {reviewsLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <ReviewsList reviews={reviews} />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MovieDetailsPage;