'use client';

import React, { useEffect, useRef } from 'react';
import { DocumentWithSummary, DocumentRelationship } from '../types';

interface RelationshipGraphProps {
  documents: DocumentWithSummary[];
  relationships: DocumentRelationship[];
  onSelectDocument: (documentId: string) => void;
  currentDocumentId?: string;
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  documents,
  relationships,
  onSelectDocument,
  currentDocumentId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || documents.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate positions (simple force-directed layout)
    const nodePositions = calculateNodePositions(documents, relationships, canvas.width, canvas.height, currentDocumentId);

    // Draw connections first (so they're behind the nodes)
    ctx.lineWidth = 1;
    relationships.forEach(rel => {
      const sourcePos = nodePositions[rel.sourceId];
      const targetPos = nodePositions[rel.targetId];
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        
        // Style based on relationship type
        switch (rel.relationshipType) {
          case 'referenced':
            ctx.strokeStyle = 'rgba(75, 85, 99, 0.6)'; // gray
            ctx.setLineDash([5, 3]);
            break;
          case 'similar':
            ctx.strokeStyle = 'rgba(79, 70, 229, 0.6)'; // indigo
            ctx.setLineDash([]);
            break;
          case 'sequential':
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)'; // green
            ctx.setLineDash([]);
            break;
          default:
            ctx.strokeStyle = 'rgba(107, 114, 128, 0.4)'; // light gray
            ctx.setLineDash([]);
        }
        
        // Thicker lines for stronger relationships
        ctx.lineWidth = 1 + (rel.strength * 2);
        
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw nodes
    documents.forEach(doc => {
      const pos = nodePositions[doc.id];
      if (!pos) return;

      const radius = doc.id === currentDocumentId ? 12 : 8;
      
      // Node fill color based on document status
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      
      if (doc.id === currentDocumentId) {
        // Current document has a glow effect
        ctx.shadowColor = 'rgba(79, 70, 229, 0.7)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgb(79, 70, 229)'; // indigo
      } else if (doc.isKey) {
        ctx.fillStyle = 'rgb(245, 158, 11)'; // amber
      } else if (doc.isRelevant) {
        ctx.fillStyle = 'rgb(16, 185, 129)'; // green
      } else if (doc.isPrivileged) {
        ctx.fillStyle = 'rgb(239, 68, 68)'; // red
      } else {
        ctx.fillStyle = 'rgb(107, 114, 128)'; // gray
      }
      
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Draw border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw document type indicator
      if (doc.fileType.includes('pdf')) {
        drawFileIcon(ctx, pos.x, pos.y, 'pdf');
      } else if (doc.fileType.includes('word') || doc.fileType.includes('doc')) {
        drawFileIcon(ctx, pos.x, pos.y, 'doc');
      } else if (doc.fileType.includes('xls') || doc.fileType.includes('spreadsheet')) {
        drawFileIcon(ctx, pos.x, pos.y, 'xls');
      } else if (doc.fileType.includes('email') || doc.fileType.includes('message')) {
        drawFileIcon(ctx, pos.x, pos.y, 'email');
      }
    });

    // Add tooltips and click handling
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if click is on a node
      for (const doc of documents) {
        const pos = nodePositions[doc.id];
        if (!pos) continue;
        
        const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
        if (distance <= 12) { // slightly larger hit area than visual size
          onSelectDocument(doc.id);
          break;
        }
      }
    };
    
    canvas.addEventListener('click', handleCanvasClick);
    
    // Show tooltips on hover
    const tooltip = document.createElement('div');
    tooltip.className = 'bg-gray-800 text-white text-xs rounded py-1 px-2 absolute pointer-events-none opacity-0 transition-opacity';
    tooltip.style.zIndex = '50';
    canvas.parentNode?.appendChild(tooltip);
    
    const handleCanvasHover = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      let hoveredDoc: DocumentWithSummary | null = null;
      
      // Check if hover is on a node
      for (const doc of documents) {
        const pos = nodePositions[doc.id];
        if (!pos) continue;
        
        const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
        if (distance <= 10) {
          hoveredDoc = doc;
          break;
        }
      }
      
      if (hoveredDoc) {
        tooltip.textContent = hoveredDoc.fileName;
        tooltip.style.opacity = '1';
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY - 30}px`;
        canvas.style.cursor = 'pointer';
      } else {
        tooltip.style.opacity = '0';
        canvas.style.cursor = 'default';
      }
    };
    
    canvas.addEventListener('mousemove', handleCanvasHover);
    
    // Cleanup event listeners when component unmounts
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mousemove', handleCanvasHover);
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    };
  }, [documents, relationships, currentDocumentId, onSelectDocument]);

  // Simple file type icon drawing
  const drawFileIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string) => {
    ctx.fillStyle = 'white';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw just the first 3 letters of the file type
    ctx.fillText(type.substring(0, 3).toUpperCase(), x, y);
  };

  // Calculate node positions using a simple force-directed layout
  const calculateNodePositions = (
    docs: DocumentWithSummary[], 
    rels: DocumentRelationship[],
    width: number,
    height: number,
    currentId?: string
  ) => {
    const positions: Record<string, {x: number, y: number}> = {};
    
    // Start with random positions
    docs.forEach(doc => {
      positions[doc.id] = {
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50
      };
    });
    
    // If there's a current document, place it in the center
    if (currentId && positions[currentId]) {
      positions[currentId] = { x: width / 2, y: height / 2 };
    }
    
    // Simple physics simulation (just a few iterations for performance)
    const iterations = 30;
    const repulsionForce = 300;
    const attractionForce = 0.05;
    
    for (let i = 0; i < iterations; i++) {
      // Apply repulsion between all nodes
      for (let j = 0; j < docs.length; j++) {
        for (let k = j + 1; k < docs.length; k++) {
          const id1 = docs[j].id;
          const id2 = docs[k].id;
          
          const pos1 = positions[id1];
          const pos2 = positions[id2];
          
          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          
          const distanceSq = dx * dx + dy * dy;
          const distance = Math.sqrt(distanceSq);
          
          if (distance > 0) {
            // Repulsive force is inversely proportional to distance
            const force = repulsionForce / distanceSq;
            const fx = force * dx / distance;
            const fy = force * dy / distance;
            
            positions[id1].x -= fx;
            positions[id1].y -= fy;
            positions[id2].x += fx;
            positions[id2].y += fy;
          }
        }
      }
      
      // Apply attraction along relationships
      rels.forEach(rel => {
        const pos1 = positions[rel.sourceId];
        const pos2 = positions[rel.targetId];
        
        if (pos1 && pos2) {
          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            // Stronger relationships have stronger attraction
            const force = attractionForce * distance * rel.strength;
            const fx = force * dx / distance;
            const fy = force * dy / distance;
            
            positions[rel.sourceId].x += fx;
            positions[rel.sourceId].y += fy;
            positions[rel.targetId].x -= fx;
            positions[rel.targetId].y -= fy;
          }
        }
      });
      
      // Keep nodes within bounds
      for (const id in positions) {
        positions[id].x = Math.max(30, Math.min(width - 30, positions[id].x));
        positions[id].y = Math.max(30, Math.min(height - 30, positions[id].y));
      }
      
      // If there's a current document, keep it closer to the center
      if (currentId && positions[currentId]) {
        positions[currentId].x = (positions[currentId].x + width / 2) / 2;
        positions[currentId].y = (positions[currentId].y + height / 2) / 2;
      }
    }
    
    return positions;
  };

  return (
    <div className="h-full w-full bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Document Relationships</h3>
        <p className="text-sm text-gray-500">Visualizing connections between documents</p>
      </div>
      <div className="p-4 h-[calc(100%-4rem)]">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ touchAction: 'none' }}
        />
      </div>
      <div className="p-3 border-t border-gray-200 flex items-center justify-center text-xs text-gray-500 space-x-4">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-500 mr-1"></span>
          <span>Standard</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
          <span>Relevant</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
          <span>Privileged</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
          <span>Key</span>
        </div>
      </div>
    </div>
  );
};

export default RelationshipGraph; 