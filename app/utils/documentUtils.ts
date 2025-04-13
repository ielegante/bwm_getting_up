import { Document, Annotation, DocumentWithSummary, DocumentRelationship } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Function to generate a unique ID
export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Function to format date
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Function to get file type icon based on file extension
export const getFileTypeIcon = (fileType: string): string => {
  const type = fileType.toLowerCase();
  
  if (type.includes('pdf')) return 'file-text';
  if (type.includes('doc') || type.includes('word')) return 'file-text';
  if (type.includes('xls') || type.includes('spreadsheet')) return 'file-spreadsheet';
  if (type.includes('ppt') || type.includes('presentation')) return 'file-presentation';
  if (type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('gif')) return 'image';
  if (type.includes('zip') || type.includes('rar')) return 'archive';
  if (type.includes('mp3') || type.includes('wav') || type.includes('audio')) return 'file-audio';
  if (type.includes('mp4') || type.includes('avi') || type.includes('mov') || type.includes('video')) return 'file-video';
  if (type.includes('txt')) return 'file-text';
  
  return 'file';
};

// Function to create a new annotation
export const createAnnotation = (
  documentId: string,
  text: string,
  pageNumber: number,
  position: { x: number; y: number; width: number; height: number }
): Annotation => {
  return {
    id: generateId(),
    documentId,
    text,
    createdAt: new Date().toISOString(),
    pageNumber,
    position
  };
};

// Function to generate mock documents for testing
export const generateMockDocuments = (count: number, zipFileName: string = 'example.zip'): DocumentWithSummary[] => {
  const mockDocuments: DocumentWithSummary[] = [];
  const statuses: ('Unread' | 'Read' | 'Needs Second Look')[] = [
    'Unread', 'Read', 'Needs Second Look'
  ];
  const fileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/rtf',
    'message/rfc822'
  ];
  const tags = [
    'Important',
    'Needs Review',
    'Contract',
    'Email',
    'Invoice',
    'Financial'
  ];

  for (let i = 0; i < count; i++) {
    const randomTags = Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => tags[Math.floor(Math.random() * tags.length)]
    ).filter((value, index, self) => self.indexOf(value) === index);
    
    const randomFileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const fileTypeName = randomFileType.split('/')[1];
    const randomFileName = `Document_${i + 1}.${fileTypeName.replace('vnd.openxmlformats-officedocument.wordprocessingml.', 'docx').replace('vnd.openxmlformats-officedocument.spreadsheetml.', 'xlsx').replace('msword', 'doc')}`;
    
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const mockDocument: DocumentWithSummary = {
      id: generateId(),
      fileName: randomFileName,
      fileType: randomFileType,
      uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: Math.floor(Math.random() * 10000000) + 100000,
      tags: randomTags,
      status: randomStatus,
      annotations: [],
      sourceZipFile: zipFileName,
      isRelevant: Math.random() > 0.7,
      isPrivileged: Math.random() > 0.8,
      isKey: Math.random() > 0.9,
      summary: 'This document outlines key terms of the agreement between parties, including obligations, termination conditions, and indemnity clauses.',
      keyPoints: [
        'Agreement effective as of January 15, 2023',
        'Initial term of 3 years with automatic renewal',
        'Early termination requires 60-day written notice',
      ],
      entities: generateMockEntities(),
      relatedDocuments: []
    };

    // Add some random annotations
    const annotationCount = Math.floor(Math.random() * 3);
    for (let j = 0; j < annotationCount; j++) {
      mockDocument.annotations.push({
        id: generateId(),
        documentId: mockDocument.id,
        text: `Note: Important point about ${j + 1}`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
        pageNumber: Math.floor(Math.random() * 5) + 1,
        position: {
          x: Math.random() * 500,
          y: Math.random() * 700,
          width: 200,
          height: 100
        }
      });
    }

    mockDocuments.push(mockDocument);
  }

  // Generate some relationships between documents
  const relationships: DocumentRelationship[] = [];
  for (let i = 0; i < mockDocuments.length; i++) {
    const doc = mockDocuments[i];
    // Create 1-3 relationships for each document
    const relationshipCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < relationshipCount; j++) {
      // Pick a random target document that's not the current one
      const availableTargets = mockDocuments.filter(d => d.id !== doc.id);
      if (availableTargets.length === 0) continue;
      
      const targetDoc = availableTargets[Math.floor(Math.random() * availableTargets.length)];
      
      // Define relationship type
      const relationshipTypes: ('referenced' | 'similar' | 'sequential')[] = ['referenced', 'similar', 'sequential'];
      const relType = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];
      
      // Create relationship
      const relationship: DocumentRelationship = {
        sourceId: doc.id,
        targetId: targetDoc.id,
        relationshipType: relType,
        strength: Math.random() * 0.5 + 0.5 // Value between 0.5 and 1
      };
      
      // Add to relationships array if not duplicate
      if (!relationships.some(r => 
        (r.sourceId === relationship.sourceId && r.targetId === relationship.targetId) || 
        (r.sourceId === relationship.targetId && r.targetId === relationship.sourceId)
      )) {
        relationships.push(relationship);
        
        // Add related document ID to source document
        if (!doc.relatedDocuments) {
          doc.relatedDocuments = [];
        }
        doc.relatedDocuments.push(targetDoc.id);
        
        // Add related document ID to target document
        if (!targetDoc.relatedDocuments) {
          targetDoc.relatedDocuments = [];
        }
        targetDoc.relatedDocuments.push(doc.id);
      }
    }
  }

  return mockDocuments;
};

// Function to generate mock entities
export const generateMockEntities = () => {
  const people = ['John Smith', 'Jane Doe', 'Michael Johnson', 'Sarah Williams', 'Robert Brown'];
  const organizations = ['Acme Corp', 'WidgetCo', 'Legal Associates LLC', 'Global Enterprises', 'TechStart Inc.'];
  const locations = ['New York', 'London', 'Los Angeles', 'Chicago', 'San Francisco', 'Boston'];
  
  return {
    people: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      people[Math.floor(Math.random() * people.length)]
    ).filter((value, index, self) => self.indexOf(value) === index),
    organizations: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      organizations[Math.floor(Math.random() * organizations.length)]
    ).filter((value, index, self) => self.indexOf(value) === index),
    dates: [
      new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      new Date(Date.now() - Math.floor(Math.random() * 300) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    ],
    locations: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => 
      locations[Math.floor(Math.random() * locations.length)]
    ).filter((value, index, self) => self.indexOf(value) === index)
  };
};

// Interface for document filtering options
export interface DocumentFilterOptions {
  query?: string;
  documentTypes?: string[];
  tags?: string[];
  status?: string[];
  isRelevant?: boolean;
  isPrivileged?: boolean;
  isKey?: boolean;
}

// Filter documents based on search criteria
export const filterDocuments = (
  documents: DocumentWithSummary[],
  filters: DocumentFilterOptions
): DocumentWithSummary[] => {
  return documents.filter(doc => {
    // Filter by search query
    if (filters.query && filters.query.trim() !== '') {
      const query = filters.query.toLowerCase();
      const matchesQuery = 
        doc.fileName.toLowerCase().includes(query) ||
        doc.summary?.toLowerCase().includes(query) ||
        doc.keyPoints?.some(point => point.toLowerCase().includes(query)) ||
        (doc.entities?.people?.some(person => person.toLowerCase().includes(query))) ||
        (doc.entities?.organizations?.some(org => org.toLowerCase().includes(query))) ||
        (doc.entities?.locations?.some(loc => loc.toLowerCase().includes(query))) ||
        (doc.tags?.some(tag => tag.toLowerCase().includes(query)));
      
      if (!matchesQuery) return false;
    }
    
    // Filter by document type
    if (filters.documentTypes && filters.documentTypes.length > 0) {
      if (!doc.fileType || !filters.documentTypes.includes(doc.fileType)) {
        return false;
      }
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      if (!doc.tags || !doc.tags.some(tag => filters.tags!.includes(tag))) {
        return false;
      }
    }
    
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      if (!doc.status || !filters.status.includes(doc.status)) {
        return false;
      }
    }
    
    // Filter by isRelevant
    if (filters.isRelevant !== undefined) {
      if (doc.isRelevant !== filters.isRelevant) {
        return false;
      }
    }
    
    // Filter by isPrivileged
    if (filters.isPrivileged !== undefined) {
      if (doc.isPrivileged !== filters.isPrivileged) {
        return false;
      }
    }
    
    // Filter by isKey
    if (filters.isKey !== undefined) {
      if (doc.isKey !== filters.isKey) {
        return false;
      }
    }
    
    return true;
  });
};

// Function to process a zip file (mocked for now)
export const processZipFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ documents: DocumentWithSummary[], relationships: DocumentRelationship[] }> => {
  // This is a mock function - in a real app, this would extract the zip and process files
  return new Promise((resolve) => {
    // Simulate processing time
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (onProgress) onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        // Generate mock documents
        const mockDocs = generateMockDocuments(Math.floor(Math.random() * 10) + 5, file.name);
        
        // Generate mock relationships
        const relationships: DocumentRelationship[] = [];
        for (let i = 0; i < mockDocs.length - 1; i++) {
          if (Math.random() > 0.5) {
            relationships.push({
              sourceId: mockDocs[i].id,
              targetId: mockDocs[i + 1].id,
              relationshipType: Math.random() > 0.5 ? 'similar' : 'referenced',
              strength: Math.random() * 0.5 + 0.5
            });
          }
        }
        
        resolve({ documents: mockDocs, relationships });
      }
    }, 200);
  });
}; 