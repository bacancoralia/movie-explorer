import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../services/movieService';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await searchMovies(query);
                setResults(data.results || []);
                setTotalResults(data.total_results || 0);
                setLoading(false);
            } catch (err) {
                console.error('Error searching movies:', err);
                setError('Failed to search movies. Please try again later.');
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
                    <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Search Results: {query}
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {totalResults} results found
                        </p>
                    </div>

                    <div className="p-4 md:p-6">
                        {error ? (
                            <div className="text-center py-8">
                                <p className="text-red-500 text-lg mb-4">{error}</p>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400 mb-2">No results found for "{query}"</p>
                                <p className="text-gray-500 dark:text-gray-400">Try a different search term</p>
                            </div>
                        ) : (
                            <MovieGrid movies={results} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;