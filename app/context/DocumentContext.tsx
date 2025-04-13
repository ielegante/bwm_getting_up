'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Document, SearchFilters, DocumentRelationship, DocumentWithSummary } from '../types';

interface DocumentContextType {
  documents: DocumentWithSummary[];
  currentDocument: DocumentWithSummary | null;
  searchFilters: SearchFilters;
  tags: string[];
  relationships: DocumentRelationship[];
  currentZipFile: string | null;
  addDocument: (document: DocumentWithSummary) => void;
  updateDocument: (document: DocumentWithSummary) => void;
  deleteDocument: (id: string) => void;
  setCurrentDocument: (document: DocumentWithSummary | null) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  addRelationship: (relationship: DocumentRelationship) => void;
  setCurrentZipFile: (zipFileName: string | null) => void;
  getRelatedDocuments: (documentId: string) => string[];
  markDocumentStatus: (id: string, status: { isRelevant?: boolean, isPrivileged?: boolean, isKey?: boolean }) => void;
  clearDocuments: () => void;
}

const defaultSearchFilters: SearchFilters = {
  query: '',
  documentTypes: [],
  tags: [],
  status: [],
};

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<DocumentWithSummary[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentWithSummary | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultSearchFilters);
  const [relationships, setRelationships] = useState<DocumentRelationship[]>([]);
  const [currentZipFile, setCurrentZipFile] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([
    'Important',
    'Needs Review',
    'Key Evidence',
    'Financial',
    'Agreement',
    'Correspondence'
  ]);

  const addDocument = (document: DocumentWithSummary) => {
    setDocuments(prev => [...prev, document]);
  };

  const updateDocument = (updatedDocument: DocumentWithSummary) => {
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

  const addRelationship = (relationship: DocumentRelationship) => {
    setRelationships(prev => [...prev, relationship]);
  };

  const getRelatedDocuments = (documentId: string): string[] => {
    return relationships
      .filter(rel => rel.sourceId === documentId || rel.targetId === documentId)
      .map(rel => rel.sourceId === documentId ? rel.targetId : rel.sourceId);
  };

  const markDocumentStatus = (id: string, status: { isRelevant?: boolean, isPrivileged?: boolean, isKey?: boolean }) => {
    setDocuments(prev => 
      prev.map(doc => doc.id === id ? { ...doc, ...status } : doc)
    );
    
    if (currentDocument?.id === id) {
      setCurrentDocument(prev => prev ? { ...prev, ...status } : null);
    }
  };

  const clearDocuments = () => {
    setDocuments([]);
    setCurrentDocument(null);
  };

  const value = {
    documents,
    currentDocument,
    searchFilters,
    tags,
    relationships,
    currentZipFile,
    addDocument,
    updateDocument,
    deleteDocument,
    setCurrentDocument,
    addTag,
    removeTag,
    updateSearchFilters,
    addRelationship,
    setCurrentZipFile,
    getRelatedDocuments,
    markDocumentStatus,
    clearDocuments,
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