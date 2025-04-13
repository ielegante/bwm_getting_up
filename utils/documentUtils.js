/**
 * Generate a unique ID for documents and relationships
 * @returns {string} Unique ID string
 */
export const generateId = () => {
  // Simple UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Filter documents based on search criteria
 * @param {Array} documents - The documents to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered documents
 */
export const filterDocuments = (documents, filters) => {
  if (!documents || !documents.length) return [];
  
  return documents.filter(doc => {
    // Search query - check in file name, summary, and key points
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const fileName = doc.fileName?.toLowerCase() || '';
      const summary = doc.summary?.toLowerCase() || '';
      const keyPoints = doc.keyPoints?.join(' ').toLowerCase() || '';
      const peopleEntities = doc.entities?.people?.join(' ').toLowerCase() || '';
      const orgEntities = doc.entities?.organizations?.join(' ').toLowerCase() || '';
      
      const searchText = `${fileName} ${summary} ${keyPoints} ${peopleEntities} ${orgEntities}`;
      
      if (!searchText.includes(query)) {
        return false;
      }
    }
    
    // Filter by document type
    if (filters.documentTypes?.length > 0) {
      if (!doc.fileType || !filters.documentTypes.includes(doc.fileType)) {
        return false;
      }
    }
    
    // Filter by tags
    if (filters.tags?.length > 0) {
      if (!doc.tags || !doc.tags.some(tag => filters.tags.includes(tag))) {
        return false;
      }
    }
    
    // Filter by status
    if (filters.status?.length > 0) {
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