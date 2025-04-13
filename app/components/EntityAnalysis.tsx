'use client';

import React, { useState, useMemo } from 'react';
import { DocumentWithSummary } from '../types';
import { User, Building2, MapPin, Calendar } from 'lucide-react';

interface EntityAnalysisProps {
  documents: DocumentWithSummary[];
  onFilterByEntity?: (entityType: string, entityValue: string) => void;
}

interface EntityCount {
  name: string;
  count: number;
  documents: string[];
}

const EntityAnalysis: React.FC<EntityAnalysisProps> = ({ 
  documents,
  onFilterByEntity 
}) => {
  const [activeTab, setActiveTab] = useState<'people' | 'organizations' | 'locations' | 'dates'>('people');
  
  // Aggregate entities across all documents
  const aggregatedEntities = useMemo(() => {
    const people: Record<string, EntityCount> = {};
    const organizations: Record<string, EntityCount> = {};
    const locations: Record<string, EntityCount> = {};
    const dates: Record<string, EntityCount> = {};
    
    documents.forEach(doc => {
      if (!doc.entities) return;
      
      // Process people
      doc.entities.people.forEach(person => {
        if (!people[person]) {
          people[person] = { name: person, count: 0, documents: [] };
        }
        people[person].count++;
        if (!people[person].documents.includes(doc.id)) {
          people[person].documents.push(doc.id);
        }
      });
      
      // Process organizations
      doc.entities.organizations.forEach(org => {
        if (!organizations[org]) {
          organizations[org] = { name: org, count: 0, documents: [] };
        }
        organizations[org].count++;
        if (!organizations[org].documents.includes(doc.id)) {
          organizations[org].documents.push(doc.id);
        }
      });
      
      // Process locations
      doc.entities.locations.forEach(location => {
        if (!locations[location]) {
          locations[location] = { name: location, count: 0, documents: [] };
        }
        locations[location].count++;
        if (!locations[location].documents.includes(doc.id)) {
          locations[location].documents.push(doc.id);
        }
      });
      
      // Process dates
      doc.entities.dates.forEach(date => {
        if (!dates[date]) {
          dates[date] = { name: date, count: 0, documents: [] };
        }
        dates[date].count++;
        if (!dates[date].documents.includes(doc.id)) {
          dates[date].documents.push(doc.id);
        }
      });
    });
    
    return {
      people: Object.values(people).sort((a, b) => b.count - a.count),
      organizations: Object.values(organizations).sort((a, b) => b.count - a.count),
      locations: Object.values(locations).sort((a, b) => b.count - a.count),
      dates: Object.values(dates).sort((a, b) => b.count - a.count)
    };
  }, [documents]);
  
  const handleEntityClick = (entityType: string, entityValue: string) => {
    if (onFilterByEntity) {
      onFilterByEntity(entityType, entityValue);
    }
  };
  
  const getActiveEntities = () => {
    return aggregatedEntities[activeTab] || [];
  };
  
  const getTabIcon = (tab: 'people' | 'organizations' | 'locations' | 'dates') => {
    switch (tab) {
      case 'people':
        return <User className="h-4 w-4" />;
      case 'organizations':
        return <Building2 className="h-4 w-4" />;
      case 'locations':
        return <MapPin className="h-4 w-4" />;
      case 'dates':
        return <Calendar className="h-4 w-4" />;
    }
  };
  
  const getEntityColor = (count: number) => {
    // Higher count = more intense color
    if (count >= 7) return 'bg-indigo-600 text-white';
    if (count >= 5) return 'bg-indigo-500 text-white';
    if (count >= 3) return 'bg-indigo-400 text-white';
    if (count >= 2) return 'bg-indigo-300 text-indigo-800';
    return 'bg-indigo-200 text-indigo-800';
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">Key Entities</h3>
          <p className="text-sm text-gray-500">People, organizations, places and dates mentioned</p>
        </div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('people')}
              className={`w-1/4 py-3 px-1 text-center border-b-2 text-sm font-medium ${
                activeTab === 'people'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <User className={`h-4 w-4 mr-1 ${activeTab === 'people' ? 'text-indigo-500' : 'text-gray-400'}`} />
                <span>People</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('organizations')}
              className={`w-1/4 py-3 px-1 text-center border-b-2 text-sm font-medium ${
                activeTab === 'organizations'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <Building2 className={`h-4 w-4 mr-1 ${activeTab === 'organizations' ? 'text-indigo-500' : 'text-gray-400'}`} />
                <span>Organizations</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`w-1/4 py-3 px-1 text-center border-b-2 text-sm font-medium ${
                activeTab === 'locations'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <MapPin className={`h-4 w-4 mr-1 ${activeTab === 'locations' ? 'text-indigo-500' : 'text-gray-400'}`} />
                <span>Locations</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('dates')}
              className={`w-1/4 py-3 px-1 text-center border-b-2 text-sm font-medium ${
                activeTab === 'dates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <Calendar className={`h-4 w-4 mr-1 ${activeTab === 'dates' ? 'text-indigo-500' : 'text-gray-400'}`} />
                <span>Dates</span>
              </div>
            </button>
          </nav>
        </div>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        {getActiveEntities().length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No {activeTab} found in the documents</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {getActiveEntities().map((entity) => (
              <button
                key={entity.name}
                onClick={() => handleEntityClick(activeTab, entity.name)}
                className={`px-3 py-1 rounded-full text-sm flex items-center ${getEntityColor(entity.count)}`}
                title={`Appears in ${entity.count} ${entity.count === 1 ? 'document' : 'documents'}`}
              >
                {getTabIcon(activeTab)}
                <span className="ml-1">{entity.name}</span>
                <span className="ml-1 text-xs opacity-80">({entity.count})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityAnalysis; 