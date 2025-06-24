import React, { useState } from 'react';
import { CampMap, MinimalMap } from './CampMap';
import { Camp } from '../../types';
import { CampSidebar } from './CampSidebar';
import { useFarm } from '../../context/FarmContext';

interface CampMarker {
  lat: number;
  lng: number;
  name: string;
}

interface CampManagementProps {
  camps: Camp[];
  onAddCamp: (camp: Camp) => void;
  onUpdateCamp: (camp: Camp) => void;
  onDeleteCamp: (campId: string) => void;
}

export const CampManagement: React.FC<CampManagementProps> = ({ camps, onAddCamp, onUpdateCamp, onDeleteCamp }) => {
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const { state } = useFarm();

  // Add a new camp from the map (polygon)
  const handleAddCamp = (camp: any) => {
    const newCamp: Camp = {
      id: Date.now().toString(),
      name: camp.name,
      geoJson: camp.geoJson,
      animals: [],
    };
    onAddCamp(newCamp);
  };

  // Delete a camp by id
  const handleDeleteCamp = (campId: string | number) => {
    if (window.confirm('Delete this camp?')) {
      onDeleteCamp(campId.toString());
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '600px',
      backgroundColor: 'white',
      padding: '20px'
    }}>
      <h2>Camp Management</h2>
      <div style={{
        width: '100%',
        height: '400px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <CampMap
          camps={camps}
          onAddCamp={handleAddCamp}
          onDeleteCamp={handleDeleteCamp}
          onViewDetails={camp => {
            const latest = camps.find(c => c.id === camp.id) || camp;
            setSelectedCamp(latest);
          }}
        />
      </div>
      <p>Draw a polygon on the map to add a new camp. You can assign animals to camps later.</p>
      {selectedCamp && (
        <CampSidebar
          camp={selectedCamp}
          onClose={() => setSelectedCamp(null)}
          onUpdateCamp={camp => {
            onUpdateCamp(camp);
            const latest = state.camps.find(c => c.id === camp.id) || camp;
            setSelectedCamp(latest);
          }}
        />
      )}
    </div>
  );
};