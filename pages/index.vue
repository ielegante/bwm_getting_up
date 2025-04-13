<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <FileText class="h-8 w-8 text-indigo-600" />
            </div>
            <h1 class="ml-3 text-2xl font-bold text-gray-900">DocAnalyzer</h1>
          </div>
          <div class="flex items-center space-x-4">
            <input 
              v-if="activeTab === 'documents'"
              v-model="searchQuery"
              placeholder="Search documents..." 
              class="w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button 
              v-if="activeTab === 'documents'"
              @click="openUploadModal"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowUpFromLine class="h-4 w-4 mr-2" />
              Upload New
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main tabs for welcome/documents view -->
    <div v-if="!isLoading" class="flex-1 flex flex-col">
      <!-- Tab navigation -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav class="flex -mb-px">
            <button 
              @click="switchToWelcomeTab"
              class="py-4 px-6 text-center border-b-2 font-medium text-sm"
              :class="activeTab === 'welcome' ? 
                'border-indigo-500 text-indigo-600' : 
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Welcome
            </button>
            <button 
              @click="switchToDocumentsTab" 
              class="py-4 px-6 text-center border-b-2 font-medium text-sm"
              :class="[
                activeTab === 'documents' ? 
                  'border-indigo-500 text-indigo-600' : 
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                documents.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              ]"
              :disabled="documents.length === 0"
            >
              Documents
            </button>
          </nav>
        </div>
      </div>

      <!-- Welcome tab content -->
      <div v-if="activeTab === 'welcome'" class="flex-1 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
            <div class="text-center mb-8">
              <div class="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
                <FileUp class="h-10 w-10 text-indigo-600" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900">Welcome to DocAnalyzer</h2>
              <p class="mt-2 text-gray-500">Analyze document relationships, entities, and key content.</p>
            </div>

            <!-- Two column layout -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Upload new ZIP column -->
              <div class="flex flex-col h-full">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Upload New Matter</h3>
                <div class="flex-1 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center">
                  <FileUp class="h-12 w-12 text-gray-400 mb-3" />
                  <p class="text-sm text-gray-500 text-center mb-4">
                    Upload a ZIP file containing documents to analyze
                  </p>
                  <button
                    @click="openUploadModal"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ArrowUpFromLine class="h-4 w-4 mr-2" />
                    Upload ZIP File
                  </button>
                </div>
              </div>

              <!-- Select previous matter column -->
              <div class="flex flex-col h-full">
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                  {{ availableZipFiles.length > 0 ? 'Select Previous Matter' : 'Demo Matters' }}
                </h3>
                
                <div v-if="availableZipFiles.length > 0" class="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div class="mb-5">
                    <label for="matter-select" class="block text-sm font-medium text-gray-700 mb-1">
                      Choose a matter to analyze:
                    </label>
                    <select
                      id="matter-select"
                      v-model="selectedZipFileName"
                      class="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      :disabled="isSelectingMatter"
                    >
                      <option value="" disabled>Select a matter...</option>
                      <option 
                        v-for="zipFile in availableZipFiles" 
                        :key="zipFile.id" 
                        :value="zipFile.fileName"
                      >
                        {{ zipFile.fileName }} ({{ zipFile.documentCount }} docs)
                      </option>
                    </select>
                  </div>
                  
                  <button
                    @click="loadSelectedMatter"
                    class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    :disabled="isSelectingMatter || !selectedZipFileName"
                  >
                    <div v-if="isSelectingMatter" class="flex items-center">
                      <div class="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Loading...
                    </div>
                    <template v-else>
                      <FolderOpen class="h-4 w-4 mr-2" />
                      Load Selected Matter
                    </template>
                  </button>
                </div>

                <div v-else class="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <p class="text-sm text-gray-500 mb-4">
                    No previous matters found. You can load demo data to see how the analysis works.
                  </p>
                  <button
                    @click="loadDemoData"
                    :disabled="isLoading || isProcessing"
                    class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FolderOpen class="h-4 w-4 mr-2" />
                    View Demo Matters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents tab content -->
      <div v-else-if="activeTab === 'documents'" class="flex-1 flex overflow-hidden">
        <!-- Sidebar -->
        <Sidebar 
          :selected-filters="filters"
          @filter-change="handleFilterChange"
        />
        
        <!-- Document content -->
        <div class="flex-1 overflow-y-auto bg-gray-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center">
                <h2 class="text-xl font-semibold text-gray-900">
                  {{ currentZipFile ? currentZipFile : 'Documents' }}
                </h2>
                <span v-if="documents.length > 0" class="ml-2 text-sm text-gray-500">
                  ({{ documents.length }} documents)
                </span>
              </div>
              
              <div class="flex items-center space-x-3">
                <!-- Matter selector dropdown -->
                <div v-if="availableZipFiles.length > 1">
                  <select
                    v-model="selectedZipFileName"
                    @change="handleMatterChange"
                    class="block w-60 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    :disabled="isSelectingMatter"
                  >
                    <option 
                      v-for="zipFile in availableZipFiles" 
                      :key="zipFile.id" 
                      :value="zipFile.fileName"
                    >
                      {{ zipFile.fileName }} ({{ zipFile.documentCount }} docs)
                    </option>
                  </select>
                </div>
                
                <!-- View toggle button -->
                <button 
                  v-if="documents.length > 0"
                  @click="toggleGraphView"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  <ArrowUpFromLine class="h-4 w-4 mr-2" />
                  Upload ZIP File
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Application loading state -->
    <div v-else class="flex-1 flex items-center justify-center bg-gray-50">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p class="text-gray-700">Loading application...</p>
      </div>
    </div>
    
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
      :disabled="isUploading"
    />
  </div>
</template>

<script>
import { 
  FileUp, 
  ArrowUpFromLine, 
  ArrowDownFromLine,
  FolderOpen, 
  FileText
} from 'lucide-vue-next';
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
    ArrowUpFromLine,
    ArrowDownFromLine,
    FolderOpen,
    FileText
  },
  
  setup() {
    return {
      store: useDocumentsStore()
    };
  },
  
  data() {
    return {
      // Tab state
      activeTab: 'welcome',     // 'welcome' or 'documents'
      
      // App state
      isLoading: true,          // Initial load state (blocking)
      isProcessing: false,      // Processing indicator (non-blocking)
      isSelectingMatter: false, // Specifically for matter selection
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
      hasAICapabilities: false,
      
      // Error handling
      lastError: null
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
    
    // Switch to documents tab when documents are available
    documents(newDocuments) {
      if (newDocuments.length > 0 && this.activeTab === 'welcome') {
        this.activeTab = 'documents';
      }
    }
  },
  
  async mounted() {
    console.log('App mounted');
    this.isLoading = true;
    
    try {
      // Load ZIP files
      await this.loadAvailableZipFiles();
      
      // Check for AI capabilities in parallel
      this.checkAICapabilities();
      
      // If current zip file is set, load its documents
      if (this.currentZipFile) {
        console.log(`Current zip file already set to ${this.currentZipFile}, loading documents`);
        this.selectedZipFileName = this.currentZipFile;
        await this.loadDocuments(this.currentZipFile);
        this.activeTab = 'documents';
      } else {
        console.log('No current zip file, showing welcome tab');
        this.activeTab = 'welcome';
      }
    } catch (error) {
      console.error('Error during initialization:', error);
      this.showError('Failed to initialize the application');
    } finally {
      this.isLoading = false;
    }
  },
  
  methods: {
    // ===== TAB NAVIGATION =====
    
    switchToWelcomeTab() {
      this.activeTab = 'welcome';
    },
    
    switchToDocumentsTab() {
      if (this.documents.length > 0) {
        this.activeTab = 'documents';
      }
    },
    
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
        // Clear existing documents first
        this.store.clearDocuments();
        
        // Set the current ZIP file in the store
        this.store.setCurrentZipFile(zipFileName);
        
        // Load documents for this ZIP file
        const docs = await getDocumentsByZipFile(zipFileName);
        console.log(`Loaded ${docs.length} documents`);
        
        if (docs.length === 0) {
          console.warn(`No documents found for ${zipFileName}`);
          return false;
        }
        
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
      this.activeTab = 'documents';  // Switch to documents tab to show progress
      
      try {
        // Process the ZIP file
        const result = await processZipFile(file, progress => {
          this.uploadProgress = progress;
          this.processingProgress = progress;
        });
        
        // Make sure we have documents
        if (!result || !result.documents || result.documents.length === 0) {
          throw new Error('No documents found in ZIP file');
        }
        
        console.log(`Processed ZIP file with ${result.documents.length} documents`);
        
        // Clear existing documents
        this.store.clearDocuments();
        
        // Add new documents to the store
        result.documents.forEach(doc => {
          this.store.addDocument(doc);
        });
        
        // Add relationships to the store
        if (result.relationships && result.relationships.length > 0) {
          result.relationships.forEach(rel => {
            this.store.addRelationship(rel);
          });
        }
        
        // Set current ZIP file
        this.store.setCurrentZipFile(file.name);
        this.selectedZipFileName = file.name;
        
        // Save everything to storage
        await saveDocuments(result.documents);
        if (result.relationships && result.relationships.length > 0) {
          await saveRelationships(result.relationships);
        }
        
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
        this.showError(`Failed to process ZIP file: ${error.message || 'Unknown error'}`);
        
        // If no documents loaded, go back to welcome tab
        if (this.documents.length === 0) {
          this.activeTab = 'welcome';
        }
      } finally {
        this.isUploading = false;
        this.isProcessing = false;
      }
    },
    
    async loadDemoData() {
      console.log('Loading demo data...');
      this.isProcessing = true;
      this.processingMessage = 'Generating demo data...';
      this.activeTab = 'documents';
      
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
            fileName: 'Demo Legal Matter',
            uploadDate: new Date().toISOString(),
            documentCount: 5
          }
        ];
        
        // Create demo documents
        const demoDocuments = Array.from({ length: 5 }).map((_, index) => ({
          id: generateId(),
          fileName: `Legal Document ${index + 1}.pdf`,
          fileType: 'pdf',
          fileSize: Math.floor(Math.random() * 1000000) + 500000,
          uploadDate: new Date().toISOString(),
          sourceZipFile: 'Demo Legal Matter',
          tags: ['Demo', index % 2 === 0 ? 'Important' : 'Reference'],
          status: index % 3 === 0 ? 'Reviewed' : 'Unread',
          isRelevant: index % 2 === 0,
          isPrivileged: index === 1,
          isKey: index === 0,
          annotations: [],
          summary: `This is a demo legal document with sample content related to ${index % 2 === 0 ? 'contract terms' : 'case filings'}.`,
          keyPoints: [
            'Generated for demonstration purposes',
            'Contains sample legal metadata',
            `Priority level: ${index % 3 === 0 ? 'High' : index % 3 === 1 ? 'Medium' : 'Low'}`
          ],
          entities: {
            people: ['John Smith', 'Jane Doe', 'Robert Johnson'],
            organizations: ['ACME Corp', 'Legal Department', 'Smith & Associates'],
            locations: ['New York', 'San Francisco', 'Chicago'],
            dates: [
              new Date(Date.now() - (index * 30 * 24 * 60 * 60 * 1000)).toISOString()
            ]
          }
        }));
        
        // Create demo relationships
        const demoRelationships = [];
        
        // Each document relates to at least one other
        for (let i = 0; i < demoDocuments.length; i++) {
          // Create a relationship to the next document (circular for the last one)
          const targetIndex = (i + 1) % demoDocuments.length;
          demoRelationships.push({
            sourceId: demoDocuments[i].id,
            targetId: demoDocuments[targetIndex].id,
            relationshipType: i % 2 === 0 ? 'referenced' : 'similar',
            strength: 0.7 + (i * 0.05)
          });
          
          // Add a second relationship for some documents
          if (i % 2 === 0) {
            const secondTarget = (i + 2) % demoDocuments.length;
            demoRelationships.push({
              sourceId: demoDocuments[i].id,
              targetId: demoDocuments[secondTarget].id,
              relationshipType: 'mentioned',
              strength: 0.5 + (i * 0.03)
            });
          }
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
        this.activeTab = 'welcome';
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
    
    // Load the selected matter
    async loadSelectedMatter() {
      if (!this.selectedZipFileName) return;
      
      this.isSelectingMatter = true;
      
      try {
        const success = await this.loadDocuments(this.selectedZipFileName);
        
        if (success) {
          this.activeTab = 'documents';
        } else {
          this.showError(`No documents found in ${this.selectedZipFileName}`);
        }
      } catch (error) {
        console.error('Error loading selected matter:', error);
        this.showError(`Failed to load ${this.selectedZipFileName}`);
      } finally {
        this.isSelectingMatter = false;
      }
    },
    
    // Handle dropdown change in documents view
    async handleMatterChange() {
      if (this.selectedZipFileName && this.selectedZipFileName !== this.currentZipFile) {
        this.isSelectingMatter = true;
        
        try {
          await this.loadDocuments(this.selectedZipFileName);
        } catch (error) {
          console.error('Error changing matter:', error);
          this.showError(`Failed to load ${this.selectedZipFileName}`);
          this.selectedZipFileName = this.currentZipFile || '';
        } finally {
          this.isSelectingMatter = false;
        }
      }
    },
    
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
    },
    
    // Show error message
    showError(message) {
      this.lastError = message;
      console.error(message);
      alert(message);
    }
  }
};
</script>

<style scoped>
/* Any component-specific styles would go here */
</style> 