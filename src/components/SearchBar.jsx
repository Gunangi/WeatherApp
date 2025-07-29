// src/components/SearchBar.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (searchTerm) => {
        const cityToSearch = searchTerm || query;
        if (!cityToSearch.trim()) return;

        setIsLoading(true);
        try {
            await onSearch(cityToSearch.trim());
            setQuery('');
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <div className="max-w-lg mx-auto mb-8">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a city..."
                    className="w-full px-6 py-4 text-lg bg-white dark:bg-gray-800 border-2 border-transparent rounded-full shadow-lg focus:border-blue-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 pr-16"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Search size={20} />
                    )}
                </button>
            </form>
        </div>
    );
};

export default SearchBar;
