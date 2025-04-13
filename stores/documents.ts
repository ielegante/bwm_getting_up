import { defineStore } from 'pinia';

// Define the types inline to avoid import issues
interface Document {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  fileSize: number;
  tags: string[];
  status: 'Unread' | 'Read' | 'Needs Second Look' | 'Reviewed';
  isRelevant?: boolean;
  isPrivileged?: boolean;
  isKey?: boolean;
  annotations: {
    id: string;
    documentId: string;
    text: string;
    createdAt: string;
    pageNumber: number;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[];
  sourceZipFile?: string;
}

interface DocumentWithSummary extends Document {
  summary?: string;
  keyPoints?: string[];
  entities?: {
    people: string[];
    organizations: string[];
    dates: string[];
    locations: string[];
  };
  relatedDocuments?: string[]; // IDs of related documents
}

interface DocumentRelationship {
  sourceId: string;
  targetId: string;
  relationshipType: 'referenced' | 'similar' | 'sequential' | 'mentioned';
  strength: number; // 0-1 indicating relationship strength
}

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [] as DocumentWithSummary[],
    currentDocument: null as DocumentWithSummary | null,
    relationships: [] as DocumentRelationship[],
    currentZipFile: null as string | null,
  }),
  
  getters: {
    documentCount: (state) => state.documents.length,
    
    hasDocuments: (state) => state.documents.length > 0,
    
    documentById: (state) => (id: string) => {
      return state.documents.find(doc => doc.id === id) || null;
    },
    
    relationshipsForDocument: (state) => (documentId: string) => {
      return state.relationships.filter(rel => 
        rel.sourceId === documentId || rel.targetId === documentId
      );
    },
    
    relatedDocuments: (state) => (documentId: string) => {
      const relationships = state.relationships.filter(rel => 
        rel.sourceId === documentId || rel.targetId === documentId
      );
      
      return state.documents.filter(doc => 
        relationships.some(rel => 
          (rel.sourceId === documentId && rel.targetId === doc.id) ||
          (rel.targetId === documentId && rel.sourceId === doc.id)
        )
      );
    }
  },
  
  actions: {
    addDocument(document: DocumentWithSummary) {
      // Check if document already exists
      const existingIndex = this.documents.findIndex(doc => doc.id === document.id);
      if (existingIndex >= 0) {
        // Update instead of adding
        this.documents[existingIndex] = { ...this.documents[existingIndex], ...document };
      } else {
        this.documents.push(document);
      }
    },
    
    updateDocument(documentId: string, updates: Partial<DocumentWithSummary>) {
      const index = this.documents.findIndex(doc => doc.id === documentId);
      if (index >= 0) {
        this.documents[index] = { ...this.documents[index], ...updates };
        
        // If current document is being updated, update it too
        if (this.currentDocument && this.currentDocument.id === documentId) {
          this.currentDocument = { ...this.currentDocument, ...updates };
        }
      }
    },
    
    deleteDocument(documentId: string) {
      this.documents = this.documents.filter(doc => doc.id !== documentId);
      
      // Also remove relationships
      this.relationships = this.relationships.filter(rel => 
        rel.sourceId !== documentId && rel.targetId !== documentId
      );
      
      // Clear current document if it was deleted
      if (this.currentDocument && this.currentDocument.id === documentId) {
        this.currentDocument = null;
      }
    },
    
    setCurrentDocument(document: DocumentWithSummary | null) {
      this.currentDocument = document;
    },
    
    addRelationship(relationship: DocumentRelationship) {
      // Check if relationship already exists
      const existingIndex = this.relationships.findIndex(rel => 
        rel.sourceId === relationship.sourceId && 
        rel.targetId === relationship.targetId &&
        rel.relationshipType === relationship.relationshipType
      );
      
      if (existingIndex >= 0) {
        // Update instead of adding
        this.relationships[existingIndex] = { 
          ...this.relationships[existingIndex], 
          ...relationship 
        };
      } else {
        this.relationships.push(relationship);
      }
    },
    
    clearDocuments() {
      this.documents = [];
      this.relationships = [];
      this.currentDocument = null;
    },
    
    setCurrentZipFile(fileName: string | null) {
      this.currentZipFile = fileName;
    },
    
    markDocumentStatus(documentId: string, status: Partial<Pick<Document, 'isRelevant' | 'isPrivileged' | 'isKey' | 'status'>>) {
      this.updateDocument(documentId, status);
    }
  }
}); 