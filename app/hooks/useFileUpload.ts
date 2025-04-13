'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Document } from '../types';
import { useDocuments } from '../context/DocumentContext';

interface FileUploadHook {
  uploading: boolean;
  progress: number;
  uploadFile: (file: File) => Promise<void>;
  error: string | null;
}

export function useFileUpload(): FileUploadHook {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { addDocument } = useDocuments();

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95;
            }
            return prev + 5;
          });
        }, 100);

        // In a real application, you would use an API call here
        // For this demo, we'll simulate an upload delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Clear the progress interval
        clearInterval(progressInterval);
        setProgress(100);

        // Create a new document object
        const newDocument: Document = {
          id: uuidv4(),
          fileName: file.name,
          fileType: file.type,
          uploadDate: new Date().toISOString(),
          uploadedBy: 'Jane Smith', // In a real app, this would come from the current user
          fileSize: file.size,
          tags: [],
          status: 'Unread',
          annotations: [],
        };

        // Add the document to the context
        addDocument(newDocument);

        // Simulate completion delay
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
      } catch (err) {
        setError('Failed to upload file. Please try again.');
        setUploading(false);
        setProgress(0);
      }
    },
    [addDocument]
  );

  return {
    uploading,
    progress,
    uploadFile,
    error,
  };
} 