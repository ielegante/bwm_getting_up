'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  File, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Tag,
  MoreHorizontal,
  Eye,
  Download,
  Star,
  CircleAlert,
  CircleCheck,
  CircleX
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { formatFileSize, formatDate, getFileTypeIcon } from '../utils/documentUtils';
import { DocumentWithSummary } from '../types';

interface DocumentListProps {
  documents?: DocumentWithSummary[];
  onSelectDocument: (document: DocumentWithSummary) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onSelectDocument }) => {
  const { documents: contextDocuments, markDocumentStatus } = useDocuments();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Use provided documents or get from context
  const displayDocuments = documents || contextDocuments;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Unread':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'Read':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Needs Second Look':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) {
      return <FileText className="h-6 w-6 text-indigo-500" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else if (type.includes('excel') || type.includes('spreadsheet')) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    } else if (type.includes('email') || type.includes('message')) {
      return <Mail className="h-6 w-6 text-yellow-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTagColor = (tag: string) => {
    const colors = {
      'Important': 'bg-blue-100 text-blue-800',
      'Needs Review': 'bg-yellow-100 text-yellow-800',
      'Key Evidence': 'bg-green-100 text-green-800',
      'Financial': 'bg-purple-100 text-purple-800',
      'Agreement': 'bg-indigo-100 text-indigo-800',
      'Correspondence': 'bg-orange-100 text-orange-800',
      'Contract': 'bg-teal-100 text-teal-800',
      'Email': 'bg-orange-100 text-orange-800',
      'Invoice': 'bg-teal-100 text-teal-800',
    };
    
    return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const toggleDropdown = (id: string) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  const handleClickOutside = () => {
    setActiveDropdown(null);
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleDocumentStatus = (
    id: string, 
    field: 'isRelevant' | 'isPrivileged' | 'isKey', 
    currentValue?: boolean
  ) => {
    markDocumentStatus(id, { [field]: !currentValue });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {displayDocuments.length === 0 ? (
          <li className="px-6 py-4 flex items-center justify-center">
            <p className="text-gray-500">No documents found</p>
          </li>
        ) : (
          displayDocuments.map((doc) => (
            <li key={doc.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1" onClick={() => onSelectDocument(doc)}>
                  <div className="flex-shrink-0">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">{doc.fileName}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getStatusIcon(doc.status)}
                        <span className="ml-1 text-xs text-gray-500">{doc.status}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>Uploaded: {formatDate(doc.uploadDate)}</span>
                      </div>
                      <span className="text-sm text-gray-500">{formatFileSize(doc.fileSize)}</span>
                    </div>
                    
                    {/* Document markers */}
                    <div className="mt-2 flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDocumentStatus(doc.id, 'isRelevant', doc.isRelevant);
                        }}
                        className={`p-1 rounded-full ${doc.isRelevant ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}
                        title={doc.isRelevant ? "Relevant" : "Not relevant"}
                      >
                        {doc.isRelevant ? <CircleCheck className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDocumentStatus(doc.id, 'isPrivileged', doc.isPrivileged);
                        }}
                        className={`p-1 rounded-full ${doc.isPrivileged ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'}`}
                        title={doc.isPrivileged ? "Privileged" : "Not privileged"}
                      >
                        <CircleAlert className="h-4 w-4" />
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDocumentStatus(doc.id, 'isKey', doc.isKey);
                        }}
                        className={`p-1 rounded-full ${doc.isKey ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}
                        title={doc.isKey ? "Key document" : "Not key"}
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Tags */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {doc.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0 relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(doc.id);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  
                  {activeDropdown === doc.id && (
                    <div 
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="py-1">
                        <button
                          onClick={() => onSelectDocument(doc)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Document
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default DocumentList; 