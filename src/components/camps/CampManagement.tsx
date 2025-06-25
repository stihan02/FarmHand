import React, { useState } from 'react';
import { CampMap, MinimalMap } from './CampMap';
import { Camp } from '../../types';
import { CampSidebar } from './CampSidebar';
import { useFarm } from '../../context/FarmContext';
import { useIsMobile } from '../../utils/helpers';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Helper: is mobile
  const isMobile = useIsMobile(640);

  return (
    <div style={{
      width: '100%',
      height: '600px',
      backgroundColor: 'white',
      padding: '20px',
      position: 'relative',
    }}>
      <h2>Camp Management</h2>
      <div style={{
        width: '100%',
        height: '400px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px',
        position: 'relative',
      }}>
        <CampMap
          camps={camps}
          onAddCamp={handleAddCamp}
          onDeleteCamp={handleDeleteCamp}
          onViewDetails={camp => {
            const latest = camps.find(c => c.id === camp.id) || camp;
            setSelectedCamp(latest);
            if (isMobile) setSidebarOpen(false); // Don't open sidebar immediately on mobile
          }}
        />
        {/* Floating Details button on mobile */}
        {isMobile && selectedCamp && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-lg text-base font-semibold focus:outline-none"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
          >
            Details
          </button>
        )}
      </div>
      <p>Draw a polygon on the map to add a new camp. You can assign animals to camps later.</p>
      {/* Sidebar: mobile only if sidebarOpen, desktop always if selectedCamp */}
      {selectedCamp && ((isMobile && sidebarOpen) || !isMobile) && (
        <CampSidebar
          camp={selectedCamp}
          onClose={() => {
            if (isMobile) setSidebarOpen(false);
            else setSelectedCamp(null);
          }}
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