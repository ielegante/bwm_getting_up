import { DocumentWithSummary, DocumentRelationship } from '../types';

// Database name and stores
const DB_NAME = 'docAnalyzerDB';
const DB_VERSION = 1;
const DOCUMENTS_STORE = 'documents';
const RELATIONSHIPS_STORE = 'relationships';
const ZIP_FILES_STORE = 'zipFiles';

// Interface for zip file metadata
interface ZipFileMetadata {
  id: string;
  fileName: string;
  uploadDate: string;
  documentCount: number;
}

// Initialize the database
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening database');
      reject(new Error('Could not open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create documents store
      if (!db.objectStoreNames.contains(DOCUMENTS_STORE)) {
        const documentStore = db.createObjectStore(DOCUMENTS_STORE, { keyPath: 'id' });
        documentStore.createIndex('sourceZipFile', 'sourceZipFile', { unique: false });
      }
      
      // Create relationships store
      if (!db.objectStoreNames.contains(RELATIONSHIPS_STORE)) {
        const relationshipStore = db.createObjectStore(RELATIONSHIPS_STORE, { 
          keyPath: ['sourceId', 'targetId'] 
        });
        relationshipStore.createIndex('sourceId', 'sourceId', { unique: false });
        relationshipStore.createIndex('targetId', 'targetId', { unique: false });
      }
      
      // Create zip files store
      if (!db.objectStoreNames.contains(ZIP_FILES_STORE)) {
        db.createObjectStore(ZIP_FILES_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Save documents
export const saveDocuments = async (documents: DocumentWithSummary[]): Promise<void> => {
  const db = await initDatabase();
  const transaction = db.transaction(DOCUMENTS_STORE, 'readwrite');
  const store = transaction.objectStore(DOCUMENTS_STORE);
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('Error saving documents'));
    
    documents.forEach(doc => {
      store.put(doc);
    });
  });
};

// Save relationships
export const saveRelationships = async (relationships: DocumentRelationship[]): Promise<void> => {
  const db = await initDatabase();
  const transaction = db.transaction(RELATIONSHIPS_STORE, 'readwrite');
  const store = transaction.objectStore(RELATIONSHIPS_STORE);
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('Error saving relationships'));
    
    relationships.forEach(rel => {
      store.put(rel);
    });
  });
};

// Save zip file metadata
export const saveZipFileMetadata = async (zipFile: ZipFileMetadata): Promise<void> => {
  const db = await initDatabase();
  const transaction = db.transaction(ZIP_FILES_STORE, 'readwrite');
  const store = transaction.objectStore(ZIP_FILES_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.put(zipFile);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Error saving zip file metadata'));
  });
};

// Get all documents
export const getAllDocuments = async (): Promise<DocumentWithSummary[]> => {
  const db = await initDatabase();
  const transaction = db.transaction(DOCUMENTS_STORE, 'readonly');
  const store = transaction.objectStore(DOCUMENTS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Error getting documents'));
  });
};

// Get documents by zip file
export const getDocumentsByZipFile = async (zipFileName: string): Promise<DocumentWithSummary[]> => {
  const db = await initDatabase();
  const transaction = db.transaction(DOCUMENTS_STORE, 'readonly');
  const store = transaction.objectStore(DOCUMENTS_STORE);
  const index = store.index('sourceZipFile');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(zipFileName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Error getting documents by zip file'));
  });
};

// Get relationships for a specific document
export const getRelationshipsByDocument = async (documentId: string): Promise<DocumentRelationship[]> => {
  try {
    const db = await initDatabase();
    const transaction = db.transaction([RELATIONSHIPS_STORE], 'readonly');
    const store = transaction.objectStore(RELATIONSHIPS_STORE);
    
    // Use an index to find relationships by source or target ID
    const sourceIndex = store.index('sourceId');
    const targetIndex = store.index('targetId');
    
    // Use a promise-based approach to get the data
    const sourceRelationshipsPromise = new Promise<DocumentRelationship[]>((resolve, reject) => {
      const request = sourceIndex.getAll(documentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    const targetRelationshipsPromise = new Promise<DocumentRelationship[]>((resolve, reject) => {
      const request = targetIndex.getAll(documentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Wait for both promises to resolve
    const [sourceRelationships, targetRelationships] = await Promise.all([
      sourceRelationshipsPromise,
      targetRelationshipsPromise
    ]);
    
    // Combine and deduplicate relationships
    const relationshipMap = new Map();
    [...sourceRelationships, ...targetRelationships].forEach(rel => {
      relationshipMap.set(`${rel.sourceId}-${rel.targetId}`, rel);
    });
    
    return Array.from(relationshipMap.values()) as DocumentRelationship[];
  } catch (error) {
    console.error('Error getting relationships by document:', error);
    return [];
  }
};

// Get all relationships
export const getAllRelationships = async (): Promise<DocumentRelationship[]> => {
  try {
    const db = await initDatabase();
    const transaction = db.transaction([RELATIONSHIPS_STORE], 'readonly');
    const store = transaction.objectStore(RELATIONSHIPS_STORE);
    
    return new Promise<DocumentRelationship[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting all relationships:', error);
    return [];
  }
};

// Get all zip files
export const getAllZipFiles = async (): Promise<ZipFileMetadata[]> => {
  const db = await initDatabase();
  const transaction = db.transaction(ZIP_FILES_STORE, 'readonly');
  const store = transaction.objectStore(ZIP_FILES_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Error getting zip files'));
  });
};

// Update document
export const updateDocument = async (document: DocumentWithSummary): Promise<void> => {
  const db = await initDatabase();
  const transaction = db.transaction(DOCUMENTS_STORE, 'readwrite');
  const store = transaction.objectStore(DOCUMENTS_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.put(document);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Error updating document'));
  });
};

// Clear all data for a specific zip file
export const clearZipFileData = async (zipFileName: string): Promise<void> => {
  const db = await initDatabase();
  
  // Get all documents from this zip file
  const documents = await getDocumentsByZipFile(zipFileName);
  const documentIds = documents.map(doc => doc.id);
  
  // Delete documents
  const docTransaction = db.transaction(DOCUMENTS_STORE, 'readwrite');
  const docStore = docTransaction.objectStore(DOCUMENTS_STORE);
  
  // Delete relationships involving these documents
  const relTransaction = db.transaction(RELATIONSHIPS_STORE, 'readwrite');
  const relStore = relTransaction.objectStore(RELATIONSHIPS_STORE);
  
  // Delete zip file metadata
  const zipTransaction = db.transaction(ZIP_FILES_STORE, 'readwrite');
  const zipStore = zipTransaction.objectStore(ZIP_FILES_STORE);
  
  return new Promise((resolve, reject) => {
    docTransaction.oncomplete = () => {
      // After documents are deleted, complete the promise
      resolve();
    };
    
    docTransaction.onerror = () => reject(new Error('Error clearing documents'));
    
    // Delete documents
    documentIds.forEach(id => {
      docStore.delete(id);
    });
    
    // Delete relationships
    documentIds.forEach(id => {
      const sourceIdx = relStore.index('sourceId');
      const targetIdx = relStore.index('targetId');
      
      const sourceRequest = sourceIdx.getAllKeys(id);
      sourceRequest.onsuccess = () => {
        sourceRequest.result.forEach((key: IDBValidKey) => {
          relStore.delete(key);
        });
      };
      
      const targetRequest = targetIdx.getAllKeys(id);
      targetRequest.onsuccess = () => {
        targetRequest.result.forEach((key: IDBValidKey) => {
          relStore.delete(key);
        });
      };
    });
    
    // Delete zip file metadata (find by filename)
    const getAllRequest = zipStore.getAll();
    getAllRequest.onsuccess = () => {
      const zipFiles = getAllRequest.result as ZipFileMetadata[];
      const targetZip = zipFiles.find(zip => zip.fileName === zipFileName);
      
      if (targetZip) {
        zipStore.delete(targetZip.id);
      }
    };
  });
}; 