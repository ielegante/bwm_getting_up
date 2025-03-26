import { Document, Annotation, DocumentWithSummary } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Function to generate a unique ID
export const generateId = (): string => {
  return uuidv4();
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
  
  return 'file';
};

// Function to create a new annotation
export const createAnnotation = (
  documentId: string,
  userId: string,
  userName: string,
  text: string,
  color: string,
  pageNumber: number,
  position: { x: number; y: number; width: number; height: number },
  isPrivate: boolean = false
): Annotation => {
  return {
    id: generateId(),
    documentId,
    userId,
    userName,
    text,
    color,
    createdAt: new Date().toISOString(),
    pageNumber,
    position,
    isPrivate
  };
};

// Function to generate mock documents for testing
export const generateMockDocuments = (count: number): Document[] => {
  const mockDocuments: Document[] = [];
  const statuses: ('Unread' | 'In Progress' | 'Reviewed' | 'Needs Second Look')[] = [
    'Unread', 'In Progress', 'Reviewed', 'Needs Second Look'
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
    'Relevant',
    'Privileged',
    'Key Evidence',
    'To Produce',
    'Financial Records',
    'Witness Smith',
    'Contract',
    'Email',
    'Invoice',
    'Court Filing'
  ];
  const users = [
    'John Doe',
    'Jane Smith',
    'Robert Johnson',
    'Emily Davis'
  ];

  for (let i = 0; i < count; i++) {
    const randomTags = Array.from(
      { length: Math.floor(Math.random() * 4) + 1 },
      () => tags[Math.floor(Math.random() * tags.length)]
    ).filter((value, index, self) => self.indexOf(value) === index);
    
    const randomFileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const fileTypeName = randomFileType.split('/')[1];
    const randomFileName = `Document_${i + 1}.${fileTypeName.replace('vnd.openxmlformats-officedocument.wordprocessingml.', 'docx').replace('vnd.openxmlformats-officedocument.spreadsheetml.', 'xlsx').replace('msword', 'doc')}`;
    
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    const mockDocument: Document = {
      id: generateId(),
      fileName: randomFileName,
      fileType: randomFileType,
      uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: randomUser,
      fileSize: Math.floor(Math.random() * 10000000) + 100000,
      tags: randomTags,
      status: randomStatus,
      annotations: []
    };

    // Add some random annotations
    const annotationCount = Math.floor(Math.random() * 5);
    for (let j = 0; j < annotationCount; j++) {
      const annotationUser = users[Math.floor(Math.random() * users.length)];
      const colors = ['yellow', 'red', 'blue', 'green', 'purple'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      mockDocument.annotations.push({
        id: generateId(),
        documentId: mockDocument.id,
        userId: generateId(),
        userName: annotationUser,
        text: `Comment ${j + 1} by ${annotationUser}`,
        color: randomColor,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
        pageNumber: Math.floor(Math.random() * 10) + 1,
        position: {
          x: Math.random() * 500,
          y: Math.random() * 700,
          width: 200,
          height: 100
        },
        isPrivate: Math.random() > 0.8
      });
    }

    mockDocuments.push(mockDocument);
  }

  return mockDocuments;
};

// Function to generate a mock document summary
export const generateMockSummary = (document: Document): DocumentWithSummary => {
  const people = ['John Smith', 'Jane Doe', 'Michael Johnson', 'Sarah Williams', 'Robert Brown'];
  const organizations = ['Acme Corp', 'WidgetCo', 'Legal Associates LLC', 'Global Enterprises', 'TechStart Inc.'];
  const locations = ['New York', 'London', 'Los Angeles', 'Chicago', 'San Francisco', 'Boston'];
  
  return {
    ...document,
    summary: 'This document outlines key terms of the agreement between parties, including obligations, termination conditions, and indemnity clauses. It addresses several risk factors and establishes a timeline for implementation.',
    keyPoints: [
      'Agreement effective as of January 15, 2023',
      'Initial term of 3 years with automatic renewal',
      'Early termination requires 60-day written notice',
      'Confidentiality provisions survive termination',
      'Governing law: State of New York'
    ],
    entities: {
      people: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
        people[Math.floor(Math.random() * people.length)]
      ),
      organizations: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
        organizations[Math.floor(Math.random() * organizations.length)]
      ),
      dates: [
        new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        new Date(Date.now() - Math.floor(Math.random() * 300) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      ],
      locations: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => 
        locations[Math.floor(Math.random() * locations.length)]
      )
    }
  };
};

// Function to filter documents based on search criteria
export const filterDocuments = (
  documents: Document[],
  filters: {
    query?: string;
    dateRange?: { start: string; end: string };
    documentTypes?: string[];
    tags?: string[];
    status?: string[];
    uploadedBy?: string[];
  }
): Document[] => {
  return documents.filter(doc => {
    // Filter by search query
    if (filters.query && !doc.fileName.toLowerCase().includes(filters.query.toLowerCase())) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange) {
      const docDate = new Date(doc.uploadDate);
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      if (startDate && docDate < startDate) return false;
      if (endDate && docDate > endDate) return false;
    }

    // Filter by document type
    if (
      filters.documentTypes &&
      filters.documentTypes.length > 0 &&
      !filters.documentTypes.some(type => doc.fileType.includes(type))
    ) {
      return false;
    }

    // Filter by tags
    if (
      filters.tags &&
      filters.tags.length > 0 &&
      !filters.tags.some(tag => doc.tags.includes(tag))
    ) {
      return false;
    }

    // Filter by status
    if (
      filters.status &&
      filters.status.length > 0 &&
      !filters.status.includes(doc.status)
    ) {
      return false;
    }

    // Filter by uploader
    if (
      filters.uploadedBy &&
      filters.uploadedBy.length > 0 &&
      !filters.uploadedBy.includes(doc.uploadedBy)
    ) {
      return false;
    }

    return true;
  });
}; 