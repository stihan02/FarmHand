import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, Popup, useMapEvents, Polygon, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { useFarm } from '../../context/FarmContext';

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
  console.log('AddMarkerOnClick mounted'); // Debug log
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
    mousedown(e) {
      console.log('Map mousedown at:', e.latlng.lat, e.latlng.lng); // Debug log
    },
  });
  return null;
};

// Minimal event logger for debugging
const ClickLogger = () => {
  useMapEvents({
    click(e) {
      console.log('Map click at:', e.latlng);
    },
    mousedown(e) {
      console.log('Map mousedown at:', e.latlng);
    }
  });
  return null;
};

// Utility to calculate polygon area in hectares using turf.js
function calculatePolygonAreaHa(coords: [number, number][]) {
  const polygon = turf.polygon([[...coords, coords[0]]]); // Ensure closed ring
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

export const CampMap: React.FC<CampMapProps> = (props) => {
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
          {props.camps.map((camp, idx) => {
            if (
              !camp.geoJson ||
              !camp.geoJson.geometry ||
              camp.geoJson.geometry.type !== 'Polygon' ||
              !Array.isArray(camp.geoJson.geometry.coordinates) ||
              !Array.isArray(camp.geoJson.geometry.coordinates[0])
            ) {
              return null;
            }
            const areaHa = calculatePolygonAreaHa(camp.geoJson.geometry.coordinates[0]);
            const animalCount = getAnimalCount(camp.id);
            const warning = getOvergrazingWarning(animalCount, areaHa);
            return (
              <Polygon
                key={camp.id || idx}
                positions={camp.geoJson.geometry.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng])}
              >
                <Popup>
                  <strong>{camp.name}</strong>
                  <br />
                  Area: {areaHa.toFixed(2)} ha
                  <br />
                  Animals: {animalCount}
                  <br />
                  {warning && <span style={{ color: 'red' }}>{warning}<br /></span>}
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
                  <button onClick={() => props.onDeleteCamp(camp.id || idx)} style={{ color: 'red', marginTop: 4 }}>Delete</button>
                </Popup>
              </Polygon>
            );
          })}
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