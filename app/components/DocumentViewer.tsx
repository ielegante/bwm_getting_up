'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  X, 
  Download,
  Tag as TagIcon,
  Edit,
  MessageSquare,
  FileText,
  User,
  Clock,
  Menu,
  MoreHorizontal,
  CircleCheck,
  CircleAlert,
  Star
} from 'lucide-react';
import { DocumentWithSummary } from '../types';
import { useDocuments } from '../context/DocumentContext';
import { formatDate } from '../utils/documentUtils';

interface DocumentViewerProps {
  document: DocumentWithSummary | null;
  onClose: () => void;
  relatedDocuments?: DocumentWithSummary[];
  onSelectRelatedDocument?: (documentId: string) => void;
  onMarkDocument?: (field: 'isRelevant' | 'isPrivileged' | 'isKey', value: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  onClose,
  relatedDocuments = [],
  onSelectRelatedDocument,
  onMarkDocument
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'annotations' | 'summary' | 'related'>('info');
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    text: '',
  });
  const { updateDocument } = useDocuments();

  if (!document) {
    return null;
  }

  const totalPages = 10; // This would come from the actual document

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const addAnnotation = () => {
    if (newAnnotation.text.trim() === '') return;

    const annotation = {
      id: Math.random().toString(36).substring(2, 11),
      documentId: document.id,
      text: newAnnotation.text,
      createdAt: new Date().toISOString(),
      pageNumber: currentPage,
      position: {
        x: 100, // This would be the actual position where the user clicked
        y: 200,
        width: 200,
        height: 50,
      }
    };

    const updatedDocument = {
      ...document,
      annotations: [...document.annotations, annotation],
    };

    updateDocument(updatedDocument);
    setNewAnnotation({ text: '' });
    setShowAnnotationForm(false);
  };

  const pageAnnotations = document.annotations.filter(
    (a) => a.pageNumber === currentPage
  );
  
  const handleToggleDocumentStatus = (field: 'isRelevant' | 'isPrivileged' | 'isKey') => {
    if (onMarkDocument) {
      onMarkDocument(field, !(document as any)[field]);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex">
      <div className="bg-white w-full h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-100 p-2 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-200"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-700 truncate max-w-md">
              {document.fileName}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Document status markers */}
            <div className="flex items-center space-x-2 mr-4">
              <button 
                onClick={() => handleToggleDocumentStatus('isRelevant')}
                className={`p-1 rounded-full ${document.isRelevant ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}
                title={document.isRelevant ? "Mark as not relevant" : "Mark as relevant"}
              >
                <CircleCheck className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => handleToggleDocumentStatus('isPrivileged')}
                className={`p-1 rounded-full ${document.isPrivileged ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'}`}
                title={document.isPrivileged ? "Mark as not privileged" : "Mark as privileged"}
              >
                <CircleAlert className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => handleToggleDocumentStatus('isKey')}
                className={`p-1 rounded-full ${document.isKey ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}
                title={document.isKey ? "Mark as not key" : "Mark as key"}
              >
                <Star className="h-5 w-5" />
              </button>
            </div>
          
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`p-1 rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-1 rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className={`p-1 rounded-md ${
                  zoom <= 0.5
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-700">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 2}
                className={`p-1 rounded-md ${
                  zoom >= 2
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-200 text-gray-700"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button className="p-1 rounded-md hover:bg-gray-200 text-gray-700">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Document display area */}
          <div className="flex-1 relative bg-gray-100 overflow-auto p-4">
            <div
              className="flex justify-center min-h-full"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Document content would go here */}
              <div className="bg-white shadow-lg w-[850px] h-[1100px] relative">
                {/* This is a placeholder for the actual document content */}
                <div className="absolute inset-0 p-10">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h1 className="text-2xl font-bold">{document.fileName}</h1>
                    <p className="text-gray-500 mt-1">Page {currentPage}</p>
                  </div>
                  
                  {/* Placeholder document content */}
                  <div className="prose max-w-none">
                    {document.summary && (
                      <div className="mb-6">
                        <p>{document.summary}</p>
                      </div>
                    )}
                    
                    <p className="mb-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in
                      eros et justo vehicula mollis. Nunc ut magna id est rhoncus
                      convallis. Etiam quis feugiat justo.
                    </p>
                    
                    <p className="mb-4">
                      Nullam lacinia dui non aliquam placerat. Donec quis efficitur
                      odio. Nulla blandit neque non arcu vestibulum commodo. Mauris
                      porttitor nisi vel varius porta.
                    </p>
                    
                    <p className="mb-4">
                      Morbi suscipit orci eu eros egestas, vitae rutrum eros
                      scelerisque. Sed id mi vitae lacus semper viverra. Quisque
                      faucibus ipsum ut ultrices commodo.
                    </p>
                  </div>
                </div>

                {/* Annotations */}
                {pageAnnotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="absolute bg-yellow-100 border border-yellow-300 p-2 rounded shadow-sm"
                    style={{
                      left: `${annotation.position.x}px`,
                      top: `${annotation.position.y}px`,
                      width: `${annotation.position.width}px`,
                      minHeight: `${annotation.position.height}px`,
                    }}
                  >
                    <div className="text-sm text-gray-800">{annotation.text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(annotation.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {sidebarOpen && (
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex divide-x divide-gray-200">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-3 px-1 text-center text-sm font-medium ${
                      activeTab === 'info'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Info
                  </button>
                  <button
                    onClick={() => setActiveTab('annotations')}
                    className={`flex-1 py-3 px-1 text-center text-sm font-medium ${
                      activeTab === 'annotations'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 py-3 px-1 text-center text-sm font-medium ${
                      activeTab === 'summary'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('related')}
                    className={`flex-1 py-3 px-1 text-center text-sm font-medium ${
                      activeTab === 'related'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Related
                  </button>
                </nav>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {activeTab === 'info' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Document Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          File Name
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {document.fileName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          File Type
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {document.fileType}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Upload Date
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(document.uploadDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          File Size
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {document.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tags</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {document.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'annotations' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                      <button
                        onClick={() => setShowAnnotationForm(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        + Add Note
                      </button>
                    </div>

                    {showAnnotationForm && (
                      <div className="mb-4 bg-gray-50 p-3 rounded-md">
                        <textarea
                          value={newAnnotation.text}
                          onChange={(e) =>
                            setNewAnnotation({
                              ...newAnnotation,
                              text: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Add your note here..."
                          rows={3}
                        ></textarea>
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            onClick={() => setShowAnnotationForm(false)}
                            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={addAnnotation}
                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {document.annotations.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No notes have been added yet.
                        </p>
                      ) : (
                        document.annotations.map((annotation) => (
                          <div
                            key={annotation.id}
                            className="bg-yellow-50 p-3 rounded-md border border-yellow-100"
                          >
                            <p className="text-sm text-gray-800">
                              {annotation.text}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-gray-500">
                                Page {annotation.pageNumber}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(annotation.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'summary' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Document Summary
                    </h3>
                    
                    {document.summary ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Summary
                          </p>
                          <p className="text-sm text-gray-900">
                            {document.summary}
                          </p>
                        </div>
                        
                        {document.keyPoints && document.keyPoints.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Key Points
                            </p>
                            <ul className="list-disc pl-5 text-sm text-gray-900 space-y-1">
                              {document.keyPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {document.entities && (
                          <>
                            {document.entities.people.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                  People
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {document.entities.people.map((person, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      <User className="h-3 w-3 mr-1" />
                                      {person}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {document.entities.organizations.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                  Organizations
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {document.entities.organizations.map((org, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                    >
                                      {org}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {document.entities.dates.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                  Dates
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {document.entities.dates.map((date, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      {date}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No summary information available.
                      </p>
                    )}
                  </div>
                )}
                
                {activeTab === 'related' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Related Documents
                    </h3>
                    
                    {relatedDocuments.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No related documents found.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {relatedDocuments.map((relatedDoc) => (
                          <div
                            key={relatedDoc.id}
                            className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => onSelectRelatedDocument && onSelectRelatedDocument(relatedDoc.id)}
                          >
                            <div className="flex items-start">
                              <FileText className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-indigo-600">
                                  {relatedDoc.fileName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(relatedDoc.uploadDate)}
                                </p>
                                {relatedDoc.summary && (
                                  <p className="text-xs text-gray-700 mt-2 line-clamp-2">
                                    {relatedDoc.summary}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer; 