import React, { useState, useEffect } from 'react';
import { fetchTrendingMovies, getMoviesByCategory } from '../services/movieService';
import MovieGrid from '../components/MovieGrid';
import HeroSection from '../components/HeroSection';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);

                // Fetch all categories in parallel
                const [trending, popular, topRated, upcoming] = await Promise.all([
                    fetchTrendingMovies(),
                    getMoviesByCategory('popular'),
                    getMoviesByCategory('top_rated'),
                    getMoviesByCategory('upcoming')
                ]);

                setTrendingMovies(trending.results || []);
                setPopularMovies(popular.results || []);
                setTopRatedMovies(topRated.results || []);
                setUpcomingMovies(upcoming.results || []);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching movies:', err);
                setError('Failed to load movies. Please try again later.');
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

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

    // Select a random trending movie for the hero section
    const heroMovie = trendingMovies.length > 0
        ? trendingMovies[Math.floor(Math.random() * trendingMovies.length)]
        : null;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {heroMovie && <HeroSection movie={heroMovie} />}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Trending This Week</h2>
                    <MovieGrid movies={trendingMovies.slice(0, 12)} />
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Popular Movies</h2>
                    <MovieGrid movies={popularMovies.slice(0, 6)} />
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Top Rated</h2>
                    <MovieGrid movies={topRatedMovies.slice(0, 6)} />
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Coming Soon</h2>
                    <MovieGrid movies={upcomingMovies.slice(0, 6)} />
                </section>
            </div>
        </div>
    );
};

export default HomePage;