export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  fileSize: number;
  tags: string[];
  status: 'Unread' | 'Read' | 'Needs Second Look';
  isRelevant?: boolean;
  isPrivileged?: boolean;
  isKey?: boolean;
  annotations: Annotation[];
  sourceZipFile?: string;
}

export interface Annotation {
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
}

export interface SearchFilters {
  query: string;
  documentTypes?: string[];
  tags?: string[];
  status?: string[];
  isRelevant?: boolean;
  isPrivileged?: boolean;
  isKey?: boolean;
}

export interface DocumentWithSummary extends Document {
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

export interface DocumentRelationship {
  sourceId: string;
  targetId: string;
  relationshipType: 'referenced' | 'similar' | 'sequential';
  strength: number; // 0-1 indicating relationship strength
} 