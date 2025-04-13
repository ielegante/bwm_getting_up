import { defineStore } from 'pinia';

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [],
    currentDocument: null,
    relationships: [],
    currentZipFile: null,
    tags: [
      'Important',
      'Needs Review',
      'Key Evidence',
      'Financial',
      'Agreement',
      'Correspondence'
    ]
  }),
  
  actions: {
    addDocument(document) {
      this.documents.push(document);
    },
    
    updateDocument(updatedDocument) {
      const index = this.documents.findIndex(doc => doc.id === updatedDocument.id);
      if (index !== -1) {
        this.documents[index] = updatedDocument;
        if (this.currentDocument?.id === updatedDocument.id) {
          this.currentDocument = updatedDocument;
        }
      }
    },
    
    deleteDocument(id) {
      this.documents = this.documents.filter(doc => doc.id !== id);
      if (this.currentDocument?.id === id) {
        this.currentDocument = null;
      }
    },
    
    setCurrentDocument(document) {
      this.currentDocument = document;
    },
    
    addTag(tag) {
      if (!this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    },
    
    removeTag(tag) {
      this.tags = this.tags.filter(t => t !== tag);
    },
    
    addRelationship(relationship) {
      this.relationships.push(relationship);
    },
    
    setCurrentZipFile(zipFileName) {
      console.log(`[Store] Setting currentZipFile from ${this.currentZipFile} to ${zipFileName}`);
      this.currentZipFile = zipFileName;
    },
    
    getRelatedDocuments(documentId) {
      return this.relationships
        .filter(rel => rel.sourceId === documentId || rel.targetId === documentId)
        .map(rel => rel.sourceId === documentId ? rel.targetId : rel.sourceId);
    },
    
    markDocumentStatus(id, status) {
      const index = this.documents.findIndex(doc => doc.id === id);
      if (index !== -1) {
        this.documents[index] = { ...this.documents[index], ...status };
        
        if (this.currentDocument?.id === id) {
          this.currentDocument = { ...this.currentDocument, ...status };
        }
      }
    },
    
    clearDocuments() {
      this.documents = [];
      this.currentDocument = null;
      this.relationships = [];
    }
  }
}); 