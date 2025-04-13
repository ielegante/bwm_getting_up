<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header always visible -->
    <Header 
      :current-zip-file="currentZipFile"
      @search="handleSearch" 
      @upload-click="openUploadModal"
    />
    
    <!-- Main content area -->
    <main class="flex-1 flex">
      <!-- Loading overlay -->
      <div v-if="isLoading" 
           class="absolute inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p class="text-gray-700">Loading...</p>
        </div>
      </div>
      
      <!-- Start screen (empty or select matter) -->
      <div v-if="currentScreen === 'start'" 
           class="w-full flex flex-col items-center justify-center bg-gray-50 p-6">
        <div class="text-center max-w-md">
          <div class="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-indigo-100 mb-6">
            <FileUp class="h-10 w-10 text-indigo-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome to DocAnalyzer</h1>
          
          <template v-if="availableZipFiles.length === 0">
            <!-- No files available -->
            <p class="text-gray-500 mb-6">
              Upload a ZIP file of documents to begin analyzing relationships, entities, and key content.
            </p>
            <div class="flex flex-col space-y-3">
              <button
                @click="openUploadModal"
                class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowDownFromLine class="h-5 w-5 mr-2" />
                Upload ZIP File
              </button>
              
              <button
                @click="loadDemoData"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FolderOpen class="h-5 w-5 mr-2 text-indigo-500" />
                View Demo Matters
              </button>
            </div>
          </template>
          
          <template v-else>
            <!-- Files available to select -->
            <p class="text-gray-500 mb-6">
              Select a previously analyzed matter or upload a new ZIP file.
            </p>
            
            <!-- Matter selector dropdown -->
            <div class="mb-4">
              <select
                v-model="selectedZipFileName"
                class="block w-full px-4 py-3 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm text-gray-700"
              >
                <option value="" disabled>Select a previously analyzed matter...</option>
                <option 
                  v-for="zipFile in availableZipFiles" 
                  :key="zipFile.id" 
                  :value="zipFile.fileName"
                >
                  {{ zipFile.fileName }} ({{ zipFile.documentCount }} docs)
                </option>
                <option value="new">+ Upload new matter</option>
              </select>
            </div>
            
            <div class="flex justify-center space-x-3">
              <button
                @click="selectedZipFileAction"
                class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span v-if="selectedZipFileName === 'new'">
                  <ArrowDownFromLine class="h-5 w-5 mr-2" />
                  Upload New ZIP File
                </span>
                <span v-else-if="selectedZipFileName">
                  <FolderOpen class="h-5 w-5 mr-2" />
                  Load Selected Matter
                </span>
                <span v-else>
                  Select a Matter
                </span>
              </button>
              
              <button
                @click="openUploadModal"
                v-if="selectedZipFileName !== 'new'"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowDownFromLine class="h-5 w-5 mr-2" />
                Upload New ZIP
              </button>
            </div>
          </template>
        </div>
      </div>
      
      <!-- Main document view when documents are loaded -->
      <div v-else-if="currentScreen === 'documents'" class="w-full flex overflow-hidden">
        <!-- Sidebar -->
        <Sidebar 
          :selected-filters="filters"
          @filter-change="handleFilterChange"
        />
        
        <!-- Document content -->
        <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div class="max-w-7xl mx-auto">
            <!-- Header with dropdown -->
            <div class="flex justify-between items-center mb-4">
              <h1 class="text-2xl font-semibold text-gray-900">Documents</h1>
              <div class="flex items-center space-x-4">
                <!-- Matter selector dropdown -->
                <div>
                  <select
                    v-model="selectedZipFileName"
                    @change="handleZipFileChange"
                    class="block w-60 px-4 py-2 text-base border border-gray-300 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                  >
                    <option value="" disabled>Select a matter...</option>
                    <option 
                      v-for="zipFile in availableZipFiles" 
                      :key="zipFile.id" 
                      :value="zipFile.fileName"
                    >
                      {{ zipFile.fileName }} ({{ zipFile.documentCount }} docs)
                    </option>
                    <option value="new">+ Upload new matter</option>
                  </select>
                </div>
                
                <!-- View toggle button -->
                <button 
                  v-if="documents.length > 0"
                  @click="toggleGraphView"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  {{ showGraph ? 'Show Documents' : 'Show Relationships' }}
                </button>
              </div>
            </div>
            
            <!-- Processing indicator -->
            <div v-if="isProcessing" class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div class="flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                <h3 class="text-lg font-medium text-gray-900 mb-1">Processing documents...</h3>
                <p class="text-gray-500">{{ processingMessage }}</p>
                <div v-if="processingProgress > 0" class="w-64 bg-gray-200 rounded-full h-2.5 mt-4">
                  <div class="bg-indigo-600 h-2.5 rounded-full" :style="{ width: `${processingProgress}%` }"></div>
                </div>
              </div>
            </div>
            
            <!-- Document view when documents are available -->
            <template v-else-if="documents.length > 0">
              <!-- Document list view -->
              <DocumentList 
                v-if="!showGraph"
                :documents="filteredDocuments"
                @select-document="openDocument"
              />
              
              <!-- Graph view -->
              <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="h-[600px]">
                  <RelationshipGraph 
                    :documents="documents"
                    :relationships="relationships"
                    :current-document-id="currentDocument?.id"
                    @select-document="openDocument"
                  />
                </div>
              </div>
              
              <!-- Entity analysis -->
              <div class="mt-6">
                <EntityAnalysis 
                  :documents="documents"
                  @filter-by-entity="handleEntityFilter"
                />
              </div>
            </template>
            
            <!-- No documents found -->
            <div v-else class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div class="flex flex-col items-center">
                <FolderOpen class="h-12 w-12 text-gray-400 mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
                <p class="text-gray-500 mb-4">
                  No documents were found for this matter. Please upload another ZIP file.
                </p>
                <button 
                  @click="openUploadModal"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowDownFromLine class="h-4 w-4 mr-2" />
                  Upload ZIP File
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Document viewer overlay -->
    <DocumentViewer 
      v-if="currentDocument"
      :document="currentDocument" 
      :related-documents="relatedDocuments"
      @close="closeDocument"
      @select-related-document="openDocument"
      @mark-document="markDocument"
    />
    
    <!-- Upload modal -->
    <UploadModal
      v-if="showUploadModal"
      :is-processing="isUploading"
      :processing-progress="uploadProgress"
      :accepted-file-types="['.zip']"
      title="Upload ZIP File"
      description="Upload a ZIP file containing documents to analyze."
      @close="closeUploadModal"
      @upload="uploadZipFile"
    />
  </div>
</template>

<script>
import { FileUp, ArrowDownFromLine, FolderOpen } from 'lucide-vue-next';
import { useDocumentsStore } from '~/stores/documents';
import { filterDocuments, generateId } from '~/utils/documentUtils';
import { 
  getAllDocuments,
  getDocumentsByZipFile,
  saveDocuments,
  saveRelationships,
  getAllZipFiles,
  saveZipFileMetadata,
  clearZipFileData,
  getAllRelationships,
  processZipFile
} from '~/utils/inMemoryStorage';
import { testAIService, analyzeDocumentRelationshipsWithAI } from '~/utils/aiIntegration';

export default {
  name: 'DocumentAnalyzer',
  
  components: {
    FileUp,
    ArrowDownFromLine,
    FolderOpen
  },
  
  setup() {
    return {
      store: useDocumentsStore()
    };
  },
  
  data() {
    return {
      // App state
      currentScreen: 'start',   // 'start' or 'documents'
      isLoading: true,          // Initial load state (blocking)
      isProcessing: false,      // Processing indicator (non-blocking)
      processingMessage: '',    // Message shown during processing
      processingProgress: 0,    // Progress percentage (0-100)
      showGraph: false,         // Show relationship graph instead of document list
      
      // Upload modal state
      showUploadModal: false,   // Whether upload modal is visible
      isUploading: false,       // Whether an upload is in progress
      uploadProgress: 0,        // Upload progress percentage
      
      // Document data
      availableZipFiles: [],    // List of available ZIP files
      selectedZipFileName: '',  // Currently selected ZIP file name (in dropdown)
      
      // Search and filters
      searchQuery: '',
      filters: {
        documentTypes: [],
        tags: [],
        status: [],
        isRelevant: null,
        isPrivileged: null,
        isKey: null
      },
      
      // AI capabilities
      hasAICapabilities: false
    };
  },
  
  computed: {
    // Store accessors
    documents() {
      return this.store.documents;
    },
    
    currentDocument() {
      return this.store.currentDocument;
    },
    
    relationships() {
      return this.store.relationships;
    },
    
    currentZipFile() {
      return this.store.currentZipFile;
    },
    
    // Filtered documents based on search and filters
    filteredDocuments() {
      return filterDocuments(this.documents, {
        query: this.searchQuery,
        documentTypes: this.filters.documentTypes,
        tags: this.filters.tags,
        status: this.filters.status,
        isRelevant: this.filters.isRelevant !== null ? this.filters.isRelevant : undefined,
        isPrivileged: this.filters.isPrivileged !== null ? this.filters.isPrivileged : undefined,
        isKey: this.filters.isKey !== null ? this.filters.isKey : undefined
      });
    },
    
    // Relationships for current document
    documentRelationships() {
      if (!this.currentDocument) return [];
      
      return this.relationships.filter(rel => 
        rel.sourceId === this.currentDocument.id || 
        rel.targetId === this.currentDocument.id
      );
    },
    
    // Documents related to current document
    relatedDocuments() {
      if (!this.currentDocument) return [];
      
      return this.documents.filter(doc => 
        this.documentRelationships.some(rel => 
          (rel.sourceId === this.currentDocument.id && rel.targetId === doc.id) ||
          (rel.targetId === this.currentDocument.id && rel.sourceId === doc.id)
        )
      );
    }
  },
  
  watch: {
    // Keep dropdown in sync with current zip file
    currentZipFile(newValue) {
      if (newValue && newValue !== this.selectedZipFileName) {
        this.selectedZipFileName = newValue;
      }
    },
    
    // Update screen when documents change
    documents: {
      handler(newDocuments) {
        if (newDocuments.length > 0 && this.currentScreen === 'start') {
          this.currentScreen = 'documents';
        }
      },
      deep: true
    }
  },
  
  async mounted() {
    console.log('App mounted');
    this.isLoading = true;
    
    try {
      // Load ZIP files and check if we should show files or empty state
      await this.loadAvailableZipFiles();
      
      // Check for AI capabilities in parallel
      this.checkAICapabilities();
      
      // If current zip file is set, load its documents
      if (this.currentZipFile) {
        console.log(`Current zip file already set to ${this.currentZipFile}, loading documents`);
        this.selectedZipFileName = this.currentZipFile;
        await this.loadDocuments(this.currentZipFile);
        this.currentScreen = 'documents';
      } else {
        console.log('No current zip file, showing start screen');
        this.currentScreen = 'start';
      }
    } catch (error) {
      console.error('Error during initialization:', error);
      this.showError('Failed to initialize the application');
    } finally {
      this.isLoading = false;
    }
  },
  
  methods: {
    // ===== CORE DATA OPERATIONS =====
    
    async loadAvailableZipFiles() {
      console.log('Loading available ZIP files...');
      try {
        const zipFiles = await getAllZipFiles();
        console.log(`Found ${zipFiles.length} ZIP files`);
        this.availableZipFiles = zipFiles;
        return zipFiles;
      } catch (error) {
        console.error('Error loading ZIP files:', error);
        this.showError('Failed to load available documents');
        return [];
      }
    },
    
    async loadDocuments(zipFileName) {
      if (!zipFileName) {
        console.warn('No ZIP file name provided to loadDocuments');
        return false;
      }
      
      console.log(`Loading documents for ${zipFileName}...`);
      this.processingMessage = 'Loading documents...';
      this.isProcessing = true;
      
      try {
        // Set the current ZIP file in the store
        this.store.setCurrentZipFile(zipFileName);
        
        // Clear existing documents
        this.store.clearDocuments();
        
        // Load documents for this ZIP file
        const docs = await getDocumentsByZipFile(zipFileName);
        console.log(`Loaded ${docs.length} documents`);
        
        // Add documents to the store
        docs.forEach(doc => {
          this.store.addDocument(doc);
        });
        
        // Load relationships
        const allRelationships = await getAllRelationships();
        const docIds = docs.map(doc => doc.id);
        
        // Filter relevant relationships
        const relevantRelationships = allRelationships.filter(
          rel => docIds.includes(rel.sourceId) || docIds.includes(rel.targetId)
        );
        console.log(`Loaded ${relevantRelationships.length} relationships`);
        
        // Add relationships to the store
        relevantRelationships.forEach(rel => {
          this.store.addRelationship(rel);
        });
        
        // Update UI state
        this.currentScreen = 'documents';
        return true;
      } catch (error) {
        console.error(`Error loading documents for ${zipFileName}:`, error);
        this.showError(`Failed to load documents from ${zipFileName}`);
        return false;
      } finally {
        this.isProcessing = false;
      }
    },
    
    async uploadZipFile(file) {
      if (!file || !file.name.endsWith('.zip')) {
        this.showError('Please select a ZIP file');
        return;
      }
      
      console.log(`Uploading ZIP file: ${file.name}`);
      this.isUploading = true;
      this.uploadProgress = 0;
      this.showUploadModal = false;  // Hide the modal immediately
      this.isProcessing = true;      // Show processing indicator in main view
      this.processingMessage = 'Processing ZIP file...';
      this.currentScreen = 'documents';
      
      try {
        // Process the ZIP file
        const result = await processZipFile(file, progress => {
          this.uploadProgress = progress;
          this.processingProgress = progress;
        });
        
        console.log(`Processed ZIP file with ${result.documents.length} documents`);
        
        // Clear existing documents
        this.store.clearDocuments();
        
        // Add new documents to the store
        result.documents.forEach(doc => {
          this.store.addDocument(doc);
        });
        
        // Add relationships to the store
        result.relationships.forEach(rel => {
          this.store.addRelationship(rel);
        });
        
        // Set current ZIP file
        this.store.setCurrentZipFile(file.name);
        this.selectedZipFileName = file.name;
        
        // Save everything to storage
        await saveDocuments(result.documents);
        await saveRelationships(result.relationships);
        
        // Save ZIP file metadata
        const zipMeta = {
          id: generateId(),
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          documentCount: result.documents.length
        };
        await saveZipFileMetadata(zipMeta);
        
        // Update available ZIP files
        await this.loadAvailableZipFiles();
        
        // If AI capabilities are available, analyze relationships
        if (this.hasAICapabilities) {
          this.processingMessage = 'Analyzing document relationships with AI...';
          await this.analyzeRelationshipsWithAI(result.documents.map(doc => doc.id));
        }
        
        console.log('ZIP upload and processing complete');
      } catch (error) {
        console.error('Error processing ZIP file:', error);
        this.showError('Failed to process ZIP file');
      } finally {
        this.isUploading = false;
        this.isProcessing = false;
      }
    },
    
    async loadDemoData() {
      console.log('Loading demo data...');
      this.isProcessing = true;
      this.processingMessage = 'Generating demo data...';
      this.currentScreen = 'documents';
      
      try {
        // Clear existing data
        this.store.clearDocuments();
        
        // Try to clear existing demo data from storage
        try {
          await clearZipFileData('legal_documents.zip');
          await clearZipFileData('contract_review.zip');
        } catch (error) {
          console.warn('Failed to clear existing demo data (may not exist):', error);
        }
        
        // Create demo ZIP file metadata
        const demoZips = [
          {
            id: generateId(),
            fileName: 'legal_documents.zip',
            uploadDate: new Date().toISOString(),
            documentCount: 5
          }
        ];
        
        // Create demo documents
        const demoDocuments = Array.from({ length: 5 }).map((_, index) => ({
          id: generateId(),
          fileName: `Document_${index + 1}.pdf`,
          fileType: 'pdf',
          fileSize: Math.floor(Math.random() * 1000000) + 500000,
          uploadDate: new Date().toISOString(),
          sourceZipFile: 'legal_documents.zip',
          tags: ['Demo', index % 2 === 0 ? 'Important' : 'Reference'],
          status: index % 3 === 0 ? 'Reviewed' : 'Unread',
          isRelevant: index % 2 === 0,
          isPrivileged: index === 1,
          isKey: index === 0,
          annotations: [],
          summary: `This is a demo document #${index + 1} with sample content.`,
          keyPoints: [
            'Generated for demonstration',
            'Contains sample metadata',
            `Document ID: ${index + 1}`
          ],
          entities: {
            people: ['John Smith', 'Jane Doe'],
            organizations: ['ACME Corp', 'Legal Department'],
            locations: ['New York', 'San Francisco'],
            dates: [new Date().toISOString()]
          }
        }));
        
        // Create demo relationships
        const demoRelationships = [];
        for (let i = 0; i < demoDocuments.length - 1; i++) {
          demoRelationships.push({
            sourceId: demoDocuments[i].id,
            targetId: demoDocuments[i + 1].id,
            relationshipType: i % 2 === 0 ? 'referenced' : 'similar',
            strength: 0.7 + (i * 0.05)
          });
        }
        
        // Save everything to storage
        await saveDocuments(demoDocuments);
        await saveRelationships(demoRelationships);
        for (const zip of demoZips) {
          await saveZipFileMetadata(zip);
        }
        
        // Set current ZIP file
        const targetZip = demoZips[0].fileName;
        this.store.setCurrentZipFile(targetZip);
        this.selectedZipFileName = targetZip;
        
        // Add to store
        demoDocuments.forEach(doc => {
          this.store.addDocument(doc);
        });
        demoRelationships.forEach(rel => {
          this.store.addRelationship(rel);
        });
        
        // Update available ZIP files
        await this.loadAvailableZipFiles();
        
        console.log('Demo data loaded successfully');
      } catch (error) {
        console.error('Error loading demo data:', error);
        this.showError('Failed to load demo data');
      } finally {
        this.isProcessing = false;
      }
    },
    
    async analyzeRelationshipsWithAI(documentIds) {
      try {
        const result = await analyzeDocumentRelationshipsWithAI(documentIds);
        
        // Add AI-generated relationships to the store
        result.relationships.forEach(rel => {
          this.store.addRelationship(rel);
        });
        
        // Save to storage
        await saveRelationships(result.relationships);
        
        return true;
      } catch (error) {
        console.error('Error analyzing relationships with AI:', error);
        return false;
      }
    },
    
    async checkAICapabilities() {
      try {
        this.hasAICapabilities = await testAIService();
        console.log(`AI capabilities ${this.hasAICapabilities ? 'available' : 'unavailable'}`);
      } catch (error) {
        console.error('Error checking AI capabilities:', error);
        this.hasAICapabilities = false;
      }
    },
    
    // ===== UI EVENT HANDLERS =====
    
    // Handle search query update
    handleSearch(query) {
      this.searchQuery = query;
    },
    
    // Handle filter changes from sidebar
    handleFilterChange(filterType, value) {
      if (['isRelevant', 'isPrivileged', 'isKey'].includes(filterType)) {
        this.filters[filterType] = typeof value === 'boolean' ? value : null;
      } else {
        const current = this.filters[filterType];
        if (current.includes(value)) {
          this.filters[filterType] = current.filter(item => item !== value);
        } else {
          this.filters[filterType] = [...current, value];
        }
      }
    },
    
    // Handle entity filter from EntityAnalysis
    handleEntityFilter(entityType, entityValue) {
      this.searchQuery = entityValue;
    },
    
    // Toggle between document list and graph view
    toggleGraphView() {
      this.showGraph = !this.showGraph;
    },
    
    // Open a document in the viewer
    openDocument(documentOrId) {
      const docId = typeof documentOrId === 'string' ? documentOrId : documentOrId.id;
      const doc = this.documents.find(d => d.id === docId);
      if (doc) {
        this.store.setCurrentDocument(doc);
      }
    },
    
    // Close the document viewer
    closeDocument() {
      this.store.setCurrentDocument(null);
    },
    
    // Mark a document with a status
    markDocument(documentId, field, value) {
      this.store.markDocumentStatus(documentId, { [field]: value });
    },
    
    // Handle ZIP file selection from dropdown in document view
    handleZipFileChange() {
      this.selectedZipFileAction();
    },
    
    // Handle action for selected ZIP file (common logic for start and documents screens)
    selectedZipFileAction() {
      const selected = this.selectedZipFileName;
      
      if (!selected) {
        return; // No action if nothing selected
      }
      
      if (selected === 'new') {
        // Open upload modal
        this.openUploadModal();
        // Reset selection to current ZIP file or empty
        this.selectedZipFileName = this.currentZipFile || '';
      } else if (selected !== this.currentZipFile) {
        // Load different ZIP file
        this.loadDocuments(selected);
      }
    },
    
    // Open upload modal
    openUploadModal() {
      this.showUploadModal = true;
    },
    
    // Close upload modal
    closeUploadModal() {
      this.showUploadModal = false;
      // Reset any upload state
      this.isUploading = false;
      this.uploadProgress = 0;
      // Restore previous selection if applicable
      this.selectedZipFileName = this.currentZipFile || '';
    },
    
    // Show error message
    showError(message) {
      alert(message);
    }
  }
};
</script>

<style scoped>
/* Any component-specific styles would go here */
</style> 