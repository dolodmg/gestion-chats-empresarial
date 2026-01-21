// src/components/chats/ChatSearchBar.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface ChatSearchBarProps {
    onSearch: (query: string) => void;
    onClear: () => void;
    isSearching: boolean;
}

export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
    onSearch,
    onClear,
    isSearching
}) => {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Trigger search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.trim().length > 0) {
            onSearch(debouncedQuery.trim());
        } else if (debouncedQuery.trim().length === 0 && query.length === 0) {
            onClear();
        }
    }, [debouncedQuery, onSearch, onClear]);

    const handleClear = useCallback(() => {
        setQuery('');
        setDebouncedQuery('');
        onClear();
    }, [onClear]);

    return (
        <div className="p-3 border-b border-gray-200 bg-white">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isSearching ? (
                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                        <Search className="h-5 w-5 text-gray-400" />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por nombre o teléfono..."
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
                {query.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>
        </div>
    );
};
