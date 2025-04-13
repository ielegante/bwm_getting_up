// In-memory storage for documents and relationships
import { DocumentWithSummary, DocumentRelationship } from '../types';
import { generateId } from './documentUtils';

// In-memory storage
let documents: DocumentWithSummary[] = [];
let relationships: DocumentRelationship[] = [];
let zipFiles: { id: string, fileName: string, documentCount: number, uploadDate: string }[] = [];

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Optional localStorage backup
const STORAGE_KEYS = {
  DOCUMENTS: 'docanalyzer_documents',
  RELATIONSHIPS: 'docanalyzer_relationships',
  ZIP_FILES: 'docanalyzer_zipfiles'
};

// Initialize from localStorage if available
const initFromStorage = () => {
  if (!isBrowser) return;
  
  try {
    const storedDocuments = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    const storedRelationships = localStorage.getItem(STORAGE_KEYS.RELATIONSHIPS);
    const storedZipFiles = localStorage.getItem(STORAGE_KEYS.ZIP_FILES);
    
    if (storedDocuments) documents = JSON.parse(storedDocuments);
    if (storedRelationships) relationships = JSON.parse(storedRelationships);
    if (storedZipFiles) zipFiles = JSON.parse(storedZipFiles);
    
    console.log('Loaded from localStorage:', {
      documents: documents.length,
      relationships: relationships.length,
      zipFiles: zipFiles.length
    });
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    // If localStorage fails, start with empty arrays
    documents = [];
    relationships = [];
    zipFiles = [];
  }
};

// Initialize storage on module load
if (isBrowser) {
  initFromStorage();
}

// Save to localStorage for persistence between page refreshes
const saveToStorage = () => {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(relationships));
    localStorage.setItem(STORAGE_KEYS.ZIP_FILES, JSON.stringify(zipFiles));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Document functions
export const getAllDocuments = async (): Promise<DocumentWithSummary[]> => {
  return [...documents];
};

export const getDocumentsByZipFile = async (zipFileName: string): Promise<DocumentWithSummary[]> => {
  return documents.filter(doc => doc.sourceZipFile === zipFileName);
};

export const saveDocuments = async (newDocuments: DocumentWithSummary[]): Promise<void> => {
  // Add or update documents
  newDocuments.forEach(newDoc => {
    const existingIndex = documents.findIndex(doc => doc.id === newDoc.id);
    if (existingIndex >= 0) {
      documents[existingIndex] = newDoc;
    } else {
      documents.push(newDoc);
    }
  });
  
  saveToStorage();
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  documents = documents.filter(doc => doc.id !== documentId);
  saveToStorage();
};

// Relationship functions
export const getAllRelationships = async (): Promise<DocumentRelationship[]> => {
  return [...relationships];
};

export const getRelationshipsByDocument = async (documentId: string): Promise<DocumentRelationship[]> => {
  return relationships.filter(rel => 
    rel.sourceId === documentId || rel.targetId === documentId
  );
};

export const saveRelationships = async (newRelationships: DocumentRelationship[]): Promise<void> => {
  // Add or update relationships
  newRelationships.forEach(newRel => {
    const existingIndex = relationships.findIndex(rel => 
      rel.sourceId === newRel.sourceId && rel.targetId === newRel.targetId
    );
    
    if (existingIndex >= 0) {
      relationships[existingIndex] = newRel;
    } else {
      relationships.push(newRel);
    }
  });
  
  saveToStorage();
};

export const deleteRelationship = async (sourceId: string, targetId: string): Promise<void> => {
  relationships = relationships.filter(rel => 
    !(rel.sourceId === sourceId && rel.targetId === targetId)
  );
  
  saveToStorage();
};

// Zip file metadata functions
export const getAllZipFiles = async (): Promise<{id: string, fileName: string, documentCount: number, uploadDate: string}[]> => {
  return [...zipFiles];
};

export const saveZipFileMetadata = async (zipFile: {id: string, fileName: string, documentCount: number, uploadDate: string}): Promise<void> => {
  const existingIndex = zipFiles.findIndex(zf => zf.id === zipFile.id);
  if (existingIndex >= 0) {
    zipFiles[existingIndex] = zipFile;
  } else {
    zipFiles.push(zipFile);
  }
  
  saveToStorage();
};

export const clearZipFileData = async (zipFileName: string): Promise<void> => {
  // Remove documents from this zip file
  documents = documents.filter(doc => doc.sourceZipFile !== zipFileName);
  
  // Find document IDs from this zip file to remove relationships
  const docIdsToRemove = documents
    .filter(doc => doc.sourceZipFile === zipFileName)
    .map(doc => doc.id);
  
  // Remove relationships that include these documents
  relationships = relationships.filter(rel => 
    !docIdsToRemove.includes(rel.sourceId) && !docIdsToRemove.includes(rel.targetId)
  );
  
  // Remove the zip file itself
  zipFiles = zipFiles.filter(zf => zf.fileName !== zipFileName);
  
  saveToStorage();
};

// Mock implementation of processZipFile for POC
export const processZipFile = async (
  file: File, 
  progressCallback: (progress: number) => void
): Promise<{
  documents: DocumentWithSummary[],
  relationships: DocumentRelationship[]
}> => {
  // Simulate processing delay
  const totalSteps = 10;
  
  for (let i = 1; i <= totalSteps; i++) {
    await new Promise(resolve => setTimeout(resolve, 300));
    progressCallback(Math.floor((i / totalSteps) * 100));
  }
  
  // Generate mock documents based on file name
  const mockDocuments: DocumentWithSummary[] = Array.from({ length: 5 }).map((_, index) => ({
    id: generateId(),
    fileName: `Document_${index + 1}.pdf`,
    fileType: 'pdf',
    fileSize: Math.floor(Math.random() * 1000000) + 500000,
    uploadDate: new Date().toISOString(),
    sourceZipFile: file.name,
    tags: ['Generated', 'Mock'],
    status: 'Unread',
    isRelevant: Math.random() > 0.3,
    isPrivileged: Math.random() > 0.7,
    isKey: Math.random() > 0.6,
    annotations: [],
    summary: `This is a mock document generated from ${file.name}`,
    keyPoints: [
      'Generated document for POC',
      'Part of zip file processing simulation',
      'Contains mock data'
    ],
    entities: {
      people: ['John Doe', 'Jane Smith'],
      organizations: ['ACME Corp', 'Example LLC'],
      locations: ['New York', 'San Francisco'],
      dates: [new Date().toISOString()]
    }
  }));
  
  // Generate mock relationships
  const mockRelationships: DocumentRelationship[] = [];
  
  // Create relationships between documents
  for (let i = 0; i < mockDocuments.length; i++) {
    for (let j = i + 1; j < mockDocuments.length; j++) {
      if (Math.random() > 0.5) {
        mockRelationships.push({
          sourceId: mockDocuments[i].id,
          targetId: mockDocuments[j].id,
          relationshipType: Math.random() > 0.5 ? 'referenced' : 'similar',
          strength: Math.random() * 0.5 + 0.5
        });
      }
    }
  }
  
  return {
    documents: mockDocuments,
    relationships: mockRelationships
  };
};

// For debugging
if (isBrowser) {
  (window as any).debugStorage = {
    documents,
    relationships,
    zipFiles,
    clear: () => {
      documents = [];
      relationships = [];
      zipFiles = [];
      localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
      localStorage.removeItem(STORAGE_KEYS.RELATIONSHIPS);
      localStorage.removeItem(STORAGE_KEYS.ZIP_FILES);
      console.log('In-memory storage cleared');
    }
  };
} 