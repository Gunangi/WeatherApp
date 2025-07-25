// src/components/SearchBar.jsx

import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
            setQuery('');
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center w-full max-w-lg mx-auto">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a city..."
                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            />
            <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <Search size={20} />
            </button>
        </form>
    );
};

export default SearchBar;
