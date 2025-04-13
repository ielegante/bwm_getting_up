import { generateId } from './documentUtils';

/**
 * Test if AI services are available
 * @returns {Promise<boolean>} Whether AI capabilities are available
 */
export const testAIService = async () => {
  // For demo purposes, simulate AI availability
  return Math.random() > 0.3; // 70% chance of AI being available
};

/**
 * Analyze document relationships using AI
 * @param {string[]} documentIds - Array of document IDs to analyze
 * @returns {Promise<{relationships: any[]}>} AI-generated relationships
 */
export const analyzeDocumentRelationshipsWithAI = async (documentIds) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, create some random relationships
  const relationships = [];
  
  if (documentIds.length < 2) {
    return { relationships };
  }
  
  // Generate some relationships between documents
  for (let i = 0; i < documentIds.length; i++) {
    for (let j = i + 1; j < documentIds.length; j++) {
      if (Math.random() > 0.6) { // 40% chance of relationship
        relationships.push({
          sourceId: documentIds[i],
          targetId: documentIds[j],
          relationshipType: Math.random() > 0.5 ? 'ai_identified' : 'conceptually_similar',
          strength: Math.random() * 0.5 + 0.5 // 0.5 to 1.0
        });
      }
    }
  }
  
  console.log(`AI generated ${relationships.length} relationships`);
  
  return {
    relationships
  };
};

/**
 * Get AI-generated summary for a document
 * @param {Object} document - Document to summarize
 * @returns {Promise<string>} AI-generated summary
 */
export const getAISummary = async (document) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // For demo purposes, return a mock summary
  return `This appears to be a ${document.fileType} document titled "${document.fileName}" from ${new Date(document.uploadDate).toLocaleDateString()}. It contains information related to ${document.entities?.organizations?.[0] || 'an organization'} and mentions ${document.entities?.people?.[0] || 'individuals'}.`;
};

/**
 * Get AI-generated key points from a document
 * @param {Object} document - Document to analyze
 * @returns {Promise<string[]>} Array of key points
 */
export const getAIKeyPoints = async (document) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, return mock key points
  return [
    `Document created on ${new Date(document.uploadDate).toLocaleDateString()}`,
    `Contains references to ${document.entities?.organizations?.length || 0} organizations`,
    `Mentions ${document.entities?.people?.length || 0} individuals`,
    'AI analysis suggests this document might be worth reviewing in detail',
    document.isRelevant ? 'This document appears highly relevant to the matter' : 'This document may have limited relevance'
  ];
}; 