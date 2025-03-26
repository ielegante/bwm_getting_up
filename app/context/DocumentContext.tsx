'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Document, SearchFilters } from '../types';

interface DocumentContextType {
  documents: Document[];
  currentDocument: Document | null;
  searchFilters: SearchFilters;
  tags: string[];
  addDocument: (document: Document) => void;
  updateDocument: (document: Document) => void;
  deleteDocument: (id: string) => void;
  setCurrentDocument: (document: Document | null) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
}

const defaultSearchFilters: SearchFilters = {
  query: '',
  documentTypes: [],
  tags: [],
  status: [],
  uploadedBy: [],
};

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultSearchFilters);
  const [tags, setTags] = useState<string[]>([
    'Relevant',
    'Privileged',
    'Key Evidence',
    'To Produce',
    'Financial Records',
    'Witness Smith'
  ]);

  const addDocument = (document: Document) => {
    setDocuments(prev => [...prev, document]);
  };

  const updateDocument = (updatedDocument: Document) => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === updatedDocument.id ? updatedDocument : doc))
    );
    if (currentDocument?.id === updatedDocument.id) {
      setCurrentDocument(updatedDocument);
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (currentDocument?.id === id) {
      setCurrentDocument(null);
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const updateSearchFilters = (filters: Partial<SearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  };

  const value = {
    documents,
    currentDocument,
    searchFilters,
    tags,
    addDocument,
    updateDocument,
    deleteDocument,
    setCurrentDocument,
    addTag,
    removeTag,
    updateSearchFilters,
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}; 