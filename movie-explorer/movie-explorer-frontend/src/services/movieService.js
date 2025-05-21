import axios from 'axios';

// Use Vite environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch trending movies
 * @returns {Promise<Object>} - List of trending movies
 */
export const fetchTrendingMovies = async () => {
    try {
        const response = await axios.get(`${API_URL}/movies/trending`);
        return response.data;
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        throw new Error('Failed to fetch trending movies');
    }
};

/**
 * Search for movies by query
 * @param {string} query - Search query
 * @returns {Promise<Object>} - Search results
 */
export const searchMovies = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/movies/search`, {
            params: { query }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching movies:', error);
        throw new Error('Failed to search movies');
    }
};

/**
 * Get detailed information for a specific movie
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<Object>} - Movie details
 */
export const getMovieDetails = async (movieId) => {
    try {
        const response = await axios.get(`${API_URL}/movies/${movieId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        throw new Error('Failed to fetch movie details');
    }
};

/**
 * Get movies by category (popular, top_rated, upcoming, now_playing)
 * @param {string} category - Category of movies
 * @returns {Promise<Object>} - List of movies in category
 */
export const getMoviesByCategory = async (category) => {
    try {
        const response = await axios.get(`${API_URL}/movies/category/${category}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${category} movies:`, error);
        throw new Error(`Failed to fetch ${category} movies`);
    }
};

/**
 * Get image URL for TMDB images
 * @param {string} path - Image path from TMDB
 * @param {string} size - Size of image (w500, original, etc.)
 * @returns {string} - Complete image URL
 */
export const getImageUrl = (path, size = 'w500') => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
};