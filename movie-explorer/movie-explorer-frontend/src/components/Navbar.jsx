import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    MagnifyingGlassIcon,
    UserCircleIcon,
    ClockIcon,
    HomeIcon,
    Bars3Icon,
    XMarkIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentUser, signInWithGoogle, logout } = useAuth();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMenuOpen(false);
        }
    };

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
            toast.success('Successfully signed in!');
        } catch (error) {
            console.error('Error signing in:', error);
            toast.error('Failed to sign in. Please try again.');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Successfully signed out');
        } catch (error) {
            console.error('Error signing out:', error);
            toast.error('Failed to sign out. Please try again.');
        }
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and main nav */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                MovieExplorer
                            </Link>
                        </div>

                        {/* Desktop Nav Links */}
                        <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                            <Link
                                to="/"
                                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                Home
                            </Link>
                            {currentUser && (
                                <>
                                    <Link
                                        to="/watchlist"
                                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        My Watchlist
                                    </Link>
                                    <Link
                                        to="/my-reviews"
                                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        My Reviews
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Search and User Menu */}
                    <div className="flex items-center">
                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="hidden md:block mr-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </form>

                        {/* User Menu */}
                        <div className="flex items-center">
                            {currentUser ? (
                                <div className="hidden sm:flex items-center space-x-4">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {currentUser.displayName || currentUser.email}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="hidden sm:block px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden ml-4">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? (
                                    <XMarkIcon className="block h-6 w-6" />
                                ) : (
                                    <Bars3Icon className="block h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-1">
                        <Link
                            to="/"
                            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <HomeIcon className="mr-3 h-6 w-6" />
                            Home
                        </Link>

                        {currentUser && (
                            <>
                                <Link
                                    to="/watchlist"
                                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <ClockIcon className="mr-3 h-6 w-6" />
                                    My Watchlist
                                </Link>
                                <Link
                                    to="/my-reviews"
                                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <StarIcon className="mr-3 h-6 w-6" />
                                    My Reviews
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile search */}
                    <form onSubmit={handleSearch} className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search movies..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </form>

                    {/* Mobile user menu */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {currentUser ? (
                            <div className="space-y-3">
                                <div className="flex items-center px-3 py-2">
                                    <UserCircleIcon className="mr-3 h-6 w-6 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                        {currentUser.displayName || currentUser.email}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="w-full flex justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Sign In with Google
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;