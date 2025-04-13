import { generateId } from './documentUtils';

// Define the types inline to avoid import issues
interface Document {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  fileSize: number;
  tags: string[];
  status: string;
  isRelevant?: boolean;
  isPrivileged?: boolean;
  isKey?: boolean;
  annotations: any[];
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
  relatedDocuments?: string[];
}

interface DocumentRelationship {
  sourceId: string;
  targetId: string;
  relationshipType: string;
  strength: number;
}

interface ZipFileMetadata {
  id: string;
  fileName: string;
  uploadDate: string;
  documentCount: number;
}

// In-memory storage
let documents: DocumentWithSummary[] = [];
let relationships: DocumentRelationship[] = [];
let zipFiles: ZipFileMetadata[] = [];

// Storage keys
const STORAGE_KEYS = {
  DOCUMENTS: 'docanalyzer_documents',
  RELATIONSHIPS: 'docanalyzer_relationships',
  ZIP_FILES: 'docanalyzer_zip_files'
};

// Initialize storage from localStorage (if available)
const initializeFromLocalStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const storedDocuments = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (storedDocuments) {
      documents = JSON.parse(storedDocuments);
    }
    
    const storedRelationships = localStorage.getItem(STORAGE_KEYS.RELATIONSHIPS);
    if (storedRelationships) {
      relationships = JSON.parse(storedRelationships);
    }
    
    const storedZipFiles = localStorage.getItem(STORAGE_KEYS.ZIP_FILES);
    if (storedZipFiles) {
      zipFiles = JSON.parse(storedZipFiles);
    }
  } catch (error) {
    console.error('Error initializing from localStorage:', error);
  }
};

// Save to localStorage
const saveToLocalStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(relationships));
    localStorage.setItem(STORAGE_KEYS.ZIP_FILES, JSON.stringify(zipFiles));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Initialize on import
if (typeof window !== 'undefined') {
  initializeFromLocalStorage();
}

// Document operations
export const getAllDocuments = async (): Promise<DocumentWithSummary[]> => {
  return [...documents];
};

export const getDocumentsByZipFile = async (zipFileName: string): Promise<DocumentWithSummary[]> => {
  return documents.filter(doc => doc.sourceZipFile === zipFileName);
};

export const saveDocuments = async (newDocuments: DocumentWithSummary[]): Promise<void> => {
  newDocuments.forEach(newDoc => {
    const index = documents.findIndex(doc => doc.id === newDoc.id);
    if (index >= 0) {
      documents[index] = { ...documents[index], ...newDoc };
    } else {
      documents.push(newDoc);
    }
  });
  
  saveToLocalStorage();
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  documents = documents.filter(doc => doc.id !== documentId);
  relationships = relationships.filter(rel => 
    rel.sourceId !== documentId && rel.targetId !== documentId
  );
  
  saveToLocalStorage();
};

// Relationship operations
export const getAllRelationships = async (): Promise<DocumentRelationship[]> => {
  return [...relationships];
};

export const getRelationshipsByDocument = async (documentId: string): Promise<DocumentRelationship[]> => {
  return relationships.filter(rel => 
    rel.sourceId === documentId || rel.targetId === documentId
  );
};

export const saveRelationships = async (newRelationships: DocumentRelationship[]): Promise<void> => {
  newRelationships.forEach(newRel => {
    const index = relationships.findIndex(rel => 
      rel.sourceId === newRel.sourceId && 
      rel.targetId === newRel.targetId &&
      rel.relationshipType === newRel.relationshipType
    );
    
    if (index >= 0) {
      relationships[index] = { ...relationships[index], ...newRel };
    } else {
      relationships.push(newRel);
    }
  });
  
  saveToLocalStorage();
};

// ZIP file operations
export const getAllZipFiles = async (): Promise<ZipFileMetadata[]> => {
  return [...zipFiles];
};

export const saveZipFileMetadata = async (zipFile: ZipFileMetadata): Promise<void> => {
  const index = zipFiles.findIndex(zip => zip.fileName === zipFile.fileName);
  if (index >= 0) {
    zipFiles[index] = { ...zipFiles[index], ...zipFile };
  } else {
    zipFiles.push(zipFile);
  }
  
  saveToLocalStorage();
};

export const clearZipFileData = async (zipFileName: string): Promise<void> => {
  documents = documents.filter(doc => doc.sourceZipFile !== zipFileName);
  
  // Remove all relationships involving documents from this ZIP file
  const remainingDocIds = documents.map(doc => doc.id);
  relationships = relationships.filter(rel => 
    remainingDocIds.includes(rel.sourceId) && remainingDocIds.includes(rel.targetId)
  );
  
  zipFiles = zipFiles.filter(zip => zip.fileName !== zipFileName);
  
  saveToLocalStorage();
};

// Simulate processing a ZIP file
export const processZipFile = async (
  file: File, 
  progressCallback?: (progress: number) => void
): Promise<{ documents: DocumentWithSummary[], relationships: DocumentRelationship[] }> => {
  // Simulate processing delay with progress
  const simulateProgress = async (total: number) => {
    for (let i = 0; i <= total; i++) {
      if (progressCallback) {
        progressCallback(Math.floor((i / total) * 100));
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };
  
  await simulateProgress(20);
  
  // Generate between 5-15 mock documents
  const documentCount = Math.floor(Math.random() * 10) + 5;
  const newDocuments: DocumentWithSummary[] = [];
  
  for (let i = 0; i < documentCount; i++) {
    const docId = generateId();
    const documentTypes = ['pdf', 'docx', 'txt', 'md'];
    const fileType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    
    newDocuments.push({
      id: docId,
      fileName: `Document_${i + 1}.${fileType}`,
      fileType,
      fileSize: Math.floor(Math.random() * 1000000) + 500000,
      uploadDate: new Date().toISOString(),
      tags: ['Generated', i % 2 === 0 ? 'Important' : 'Reference'],
      status: i % 3 === 0 ? 'Read' : 'Unread',
      isRelevant: i % 2 === 0,
      isPrivileged: i === 1,
      isKey: i === 0,
      annotations: [],
      sourceZipFile: file.name,
      summary: `This is a generated document #${i + 1} with sample content.`,
      keyPoints: [
        'Generated from ZIP file',
        'Contains sample metadata',
        `Document ID: ${i + 1}`
      ],
      entities: {
        people: ['John Smith', 'Jane Doe'],
        organizations: ['ACME Corp', 'Legal Department'],
        locations: ['New York', 'San Francisco'],
        dates: [new Date().toISOString()]
      }
    });
  }
  
  await simulateProgress(20);
  
  // Generate relationships (each document connects to at least one other)
  const newRelationships: DocumentRelationship[] = [];
  
  for (let i = 0; i < newDocuments.length; i++) {
    // Create a relationship to another random document
    const targetIndex = (i + 1) % newDocuments.length;
    
    newRelationships.push({
      sourceId: newDocuments[i].id,
      targetId: newDocuments[targetIndex].id,
      relationshipType: 'referenced',
      strength: 0.7 + (Math.random() * 0.3)
    });
    
    // 50% chance to create a second relationship
    if (Math.random() > 0.5 && newDocuments.length > 2) {
      let secondTarget = Math.floor(Math.random() * newDocuments.length);
      while (secondTarget === i || secondTarget === targetIndex) {
        secondTarget = Math.floor(Math.random() * newDocuments.length);
      }
      
      newRelationships.push({
        sourceId: newDocuments[i].id,
        targetId: newDocuments[secondTarget].id,
        relationshipType: 'similar',
        strength: 0.5 + (Math.random() * 0.3)
      });
    }
  }
  
  return { documents: newDocuments, relationships: newRelationships };
};

// Debug functions
export const clearAllDocuments = () => {
  documents = [];
  relationships = [];
  saveToLocalStorage();
};

export const clearAllZipFiles = () => {
  zipFiles = [];
  saveToLocalStorage();
};

export const clearAllData = () => {
  documents = [];
  relationships = [];
  zipFiles = [];
  saveToLocalStorage();
}; 