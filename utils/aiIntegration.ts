import { generateId } from './documentUtils';

// Define the type inline to avoid import issues
interface DocumentRelationship {
  sourceId: string;
  targetId: string;
  relationshipType: string;
  strength: number;
}

// Mock AI service availability
const AI_SERVICE_AVAILABLE = true;

/**
 * Test if AI service is available
 */
export const testAIService = async (): Promise<boolean> => {
  // In a real app, this would check if the AI service is accessible
  return Promise.resolve(AI_SERVICE_AVAILABLE);
};

/**
 * Analyze relationships between documents using AI
 */
export const analyzeDocumentRelationshipsWithAI = async (
  documentIds: string[]
): Promise<{ relationships: DocumentRelationship[] }> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For this demo, we'll generate random relationships between documents
  const relationships: DocumentRelationship[] = [];
  
  // Only generate if we have at least 2 documents
  if (documentIds.length >= 2) {
    // Generate random relationships (about 30% of possible combinations)
    const possiblePairs = documentIds.length * (documentIds.length - 1) / 2;
    const numRelationships = Math.ceil(possiblePairs * 0.3);
    
    for (let i = 0; i < numRelationships; i++) {
      // Pick two random documents
      let sourceIndex = Math.floor(Math.random() * documentIds.length);
      let targetIndex = Math.floor(Math.random() * documentIds.length);
      
      // Make sure they're different
      while (sourceIndex === targetIndex) {
        targetIndex = Math.floor(Math.random() * documentIds.length);
      }
      
      // Determine relationship type
      const relationshipTypes: Array<'referenced' | 'similar' | 'sequential'> = [
        'referenced', 'similar', 'sequential'
      ];
      const type = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];
      
      // Add with random strength between 0.6 and 0.95
      relationships.push({
        sourceId: documentIds[sourceIndex],
        targetId: documentIds[targetIndex],
        relationshipType: type,
        strength: 0.6 + Math.random() * 0.35
      });
    }
  }
  
  return { relationships };
}; 