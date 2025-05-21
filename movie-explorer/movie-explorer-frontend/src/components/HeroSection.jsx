import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/movieService';

const HeroSection = ({ movie }) => {
    if (!movie) return null;

    return (
        <div className="relative">
            {/* Darker gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 opacity-90"></div>

            <div
                className="relative flex flex-col justify-end min-h-[500px] bg-cover bg-center p-6 md:p-12 lg:p-16"
                style={{
                    backgroundImage: `url(${getImageUrl(movie.backdrop_path || movie.poster_path, 'original')})`
                }}
            >
                <div className="max-w-7xl mx-auto w-full">
                    <div className="max-w-2xl">
                        {/* Add text-shadow to title for better readability */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-lg"
                            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                            {movie.title}
                        </h1>

                        <div className="flex items-center space-x-4 mb-4">
                            {movie.release_date && (
                                <span className="text-sm md:text-base text-white drop-shadow-md font-medium">
                                    {new Date(movie.release_date).getFullYear()}
                                </span>
                            )}

                            {movie.vote_average > 0 && (
                                <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm shadow-md">
                                    {movie.vote_average.toFixed(1)} Rating
                                </span>
                            )}
                        </div>

                        {/* Add background for overview text - removed line-clamp and expanded width */}
                        <div className="bg-black/30 p-3 rounded-md backdrop-blur-sm mb-6 max-w-xl">
                            <p className="text-sm md:text-base text-white font-medium drop-shadow-md"
                                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                {movie.overview?.length > 200
                                    ? `${movie.overview.substring(0, 200)}...`
                                    : movie.overview}
                            </p>
                        </div>

                        <Link
                            to={`/movie/${movie.id}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors shadow-md"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;