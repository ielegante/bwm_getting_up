'use client';

import React, { useState } from 'react';
import { Search, Upload, FileText } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  onUploadClick?: () => void;
  currentZipFile?: string | null;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onUploadClick, currentZipFile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { updateSearchFilters } = useDocuments();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    updateSearchFilters({ query: searchQuery });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                DocAnalyzer
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Upload button */}
          <div className="flex items-center space-x-4">
            {onUploadClick && (
              <button 
                onClick={onUploadClick}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload ZIP
              </button>
            )}

            {currentZipFile && (
              <span className="text-sm text-gray-500">
                Current: {currentZipFile.split('/').pop()}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 