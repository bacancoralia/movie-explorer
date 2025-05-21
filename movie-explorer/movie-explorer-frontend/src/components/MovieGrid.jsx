import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/movieService';
import { StarIcon } from '@heroicons/react/24/solid';

const MovieGrid = ({ movies }) => {
    if (!movies || movies.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No movies found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {movies.map((movie) => (
                <Link
                    to={`/movie/${movie.id}`}
                    key={movie.id}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                    <div className="relative pb-[150%]">
                        {movie.poster_path ? (
                            <img
                                src={getImageUrl(movie.poster_path)}
                                alt={movie.title}
                                className="absolute top-0 left-0 w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="absolute top-0 left-0 w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-400">No Image</span>
                            </div>
                        )}
                        {movie.vote_average > 0 && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center">
                                <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                                {movie.vote_average.toFixed(1)}
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex-grow">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {movie.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default MovieGrid;