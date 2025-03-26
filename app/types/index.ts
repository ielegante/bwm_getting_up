export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  uploadedBy: string;
  fileSize: number;
  tags: string[];
  status: 'Unread' | 'In Progress' | 'Reviewed' | 'Needs Second Look';
  annotations: Annotation[];
}

export interface Annotation {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  text: string;
  color: string;
  createdAt: string;
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isPrivate: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Lawyer' | 'Reviewer' | 'ReadOnly';
}

export interface Matter {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedUsers: User[];
}

export interface SearchFilters {
  query: string;
  dateRange?: {
    start: string;
    end: string;
  };
  documentTypes?: string[];
  tags?: string[];
  status?: string[];
  uploadedBy?: string[];
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
} 