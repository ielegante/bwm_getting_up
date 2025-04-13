'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileUp } from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (file: File) => void;
  isProcessing: boolean;
  processingProgress: number;
  acceptedFileTypes?: string[];
  title: string;
  description: string;
}

const UploadModal: React.FC<UploadModalProps> = ({
  onClose,
  onUpload,
  isProcessing,
  processingProgress,
  acceptedFileTypes = ['.zip'],
  title,
  description
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear file selection when modal opens
  useEffect(() => {
    setFile(null);
  }, []);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFileType(droppedFile)) {
        setFile(droppedFile);
      } else {
        alert(`Please upload a file with one of these extensions: ${acceptedFileTypes.join(', ')}`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile);
      } else {
        alert(`Please upload a file with one of these extensions: ${acceptedFileTypes.join(', ')}`);
      }
    }
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
    }
  };
  
  const isValidFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return acceptedFileTypes.some(type => fileName.endsWith(type));
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {description}
                </p>
              </div>

              {isProcessing ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Processing your file...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">{processingProgress}%</p>
                </div>
              ) : (
                <>
                  <div 
                    className={`mt-4 border-2 border-dashed rounded-lg p-6 ${
                      dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <FileUp className="h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm font-medium text-gray-700">
                        Drag and drop your file here, or
                        <button
                          type="button"
                          className="ml-1 text-indigo-600 hover:text-indigo-500 focus:outline-none"
                          onClick={handleButtonClick}
                        >
                          browse
                        </button>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {acceptedFileTypes.join(', ')} (max 100MB)
                      </p>
                      <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept={acceptedFileTypes.join(',')}
                      />
                    </div>
                  </div>

                  {file && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileUp className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-700 flex-1 truncate">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            {isProcessing ? (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-300 text-base font-medium text-gray-700 sm:ml-3 sm:w-auto sm:text-sm cursor-not-allowed"
                disabled
              >
                Processing...
              </button>
            ) : (
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                  file ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                } text-base font-medium sm:ml-3 sm:w-auto sm:text-sm`}
                onClick={handleUpload}
                disabled={!file}
              >
                Upload
              </button>
            )}
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal; 