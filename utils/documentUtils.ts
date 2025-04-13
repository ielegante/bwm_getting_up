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

interface SearchFilters {
  query: string;
  documentTypes?: string[];
  tags?: string[];
  status?: string[];
  isRelevant?: boolean;
  isPrivileged?: boolean;
  isKey?: boolean;
}

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return 'id_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Filter documents based on search criteria
 */
export const filterDocuments = (
  documents: DocumentWithSummary[],
  filters: SearchFilters
): DocumentWithSummary[] => {
  return documents.filter(doc => {
    // Text search
    if (filters.query && !matchesSearchQuery(doc, filters.query)) {
      return false;
    }
    
    // Document type filtering
    if (filters.documentTypes && 
        filters.documentTypes.length > 0 && 
        !filters.documentTypes.includes(doc.fileType)) {
      return false;
    }
    
    // Tags filtering
    if (filters.tags && 
        filters.tags.length > 0 && 
        !doc.tags.some(tag => filters.tags!.includes(tag))) {
      return false;
    }
    
    // Status filtering
    if (filters.status && 
        filters.status.length > 0 && 
        !filters.status.includes(doc.status)) {
      return false;
    }
    
    // Boolean flags
    if (filters.isRelevant !== undefined && doc.isRelevant !== filters.isRelevant) {
      return false;
    }
    
    if (filters.isPrivileged !== undefined && doc.isPrivileged !== filters.isPrivileged) {
      return false;
    }
    
    if (filters.isKey !== undefined && doc.isKey !== filters.isKey) {
      return false;
    }
    
    return true;
  });
};

/**
 * Check if a document matches a search query
 */
const matchesSearchQuery = (doc: DocumentWithSummary, query: string): boolean => {
  const normalizedQuery = query.toLowerCase();
  
  // Search in filename
  if (doc.fileName.toLowerCase().includes(normalizedQuery)) {
    return true;
  }
  
  // Search in summary
  if (doc.summary && doc.summary.toLowerCase().includes(normalizedQuery)) {
    return true;
  }
  
  // Search in key points
  if (doc.keyPoints && doc.keyPoints.some(point => 
    point.toLowerCase().includes(normalizedQuery)
  )) {
    return true;
  }
  
  // Search in entity names
  if (doc.entities) {
    // Search in people
    if (doc.entities.people.some(person => 
      person.toLowerCase().includes(normalizedQuery)
    )) {
      return true;
    }
    
    // Search in organizations
    if (doc.entities.organizations.some(org => 
      org.toLowerCase().includes(normalizedQuery)
    )) {
      return true;
    }
    
    // Search in locations
    if (doc.entities.locations.some(location => 
      location.toLowerCase().includes(normalizedQuery)
    )) {
      return true;
    }
  }
  
  // Search in tags
  if (doc.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
    return true;
  }
  
  return false;
}; 