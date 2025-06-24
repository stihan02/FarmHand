import React, { useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { useFarm } from '../../context/FarmContext';
import { Camp } from '../../types';
import { differenceInDays, parseISO } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

const UNIT_INFO = {
  LSU: 'Large Stock Unit (e.g., 1 cow, 1 horse, 5 donkeys, 7 pigs)',
  SSU: 'Small Stock Unit (e.g., 1 sheep, 1 goat, 2 ostriches, 10 pigs)',
};

function normalizeRates(rates: any): { LSU: number; SSU: number } {
  return {
    LSU: typeof rates?.LSU === 'number' ? rates.LSU : 0.1,
    SSU: typeof rates?.SSU === 'number' ? rates.SSU : 0.5,
  };
}

export const CampSidebar: React.FC<{ camp: Camp; onClose: () => void; onUpdateCamp?: (camp: Camp) => void }> = ({ camp, onClose, onUpdateCamp }) => {
  // Calculate area in ha if available
  let areaHa = 0;
  if (camp.geoJson && camp.geoJson.geometry && camp.geoJson.geometry.type === 'Polygon') {
    areaHa = turf.area({ ...camp.geoJson, properties: {} }) / 10000;
  }

  // Get animals in this camp from context
  const { state } = useFarm();
  const animalsInCamp = state.animals.filter(a => a.campId === camp.id);

  // For demo, group all animals as LSU or SSU by type
  const lsuTypes = ['Cattle', 'Horse'];
  const ssuTypes = ['Sheep', 'Goat', 'Pig'];
  const lsuCount = animalsInCamp.filter(a => lsuTypes.includes(a.type)).length;
  const ssuCount = animalsInCamp.filter(a => ssuTypes.includes(a.type)).length;

  // Stocking rates: LSU per ha, SSU per ha
  const [stockingRates, setStockingRates] = useState<{ LSU: number; SSU: number }>(
    normalizeRates(camp.recommendedStockingRates)
  );

  useEffect(() => {
    setStockingRates(normalizeRates(camp.recommendedStockingRates));
  }, [camp]);

  const handleRateChange = (key: 'LSU' | 'SSU', value: string) => {
    const num = parseFloat(value);
    setStockingRates(rates => ({ ...rates, [key]: isNaN(num) ? 0 : num }));
  };
  const handleSaveRates = () => {
    if (onUpdateCamp) {
      const updatedCamp = { ...camp, recommendedStockingRates: normalizeRates(stockingRates) };
      console.log('Saving camp with updated rates:', updatedCamp);
      onUpdateCamp(updatedCamp);
    }
  };

  const lsuMax = areaHa * (1 / (stockingRates.LSU || 1));
  const ssuMax = areaHa * (1 / (stockingRates.SSU || 1));
  const lsuOver = stockingRates.LSU > 0 && lsuCount > lsuMax;
  const ssuOver = stockingRates.SSU > 0 && ssuCount > ssuMax;

  // Grazing duration summary for animals in camp
  const getGrazingDurationDays = (animal: { history: { date: string; description: string }[] }) => {
    const moveEvents = animal.history
      .filter((e: { description: string }) => e.description.includes('Moved from camp'))
      .reverse();
    for (const event of moveEvents) {
      if (event.description.endsWith(`to ${camp.id}`)) {
        return differenceInDays(new Date(), parseISO(event.date));
      }
    }
    return null;
  };
  const grazingDurations = animalsInCamp
    .map(getGrazingDurationDays)
    .filter((d: number | null) => d !== null);
  const minGrazing = grazingDurations.length ? Math.min(...grazingDurations) : null;
  const maxGrazing = grazingDurations.length ? Math.max(...grazingDurations) : null;
  const avgGrazing = grazingDurations.length ? Math.round(grazingDurations.reduce((a, b) => a + b, 0) / grazingDurations.length) : null;

  // Inbreeding and biosecurity alert logic for sidebar
  const getInbreedingAlert = (animal: any) => {
    if (!animal.campId) return null;
    const animalsInCamp = state.animals.filter(a => a.campId === animal.campId && a.id !== animal.id);
    const parentTags = [animal.motherTag, animal.fatherTag].filter(Boolean);
    const siblingTags = [];
    animalsInCamp.forEach(a => {
      if (a.motherTag && parentTags.includes(a.motherTag)) siblingTags.push(a.tagNumber);
      if (a.fatherTag && parentTags.includes(a.fatherTag)) siblingTags.push(a.tagNumber);
    });
    const offspringInCamp = animalsInCamp.filter(a => animal.offspringTags.includes(a.tagNumber));
    const parentInCamp = animalsInCamp.filter(a => parentTags.includes(a.tagNumber));
    if (siblingTags.length > 0 || offspringInCamp.length > 0 || parentInCamp.length > 0) {
      return `Animal ${animal.tagNumber}: Inbreeding risk (${[
        siblingTags.length > 0 ? 'Sibling(s)' : null,
        offspringInCamp.length > 0 ? 'Offspring' : null,
        parentInCamp.length > 0 ? 'Parent' : null
      ].filter(Boolean).join(', ')})`;
    }
    return null;
  };
  const getBiosecurityAlert = (animal: any) => {
    if (!animal.campId) return null;
    const animalsInCamp = state.animals.filter(a => a.campId === animal.campId);
    const now = new Date();
    const recentDisease = animalsInCamp.some(a =>
      a.health.some(h =>
        (h.type === 'Treatment' || h.type === 'Vaccination') &&
        (now.getTime() - new Date(h.date).getTime()) < 1000 * 60 * 60 * 24 * 30
      )
    );
    if (recentDisease) {
      return `Animal ${animal.tagNumber}: Biosecurity risk (recent disease/treatment event)`;
    }
    return null;
  };
  const alerts = animalsInCamp.map(a => [getInbreedingAlert(a), getBiosecurityAlert(a)]).flat().filter(Boolean);

  // Group and deduplicate alerts
  const inbreedingAlerts = Array.from(new Set(animalsInCamp.map(getInbreedingAlert).filter(Boolean)));
  const biosecurityAlerts = Array.from(new Set(animalsInCamp.map(getBiosecurityAlert).filter(Boolean)));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: 370,
      height: '100%',
      background: 'white',
      boxShadow: '-2px 0 16px rgba(0,0,0,0.18)',
      zIndex: 2000,
      padding: 28,
      overflowY: 'auto',
      transition: 'transform 0.3s',
      fontFamily: 'Inter, Arial, sans-serif',
    }}>
      <button onClick={onClose} style={{ float: 'right', fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>×</button>
      <h2 style={{ marginTop: 0, marginBottom: 8, fontWeight: 700, fontSize: 24 }}>{camp.name}</h2>
      <div style={{ marginBottom: 18, color: '#444', fontSize: 16 }}>
        <strong>Area:</strong> <span style={{ color: '#2d7d46' }}>{areaHa.toFixed(2)} ha</span>
      </div>
      <div style={{ marginBottom: 18 }}>
        <strong>Animals in camp:</strong>
        {/* Alerts summary */}
        {(inbreedingAlerts.length > 0 || biosecurityAlerts.length > 0) && (
          <div style={{ margin: '14px 0', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: '10px 14px', color: '#ad6800', fontSize: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <AlertTriangle size={20} style={{ marginRight: 8, verticalAlign: 'middle', color: '#faad14' }} />
              <strong>Alerts</strong>
            </div>
            {inbreedingAlerts.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 500 }}>Inbreeding risks:</span>
                <ul style={{ margin: '4px 0 0 0', padding: 0, listStyle: 'none' }}>
                  {inbreedingAlerts.map((alert, idx) => (
                    <li key={idx} style={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
                      <AlertTriangle size={15} style={{ marginRight: 5, color: '#faad14' }} />
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {biosecurityAlerts.length > 0 && (
              <div>
                <span style={{ fontWeight: 500 }}>Biosecurity risks:</span>
                <ul style={{ margin: '4px 0 0 0', padding: 0, listStyle: 'none' }}>
                  {biosecurityAlerts.map((alert, idx) => (
                    <li key={idx} style={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
                      <AlertTriangle size={15} style={{ marginRight: 5, color: '#faad14' }} />
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
          <div title={UNIT_INFO.LSU} style={{ cursor: 'help', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontWeight: 500 }}>LSU:</span> {lsuCount}
            {lsuOver && <span style={{ color: 'red', marginLeft: 4 }}>⚠️</span>}
          </div>
          <div title={UNIT_INFO.SSU} style={{ cursor: 'help', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontWeight: 500 }}>SSU:</span> {ssuCount}
            {ssuOver && <span style={{ color: 'red', marginLeft: 4 }}>⚠️</span>}
          </div>
        </div>
        {(lsuOver || ssuOver) && (
          <div style={{ color: 'red', marginTop: 6, fontWeight: 500 }}>
            Overgrazing risk! Check your stocking rates.
          </div>
        )}
        {/* Grazing duration summary */}
        {grazingDurations.length > 0 && (
          <div style={{ marginTop: 10, color: '#444', fontSize: 15 }}>
            <strong>Grazing Duration:</strong><br />
            <span>Min: {minGrazing}d &nbsp;|&nbsp; Max: {maxGrazing}d &nbsp;|&nbsp; Avg: {avgGrazing}d</span>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 22 }}>
        <strong>Recommended Stocking Rates</strong>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
          <span title={UNIT_INFO.LSU} style={{ cursor: 'help', textDecoration: 'underline dotted' }}>LSU</span>: Large Stock Unit &nbsp;|&nbsp;
          <span title={UNIT_INFO.SSU} style={{ cursor: 'help', textDecoration: 'underline dotted' }}>SSU</span>: Small Stock Unit
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span title={UNIT_INFO.LSU} style={{ minWidth: 40 }}>LSU/ha</span>
            <input
              type="number"
              step="0.01"
              value={stockingRates.LSU}
              onChange={e => handleRateChange('LSU', e.target.value)}
              style={{ width: 70, padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span title={UNIT_INFO.SSU} style={{ minWidth: 40 }}>SSU/ha</span>
            <input
              type="number"
              step="0.01"
              value={stockingRates.SSU}
              onChange={e => handleRateChange('SSU', e.target.value)}
              style={{ width: 70, padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </label>
        </div>
        <button onClick={handleSaveRates} style={{ marginTop: 12, padding: '6px 18px', background: '#2d7d46', color: 'white', border: 'none', borderRadius: 4, fontWeight: 500, cursor: 'pointer', boxShadow: '0 2px 8px rgba(45,125,70,0.08)' }}>Save Rates</button>
      </div>
      {/* More details and animal management coming soon */}
      <button
        type="button"
        style={{
          color: '#1565c0',
          background: 'none',
          border: 'none',
          padding: 0,
          fontSize: 15,
          marginTop: 24,
          cursor: 'pointer',
          fontWeight: 600,
          textDecoration: 'underline',
          display: 'inline-block',
          transition: 'color 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.color = '#003c8f')}
        onMouseOut={e => (e.currentTarget.style.color = '#1565c0')}
        onClick={() => alert('More camp details and animal management coming soon!')}
      >
        View Details
      </button>
    </div>
  );
}; 