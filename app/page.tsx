'use client';

import React, { useState, useEffect } from 'react';
import { FileUp, ArrowDownFromLine, FolderOpen } from 'lucide-react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DocumentList from './components/DocumentList';
import DocumentViewer from './components/DocumentViewer';
import UploadModal from './components/UploadModal';
import RelationshipGraph from './components/RelationshipGraph';
import EntityAnalysis from './components/EntityAnalysis';

import { useDocuments } from './context/DocumentContext';
import { DocumentWithSummary, DocumentRelationship } from './types';
import { filterDocuments, generateId } from './utils/documentUtils';
import { 
  getAllDocuments,
  getDocumentsByZipFile,
  saveDocuments,
  saveRelationships,
  getAllZipFiles,
  saveZipFileMetadata,
  clearZipFileData,
  getAllRelationships,
  getRelationshipsByDocument,
  processZipFile
} from './utils/inMemoryStorage';
import { testAIService, analyzeDocumentRelationshipsWithAI } from './utils/aiIntegration';

export default function Home() {
  const { 
    documents, 
    addDocument, 
    setCurrentDocument, 
    currentDocument,
    currentZipFile,
    setCurrentZipFile,
    addRelationship,
    relationships,
    markDocumentStatus,
    clearDocuments
  } = useDocuments();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    documentTypes: [],
    tags: [],
    status: [],
    isRelevant: null,
    isPrivileged: null,
    isKey: null
  });
  
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWithSummary[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [hasAICapabilities, setHasAICapabilities] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  
  // State for available zip files
  const [availableZipFiles, setAvailableZipFiles] = useState<{id: string, fileName: string, documentCount: number, uploadDate: string}[]>([]);
  const [selectedZipFile, setSelectedZipFile] = useState<string>("");
  
  // On initial load, check for saved documents and zip files
  useEffect(() => {
    const loadSavedZipFiles = async () => {
      try {
        console.log("Loading saved zip files...");
        const zipFiles = await getAllZipFiles();
        console.log("Found zip files:", zipFiles);
        setAvailableZipFiles(zipFiles);
        
        // If there are previously uploaded files, but no current zip file is selected, 
        // don't load any documents yet - wait for user selection
        if (zipFiles.length > 0 && !currentZipFile) {
          console.log("Zip files available but no current zip file selected");
          // Don't auto-load anything, let the user choose
        } else if (currentZipFile) {
          console.log("Current zip file already selected:", currentZipFile);
          // If we have a currently selected zip file, load its documents
          loadDocumentsForZipFile(currentZipFile);
        }
      } catch (error) {
        console.error('Error loading saved zip files:', error);
      }
    };
    
    const checkAICapabilities = async () => {
      const hasAI = await testAIService();
      setHasAICapabilities(hasAI);
    };
    
    loadSavedZipFiles();
    checkAICapabilities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentZipFile]);  // Add currentZipFile as a dependency
  
  // Filter documents when search or filters change
  useEffect(() => {
    const filtered = filterDocuments(documents, {
      query: searchQuery,
      documentTypes: selectedFilters.documentTypes,
      tags: selectedFilters.tags,
      status: selectedFilters.status,
      isRelevant: selectedFilters.isRelevant !== null ? selectedFilters.isRelevant : undefined,
      isPrivileged: selectedFilters.isPrivileged !== null ? selectedFilters.isPrivileged : undefined,
      isKey: selectedFilters.isKey !== null ? selectedFilters.isKey : undefined
    });
    setFilteredDocuments(filtered);
  }, [documents, searchQuery, selectedFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterType: string, value: string | boolean) => {
    setSelectedFilters(prev => {
      if (filterType === 'isRelevant' || filterType === 'isPrivileged' || filterType === 'isKey') {
        return {
          ...prev,
          [filterType]: typeof value === 'boolean' ? value : null,
        };
      }
      
      const current = prev[filterType as keyof typeof prev] as string[];
      
      if (current.includes(value as string)) {
        return {
          ...prev,
          [filterType]: current.filter(item => item !== value),
        };
      } else {
        return {
          ...prev,
          [filterType]: [...current, value as string],
        };
      }
    });
  };

  const handleSelectDocument = (documentOrId: DocumentWithSummary | string) => {
    const docId = typeof documentOrId === 'string' ? documentOrId : documentOrId.id;
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setCurrentDocument(doc);
    }
  };

  const handleCloseViewer = () => {
    setCurrentDocument(null);
  };
  
  // Load documents for a specific zip file
  const loadDocumentsForZipFile = async (zipFileName: string) => {
    if (!zipFileName) return;
    
    try {
      console.log(`Loading documents for zip file: ${zipFileName}`);
      
      // Close upload modal if open
      setIsUploadModalOpen(false);
      
      // Clear current documents
      clearDocuments();
      
      // Set current zip file immediately 
      setCurrentZipFile(zipFileName);
      setSelectedZipFile(zipFileName);
      
      // Load documents for the selected zip file
      const docs = await getDocumentsByZipFile(zipFileName);
      console.log(`Found ${docs.length} documents for ${zipFileName}`);
      
      // Add documents to state
      docs.forEach((doc: DocumentWithSummary) => {
        addDocument(doc);
      });
      
      // Load relationships for these documents
      const allRelationships = await getAllRelationships();
      
      // Get document IDs for filtering relationships
      const docIds = docs.map(doc => doc.id);
      
      // Filter relevant relationships
      const relevantRelationships = allRelationships.filter(
        (rel: DocumentRelationship) => docIds.includes(rel.sourceId) || docIds.includes(rel.targetId)
      );
      
      // Add relationships to state
      relevantRelationships.forEach((rel: DocumentRelationship) => {
        addRelationship(rel);
      });
    } catch (error) {
      console.error(`Error loading documents for ${zipFileName}:`, error);
      alert(`Error loading documents for ${zipFileName}`);
    }
  };
  
  const handleSelectZipFile = (zipFileName: string) => {
    if (zipFileName === 'new') {
      // User wants to upload a new zip file
      setIsUploadModalOpen(true);
    } else if (zipFileName) {
      // Load the selected zip file
      loadDocumentsForZipFile(zipFileName);
    }
  };
  
  const handleUploadZip = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith('.zip')) {
      alert('Please upload a ZIP file');
      return;
    }
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Process the zip file (simulated in this POC)
      const result = await processZipFile(file, (progress: number) => {
        setProcessingProgress(progress);
      });
      
      // Clear current documents
      clearDocuments();
      
      // Add documents to context
      result.documents.forEach((doc: DocumentWithSummary) => {
        addDocument(doc);
      });
      
      // Add relationships to context
      result.relationships.forEach((rel: DocumentRelationship) => {
        addRelationship(rel);
      });
      
      // Set current zip file
      setCurrentZipFile(file.name);
      
      // Save to storage
      await saveDocuments(result.documents);
      await saveRelationships(result.relationships);
      
      // Save zip file metadata
      const zipMeta = {
        id: generateId(),
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        documentCount: result.documents.length
      };
      await saveZipFileMetadata(zipMeta);
      
      // Update available zip files
      setAvailableZipFiles(prev => [...prev, zipMeta]);
      
      // If AI capabilities are available, analyze relationships
      if (hasAICapabilities) {
        try {
          const aiRelationships = await analyzeDocumentRelationshipsWithAI(
            result.documents.map((doc: DocumentWithSummary) => doc.id)
          );
          
          // Add AI-generated relationships
          aiRelationships.relationships.forEach((rel: DocumentRelationship) => {
            addRelationship(rel);
          });
          
          // Save AI relationships to storage
          await saveRelationships(aiRelationships.relationships);
        } catch (error) {
          console.error('Error analyzing relationships with AI:', error);
        }
      }
      
      // Close the upload modal
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Error processing ZIP file:', error);
      alert('Error processing ZIP file');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleEntityFilter = (entityType: string, entityValue: string) => {
    setSearchQuery(entityValue);
  };
  
  const documentRelationships = currentDocument 
    ? relationships.filter(rel => 
        rel.sourceId === currentDocument.id || 
        rel.targetId === currentDocument.id
      )
    : [];
  
  const relatedDocuments = currentDocument 
    ? documents.filter(doc => 
        documentRelationships.some(rel => 
          (rel.sourceId === currentDocument.id && rel.targetId === doc.id) ||
          (rel.targetId === currentDocument.id && rel.sourceId === doc.id)
        )
      )
    : [];

  // Create demo data function
  const createDemoData = async () => {
    try {
      console.log("Creating demo data...");
      setIsProcessing(true);
      
      // Clear existing data first
      clearDocuments();
      
      // Create demo ZIP file metadata
      const demoZips = [
        {
          id: generateId(),
          fileName: "legal_documents.zip",
          uploadDate: new Date().toISOString(),
          documentCount: 15
        },
        {
          id: generateId(),
          fileName: "contract_review.zip",
          uploadDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          documentCount: 8
        }
      ];
      
      console.log("Demo zip metadata created:", demoZips);
      
      // Create sample documents for the first ZIP file
      const sampleDocuments: DocumentWithSummary[] = [
        {
          id: generateId(),
          fileName: "Contract_Agreement.pdf",
          fileType: "pdf",
          uploadDate: new Date().toISOString(),
          fileSize: 2456789,
          tags: ["Agreement", "Contract"],
          status: "Unread",
          isRelevant: true,
          isPrivileged: false,
          isKey: true,
          annotations: [],
          sourceZipFile: "legal_documents.zip",
          summary: "This is a legal agreement between ABC Corp and XYZ Inc regarding software licensing terms.",
          keyPoints: [
            "Agreement effective from Jan 15, 2023",
            "2-year term with automatic renewal",
            "Monthly licensing fee of $5,000",
            "Confidentiality clause with 3-year term"
          ],
          entities: {
            people: ["John Smith", "Sarah Johnson", "Michael Williams"],
            organizations: ["ABC Corp", "XYZ Inc", "Legal Department"],
            locations: ["New York", "San Francisco"],
            dates: ["January 15, 2023", "January 15, 2025"]
          }
        },
        // Add more sample documents as needed
      ];
      
      console.log(`Created ${sampleDocuments.length} sample documents`);
      
      // Create sample relationships
      const sampleRelationships: DocumentRelationship[] = [
        {
          sourceId: sampleDocuments[0].id,
          targetId: sampleDocuments[0].id, // Self-reference since we only have one sample
          relationshipType: "referenced",
          strength: 0.8
        },
        // Add more relationships as needed
      ];
      
      console.log(`Created ${sampleRelationships.length} sample relationships`);
      
      // First clear any existing data
      try {
        await clearZipFileData("legal_documents.zip");
        await clearZipFileData("contract_review.zip");
        console.log("Previous demo data cleared");
      } catch (clearError) {
        console.warn("Error clearing previous data:", clearError);
      }
      
      // Then save documents and relationships to storage
      await saveDocuments(sampleDocuments);
      console.log("Sample documents saved to storage");
      
      await saveRelationships(sampleRelationships);
      console.log("Sample relationships saved to storage");
      
      // Save zip file metadata
      for (const zip of demoZips) {
        await saveZipFileMetadata(zip);
        console.log(`Zip metadata saved: ${zip.fileName}`);
      }
      
      // Update state with new zip files
      setAvailableZipFiles(demoZips);
      
      // Set current zip file to the first demo zip
      const targetZipFile = demoZips[0].fileName;
      console.log(`Setting current zip file to: ${targetZipFile}`);
      setCurrentZipFile(targetZipFile);
      
      // Directly add documents to context
      sampleDocuments.forEach(doc => {
        addDocument(doc);
      });
      
      // Directly add relationships to context
      sampleRelationships.forEach(rel => {
        addRelationship(rel);
      });
      
      // Close upload modal if open
      setIsUploadModalOpen(false);
      
      console.log("Demo data loaded successfully", {
        documents: sampleDocuments.length,
        relationships: sampleRelationships.length
      });
    } catch (error) {
      console.error("Error creating demo data:", error);
      alert("There was an error creating the demo data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Empty state - no zip files have been uploaded yet
  if (availableZipFiles.length === 0 && !currentZipFile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          onSearch={handleSearch} 
          onUploadClick={() => setIsUploadModalOpen(true)}
          currentZipFile={currentZipFile}
        />
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
          <div className="text-center max-w-md">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-indigo-100 mb-6">
              <FileUp className="h-10 w-10 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to DocAnalyzer</h1>
            <p className="text-gray-500 mb-6">
              Upload a ZIP file of documents to begin analysing relationships, entities, and key content.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowDownFromLine className="h-5 w-5 mr-2" />
                Upload ZIP File
              </button>
              
              <button
                onClick={createDemoData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FolderOpen className="h-5 w-5 mr-2 text-indigo-500" />
                View Demo Matters
              </button>
            </div>
          </div>
        </div>
        
        {isUploadModalOpen && (
          <UploadModal
            onClose={() => {
              setIsUploadModalOpen(false);
              setSelectedZipFile("");
            }}
            onUpload={handleUploadZip}
            isProcessing={isProcessing}
            processingProgress={processingProgress}
            acceptedFileTypes={['.zip']}
            title="Upload ZIP File"
            description="Upload a ZIP file containing documents to analyse."
          />
        )}
      </div>
    );
  }

  // Welcome screen with existing matters
  if (availableZipFiles.length > 0 && !currentZipFile) {
    console.log("Rendering welcome screen with matter selection");
    // Close any open upload modal when showing the welcome screen
    if (isUploadModalOpen) {
      setIsUploadModalOpen(false);
    }
    
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          onSearch={handleSearch} 
          onUploadClick={() => setIsUploadModalOpen(true)}
          currentZipFile={currentZipFile}
        />
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
          <div className="text-center max-w-md">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-indigo-100 mb-6">
              <FileUp className="h-10 w-10 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to DocAnalyzer</h1>
            <p className="text-gray-500 mb-6">
              Select a previously analysed matter or upload a new ZIP file.
            </p>
            
            {/* Matter selector dropdown */}
            <div className="mb-4">
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  console.log("Dropdown selected:", value);
                  if (value === "new") {
                    setIsUploadModalOpen(true);
                  } else if (value) {
                    console.log("Loading selected zip file:", value);
                    setSelectedZipFile(value);
                    loadDocumentsForZipFile(value);
                  }
                }}
                className="block w-full px-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm text-gray-700"
                value={selectedZipFile || ""}
              >
                <option value="" disabled>Select a previously analysed matter...</option>
                {availableZipFiles.map((zipFile) => (
                  <option key={zipFile.id} value={zipFile.fileName}>
                    {zipFile.fileName} ({zipFile.documentCount} docs)
                  </option>
                ))}
                <option value="new">+ Upload new matter</option>
              </select>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowDownFromLine className="h-5 w-5 mr-2" />
                Upload New ZIP File
              </button>
            </div>
          </div>
        </div>
        
        {isUploadModalOpen && (
          <UploadModal
            onClose={() => {
              setIsUploadModalOpen(false);
              setSelectedZipFile("");
            }}
            onUpload={handleUploadZip}
            isProcessing={isProcessing}
            processingProgress={processingProgress}
            acceptedFileTypes={['.zip']}
            title="Upload ZIP File"
            description="Upload a ZIP file containing documents to analyse."
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onSearch={handleSearch} 
        onUploadClick={() => setIsUploadModalOpen(true)}
        currentZipFile={currentZipFile}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          selectedFilters={selectedFilters} 
          onFilterChange={handleFilterChange}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
              <div className="flex items-center space-x-4">
                {/* Matter selector dropdown */}
                <div>
                  <select
                    value={currentZipFile || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log("Main view dropdown selected:", value);
                      if (value === "new") {
                        setIsUploadModalOpen(true);
                      } else if (value) {
                        console.log("Loading selected zip file from main view:", value);
                        loadDocumentsForZipFile(value);
                      }
                    }}
                    className="block w-60 px-4 py-2 text-base border border-gray-300 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                  >
                    <option value="" disabled>Select a matter...</option>
                    {availableZipFiles.map((zipFile) => (
                      <option key={zipFile.id} value={zipFile.fileName}>
                        {zipFile.fileName} ({zipFile.documentCount} docs)
                      </option>
                    ))}
                    <option value="new">+ Upload new matter</option>
                  </select>
                </div>
                
                {/* View toggle button */}
                {documents.length > 0 && (
                  <button 
                    onClick={() => setShowGraph(!showGraph)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                  >
                    {showGraph ? 'Show Documents' : 'Show Relationships'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Document list or visualization */}
            {isProcessing ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Loading documents...</h3>
                  <p className="text-gray-500">
                    Please wait while we load your documents.
                  </p>
                </div>
              </div>
            ) : documents.length > 0 ? (
              <>
                {!showGraph && (
                  <DocumentList 
                    documents={filteredDocuments}
                    onSelectDocument={handleSelectDocument}
                  />
                )}
                
                {showGraph && (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-[600px]">
                      <RelationshipGraph 
                        documents={documents}
                        relationships={relationships}
                        onSelectDocument={handleSelectDocument}
                        currentDocumentId={currentDocument?.id}
                      />
                    </div>
                  </div>
                )}
                
                {/* Entity analysis when documents are available */}
                <div className="mt-6">
                  <EntityAnalysis 
                    documents={documents}
                    onFilterByEntity={handleEntityFilter}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="flex flex-col items-center">
                  <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
                  <p className="text-gray-500 mb-4">
                    Please upload a ZIP file to begin analysing documents.
                  </p>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ArrowDownFromLine className="h-4 w-4 mr-2" />
                    Upload ZIP File
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {currentDocument && (
        <DocumentViewer 
          document={currentDocument} 
          onClose={handleCloseViewer}
          relatedDocuments={relatedDocuments}
          onSelectRelatedDocument={handleSelectDocument}
          onMarkDocument={(field, value) => {
            markDocumentStatus(currentDocument.id, { [field]: value });
          }}
        />
      )}
      
      {isUploadModalOpen && (
        <UploadModal
          onClose={() => {
            console.log("Closing upload modal");
            setIsUploadModalOpen(false);
            setSelectedZipFile("");
          }}
          onUpload={(file) => {
            console.log("File selected for upload:", file.name);
            handleUploadZip(file);
          }}
          isProcessing={isProcessing}
          processingProgress={processingProgress}
          acceptedFileTypes={['.zip']}
          title="Upload ZIP File"
          description="Upload a ZIP file containing documents to analyse."
        />
      )}
    </div>
  );
}
