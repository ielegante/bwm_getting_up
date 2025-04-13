/**
 * Document interface with summary and analysis fields
 * @typedef {Object} DocumentWithSummary
 * @property {string} id - Unique identifier
 * @property {string} fileName - Name of the file
 * @property {string} fileType - Type of file (pdf, docx, etc.)
 * @property {number} fileSize - Size in bytes
 * @property {string} uploadDate - ISO date string
 * @property {string} sourceZipFile - Source ZIP file name
 * @property {string[]} tags - Array of tag strings
 * @property {string} status - Document status (Unread, Reviewed, etc.)
 * @property {boolean} isRelevant - Whether the document is relevant
 * @property {boolean} isPrivileged - Whether the document is privileged
 * @property {boolean} isKey - Whether the document is a key document
 * @property {Object[]} annotations - Annotations made on the document
 * @property {string} summary - Document summary
 * @property {string[]} keyPoints - Key points from the document
 * @property {Object} entities - Entity extraction results
 * @property {string[]} entities.people - Extracted people names
 * @property {string[]} entities.organizations - Extracted organization names
 * @property {string[]} entities.locations - Extracted location names
 * @property {string[]} entities.dates - Extracted dates
 */

/**
 * Relationship between two documents
 * @typedef {Object} DocumentRelationship
 * @property {string} sourceId - Source document ID
 * @property {string} targetId - Target document ID
 * @property {string} relationshipType - Type of relationship
 * @property {number} strength - Strength of relationship (0-1)
 */

/**
 * Search filters for documents
 * @typedef {Object} SearchFilters
 * @property {string} query - Text search query
 * @property {string[]} documentTypes - Document types to include
 * @property {string[]} tags - Tags to filter by
 * @property {string[]} status - Document statuses to include
 */

export const DocumentTypes = {
  PDF: 'pdf',
  DOCX: 'docx',
  XLSX: 'xlsx',
  PPTX: 'pptx',
  TXT: 'txt',
  HTML: 'html',
  IMAGE: 'image'
};

export const DocumentStatuses = {
  UNREAD: 'Unread',
  IN_REVIEW: 'In Review',
  REVIEWED: 'Reviewed',
  IMPORTANT: 'Important'
};

export const RelationshipTypes = {
  REFERENCES: 'referenced',
  SIMILAR: 'similar',
  RELATED: 'related',
  AI_IDENTIFIED: 'ai_identified',
  CONCEPTUALLY_SIMILAR: 'conceptually_similar'
}; 