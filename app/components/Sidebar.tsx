'use client';

import React, { useState } from 'react';
import { 
  FolderOpen, 
  Tag, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Upload, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import UploadModal from './UploadModal';

interface SidebarProps {
  selectedFilters: {
    documentTypes: string[];
    tags: string[];
    status: string[];
  };
  onFilterChange: (filterType: string, value: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedFilters, onFilterChange }) => {
  const { tags } = useDocuments();
  const [expandedSections, setExpandedSections] = React.useState({
    documentTypes: true,
    tags: true,
    status: true,
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const documentTypes = [
    { id: 'pdf', name: 'PDF', icon: <FolderOpen className="h-4 w-4" /> },
    { id: 'word', name: 'Word', icon: <FolderOpen className="h-4 w-4" /> },
    { id: 'excel', name: 'Excel', icon: <FolderOpen className="h-4 w-4" /> },
    { id: 'email', name: 'Email', icon: <FolderOpen className="h-4 w-4" /> },
    { id: 'text', name: 'Text', icon: <FolderOpen className="h-4 w-4" /> },
  ];

  const statusFilters = [
    { id: 'Unread', name: 'Unread', icon: <Clock className="h-4 w-4" /> },
    { id: 'In Progress', name: 'In Progress', icon: <Clock className="h-4 w-4" /> },
    { id: 'Reviewed', name: 'Reviewed', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'Needs Second Look', name: 'Needs Second Look', icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <button 
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Quick Access
          </h3>
          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-900 bg-gray-100"
            >
              <FolderOpen className="h-5 w-5 text-gray-500 mr-2" />
              All Documents
            </a>
            <a
              href="#"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              Recent
            </a>
            <a
              href="#"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <Tag className="h-5 w-5 text-gray-500 mr-2" />
              Tagged
            </a>
          </nav>
        </div>

        <div className="mb-4">
          <div 
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => toggleSection('documentTypes')}
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Document Types
            </h3>
            {expandedSections.documentTypes ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>
          {expandedSections.documentTypes && (
            <div className="space-y-1">
              {documentTypes.map((type) => (
                <div key={type.id} className="flex items-center">
                  <input
                    id={`type-${type.id}`}
                    name={`type-${type.id}`}
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={selectedFilters.documentTypes.includes(type.id)}
                    onChange={() => onFilterChange('documentTypes', type.id)}
                  />
                  <label
                    htmlFor={`type-${type.id}`}
                    className="ml-2 flex items-center text-sm text-gray-700"
                  >
                    {type.icon}
                    <span className="ml-2">{type.name}</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <div 
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => toggleSection('tags')}
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tags
            </h3>
            {expandedSections.tags ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>
          {expandedSections.tags && (
            <div className="space-y-1">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center">
                  <input
                    id={`tag-${tag}`}
                    name={`tag-${tag}`}
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={selectedFilters.tags.includes(tag)}
                    onChange={() => onFilterChange('tags', tag)}
                  />
                  <label
                    htmlFor={`tag-${tag}`}
                    className="ml-2 flex items-center text-sm text-gray-700"
                  >
                    <Tag className="h-4 w-4" />
                    <span className="ml-2">{tag}</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <div 
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => toggleSection('status')}
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </h3>
            {expandedSections.status ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>
          {expandedSections.status && (
            <div className="space-y-1">
              {statusFilters.map((status) => (
                <div key={status.id} className="flex items-center">
                  <input
                    id={`status-${status.id}`}
                    name={`status-${status.id}`}
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={selectedFilters.status.includes(status.id)}
                    onChange={() => onFilterChange('status', status.id)}
                  />
                  <label
                    htmlFor={`status-${status.id}`}
                    className="ml-2 flex items-center text-sm text-gray-700"
                  >
                    {status.icon}
                    <span className="ml-2">{status.name}</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </aside>
  );
};

export default Sidebar; 