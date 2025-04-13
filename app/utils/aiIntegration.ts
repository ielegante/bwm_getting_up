// AI integration utility for document analysis
// This is a placeholder for future AI integration with real models

import { DocumentWithSummary, DocumentRelationship } from '../types';
import { generateId } from './documentUtils';

// Interface for AI analysis results
export interface AIAnalysisResult {
  documentId: string;
  summary: string;
  keyPoints: string[];
  entities: {
    people: string[];
    organizations: string[];
    dates: string[];
    locations: string[];
  };
  isRelevant?: boolean;
  isPrivileged?: boolean;
  isKey?: boolean;
  suggestedTags: string[];
}

// Interface for AI document relationship analysis
export interface AIRelationshipResult {
  relationships: DocumentRelationship[];
}

// Mock function for document analysis by AI
// In the future, this would call an actual AI API
export const analyzeDocumentWithAI = async (
  documentContent: string,
  documentId: string,
  fileType: string
): Promise<AIAnalysisResult> => {
  // This is a mock function that would be replaced with actual AI API calls
  console.log(`Analyzing document ${documentId} of type ${fileType}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock results
  return {
    documentId,
    summary: 'This document appears to be a legal agreement outlining terms between parties.',
    keyPoints: [
      'Agreement dated January, 2023',
      'Parties include ACME Corp and Widget Inc',
      'Term is 24 months with automatic renewal',
      'Early termination requires 30 days notice'
    ],
    entities: {
      people: ['John Smith', 'Jane Doe', 'Robert Johnson'],
      organizations: ['ACME Corp', 'Widget Inc', 'Legal Dept'],
      dates: ['January 15, 2023', 'December 31, 2024'],
      locations: ['New York', 'Delaware']
    },
    suggestedTags: ['Agreement', 'Contract', 'Important'],
    isRelevant: Math.random() > 0.3,
    isPrivileged: Math.random() > 0.7,
    isKey: Math.random() > 0.8
  };
};

// Mock AI service testing
export const testAIService = async (): Promise<boolean> => {
  // Simulate service check 
  await new Promise(resolve => setTimeout(resolve, 300));
  return true; // Always return available for POC
};

// Mock AI relationship analysis
export const analyzeDocumentRelationshipsWithAI = async (
  documentIds: string[]
): Promise<{ relationships: DocumentRelationship[] }> => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const aiRelationships: DocumentRelationship[] = [];
  
  // Generate random relationships between documents
  for (let i = 0; i < documentIds.length; i++) {
    for (let j = i + 1; j < documentIds.length; j++) {
      // Create relationship with 30% probability
      if (Math.random() < 0.3) {
        const relationshipTypes = ['referenced', 'similar', 'sequential'] as const;
        
        aiRelationships.push({
          sourceId: documentIds[i],
          targetId: documentIds[j],
          relationshipType: relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)],
          strength: Math.random() * 0.5 + 0.5, // Strong relationship (0.5-1.0)
        });
      }
    }
  }
  
  return { relationships: aiRelationships };
};

// Configuration for AI services
export interface AIServiceConfig {
  serviceUrl: string;
  apiKey: string;
  modelName: string;
  enabled: boolean;
}

// Default configuration (for future use)
const defaultConfig: AIServiceConfig = {
  serviceUrl: '',
  apiKey: '',
  modelName: 'gpt-4',
  enabled: false
};

// Storage key for AI configuration
const AI_CONFIG_STORAGE_KEY = 'docAnalyzer_aiConfig';

// Load AI service configuration from local storage
export const loadAIServiceConfig = (): AIServiceConfig => {
  if (typeof window === 'undefined') return defaultConfig;
  
  const storedConfig = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
  if (!storedConfig) return defaultConfig;
  
  try {
    return JSON.parse(storedConfig) as AIServiceConfig;
  } catch (e) {
    console.error('Error parsing AI service config:', e);
    return defaultConfig;
  }
};

// Save AI service configuration to local storage
export const saveAIServiceConfig = (config: AIServiceConfig): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
};

// Function to apply AI analysis to a document
export const applyAIAnalysisToDocument = (
  document: DocumentWithSummary, 
  analysis: AIAnalysisResult
): DocumentWithSummary => {
  return {
    ...document,
    summary: analysis.summary,
    keyPoints: analysis.keyPoints,
    entities: analysis.entities,
    isRelevant: analysis.isRelevant,
    isPrivileged: analysis.isPrivileged,
    isKey: analysis.isKey,
    tags: [...new Set([...document.tags, ...analysis.suggestedTags])]
  };
}; 