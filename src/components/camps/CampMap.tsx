import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, Popup, useMapEvents, Polygon, FeatureGroup, useMap, Tooltip } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { useFarm } from '../../context/FarmContext';
import { Animal } from '../../types';

// Fix default marker icon issue in Leaflet
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const AGRO_API_KEY = '63155c8c2053d6198bc8417573400f94';
const STORAGE_KEY = 'camp_markers';

interface CampMarker {
  lat: number;
  lng: number;
  name: string;
  geoJson?: any;
  id?: number;
}

interface CampMapProps {
  camps: any[];
  onAddCamp: (camp: any) => void;
  onDeleteCamp: (campId: string | number) => void;
  onViewDetails?: (camp: any) => void;
}

const AddMarkerOnClick: React.FC<{ onAdd: (lat: number, lng: number) => void }> = ({ onAdd }) => {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
    mousedown(e) {
    },
  });
  return null;
};

// Minimal event logger for debugging
const ClickLogger = () => {
  useMapEvents({
    click(e) {
    },
    mousedown(e) {
    }
  });
  return null;
};

// Utility to ensure a polygon ring is closed
function closeRing(coords: [number, number][]) {
  if (coords.length < 2) return coords;
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...coords, first];
  }
  return coords;
}

// Utility to calculate polygon area in hectares using turf.js
function calculatePolygonAreaHa(coords: [number, number][]) {
  const closed = closeRing(coords);
  const polygon = turf.polygon([closed]);
  return turf.area(polygon) / 10000; // m^2 to ha
}

// Child component to fit map to all camps
const FitBoundsToCamps: React.FC<{ camps: any[] }> = ({ camps }) => {
  const map = useMap();
  useEffect(() => {
    const bounds: [number, number][] = [];
    camps.forEach(camp => {
      if (
        camp.geoJson &&
        camp.geoJson.geometry &&
        camp.geoJson.geometry.type === 'Polygon' &&
        Array.isArray(camp.geoJson.geometry.coordinates) &&
        Array.isArray(camp.geoJson.geometry.coordinates[0])
      ) {
        camp.geoJson.geometry.coordinates[0].forEach(([lng, lat]: [number, number]) => {
          bounds.push([lat, lng]);
        });
      }
    });
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [camps, map]);
  return null;
};

export const CampMap: React.FC<CampMapProps & { onAnimalClick?: (animal: Animal) => void; onUpdateAnimalPosition?: (animalId: string, campId: string, position: { lat: number, lng: number }) => void }> = (props) => {
  const featureGroupRef = useRef(null);
  const { state } = useFarm();

  // Get animal count for a camp from context
  const getAnimalCount = (campId: string) => state.animals.filter(a => a.campId === campId).length;
  const getOvergrazingWarning = (animalCount: number, areaHa: number) => {
    if (areaHa === 0) return null;
    const density = animalCount / areaHa;
    if (density > 5) return '⚠️ Overgrazing risk!';
    return null;
  };

  // Helper: get centroid of a camp polygon
  const getCampCentroid = (camp: any) => {
    if (
      camp.geoJson &&
      camp.geoJson.geometry &&
      camp.geoJson.geometry.type === 'Polygon' &&
      Array.isArray(camp.geoJson.geometry.coordinates) &&
      Array.isArray(camp.geoJson.geometry.coordinates[0])
    ) {
      const closed = closeRing(camp.geoJson.geometry.coordinates[0]);
      const turfPoly = turf.polygon([closed]);
      const centroid = turf.centroid(turfPoly).geometry.coordinates;
      return { lat: centroid[1], lng: centroid[0] };
    }
    return { lat: 0, lng: 0 };
  };

  // Handler for dragging animal marker
  const handleAnimalDragEnd = useCallback((animal: Animal, campId: string, e: any) => {
    const { lat, lng } = e.target.getLatLng();
    props.onUpdateAnimalPosition && props.onUpdateAnimalPosition(animal.id, campId, { lat, lng });
  }, [props]);

  // Handler for dropping animal into a new camp
  // (This can be implemented with more advanced drag-and-drop if needed)

  // Handler for when a polygon is created
  const handleDrawCreate = (e: any) => {
    if (e.layerType === 'polygon') {
      const name = prompt('Enter camp name:');
      if (name && name.trim() !== '') {
        const latlngs = e.layer.getLatLngs()[0].map((latlng: any) => [latlng.lng, latlng.lat]);
        props.onAddCamp({
          name: name.trim(),
          geoJson: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [latlngs],
            },
          },
        });
      }
    }
  };

  return (
    <div className="w-full h-[70vh] sm:h-full relative z-10">
      <MapContainer
        center={[41.8919, 12.5110]}
        zoom={6}
        className="w-full h-full"
        maxZoom={18}
        minZoom={2}
      >
        <FitBoundsToCamps camps={props.camps} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles © Esri"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleDrawCreate}
            draw={{
              marker: false,
              circle: false,
              rectangle: false,
              polyline: false,
              circlemarker: false,
              polygon: true,
            }}
          />
          {/* Render polygons for each camp */}
          {props.camps.map(camp => (
            camp.geoJson && camp.geoJson.geometry && camp.geoJson.geometry.type === 'Polygon' ? (
              <Polygon
                key={camp.id}
                positions={camp.geoJson.geometry.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng])}
              >
                <Popup>
                  <strong>{camp.name}</strong>
                  <br />
                  Area: {calculatePolygonAreaHa(camp.geoJson.geometry.coordinates[0]).toFixed(2)} ha
                  <br />
                  Animals: {getAnimalCount(camp.id)}
                  <br />
                  {getOvergrazingWarning(getAnimalCount(camp.id), calculatePolygonAreaHa(camp.geoJson.geometry.coordinates[0])) && <span style={{ color: 'red' }}>{getOvergrazingWarning(getAnimalCount(camp.id), calculatePolygonAreaHa(camp.geoJson.geometry.coordinates[0]))}<br /></span>}
                  <button
                    style={{
                      marginTop: 4,
                      color: '#1565c0',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: 15,
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      display: 'inline-block',
                    }}
                    onMouseOver={e => (e.currentTarget.style.color = '#003c8f')}
                    onMouseOut={e => (e.currentTarget.style.color = '#1565c0')}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      props.onViewDetails && props.onViewDetails(camp);
                    }}
                  >
                    View Details
                  </button>
                  <br />
                  <button onClick={() => props.onDeleteCamp(camp.id || 0)} style={{ color: 'red', marginTop: 4 }}>Delete</button>
                </Popup>
                  {/* Render animal markers for this camp */}
                {state.animals.filter(a => a.campId === camp.id && a.status === 'Active').map((animal: Animal) => {
                    // Use animal.position if available, else camp centroid
                    const pos = animal.position || getCampCentroid(camp);
                    return (
                      <Marker
                        key={animal.id}
                        position={[pos.lat, pos.lng]}
                        draggable={true}
                        eventHandlers={{
                        dragend: e => handleAnimalDragEnd(animal, camp.id, e),
                          click: () => props.onAnimalClick && props.onAnimalClick(animal),
                        }}
                      >
                      <Tooltip>{animal.tagNumber}</Tooltip>
                        <Popup>
                        <strong>{animal.tagNumber}</strong>
                        <br />
                        {animal.type} - {animal.breed}
                        <br />
                        Status: {animal.status}
                        </Popup>
                      </Marker>
                    );
                  })}
              </Polygon>
            ) : null
          ))}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

// Minimal map for debugging
export const MinimalMap: React.FC = () => (
  <div style={{ height: '400px', width: '100%' }}>
    <MapContainer
      center={[41.8919, 12.5110]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
    </MapContainer>
  </div>
);