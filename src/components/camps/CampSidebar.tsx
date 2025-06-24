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
    <div
      className={
        `z-50 bg-white box-shadow-lg overflow-y-auto transition-transform duration-300
        fixed top-0 right-0 h-full w-full sm:w-[370px] sm:static sm:h-full sm:block
        ${typeof window !== 'undefined' && window.innerWidth < 640 ? 'animate-slide-up' : ''}`
      }
      style={{
        maxWidth: 370,
        width: '100%',
        height: '100%',
        boxShadow: '-2px 0 16px rgba(0,0,0,0.18)',
        zIndex: 2000,
        padding: 28,
        overflowY: 'auto',
        fontFamily: 'Inter, Arial, sans-serif',
        ...(typeof window !== 'undefined' && window.innerWidth < 640 ? { left: 0, right: 0, top: 0, bottom: 0 } : {})
      }}
    >
      <button
        onClick={onClose}
        className="float-right text-2xl bg-none border-none cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
        style={{ fontSize: 22 }}
        aria-label="Close sidebar"
      >
        ×
      </button>
      <h2 className="mt-0 mb-2 font-bold text-2xl sm:text-3xl">{camp.name}</h2>
      <div className="mb-4 text-gray-700 text-base sm:text-lg">
        <strong>Area:</strong> <span className="text-emerald-700">{areaHa.toFixed(2)} ha</span>
      </div>
      <div className="mb-4 text-gray-700 text-base sm:text-lg">
        <strong>Animals in camp:</strong>
        {(inbreedingAlerts.length > 0 || biosecurityAlerts.length > 0) && (
          <div className="mt-2 mb-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <AlertTriangle size={20} className="text-yellow-400 mr-2" />
              <strong className="text-yellow-800">Alerts</strong>
            </div>
            {inbreedingAlerts.length > 0 && (
              <div className="mb-2">
                <span className="font-medium">Inbreeding risks:</span>
                <ul className="list-disc pl-6">
                  {inbreedingAlerts.map((alert, idx) => (
                    <li key={idx} className="flex items-center">
                      <AlertTriangle size={15} className="text-yellow-400 mr-2" />
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {biosecurityAlerts.length > 0 && (
              <div>
                <span className="font-medium">Biosecurity risks:</span>
                <ul className="list-disc pl-6">
                  {biosecurityAlerts.map((alert, idx) => (
                    <li key={idx} className="flex items-center">
                      <AlertTriangle size={15} className="text-yellow-400 mr-2" />
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-4 mt-2">
          <div title={UNIT_INFO.LSU} className="cursor-help flex items-center gap-2">
            <span className="font-medium">LSU:</span> {lsuCount}
            {lsuOver && <span className="text-red-500 ml-2">⚠️</span>}
          </div>
          <div title={UNIT_INFO.SSU} className="cursor-help flex items-center gap-2">
            <span className="font-medium">SSU:</span> {ssuCount}
            {ssuOver && <span className="text-red-500 ml-2">⚠️</span>}
          </div>
        </div>
        {(lsuOver || ssuOver) && (
          <div className="text-red-500 mt-2 font-medium">
            Overgrazing risk! Check your stocking rates.
          </div>
        )}
        {grazingDurations.length > 0 && (
          <div className="mt-4 text-gray-700 text-base sm:text-lg">
            <strong>Grazing Duration:</strong><br />
            <span>Min: {minGrazing}d &nbsp;|&nbsp; Max: {maxGrazing}d &nbsp;|&nbsp; Avg: {avgGrazing}d</span>
          </div>
        )}
      </div>
      <div className="mb-4">
        <strong>Recommended Stocking Rates</strong>
        <div className="text-gray-600 text-sm mb-2">
          <span title={UNIT_INFO.LSU} className="text-decoration-underline text-decoration-dotted">LSU</span>: Large Stock Unit &nbsp;|&nbsp;
          <span title={UNIT_INFO.SSU} className="text-decoration-underline text-decoration-dotted">SSU</span>: Small Stock Unit
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-4">
            <span title={UNIT_INFO.LSU} className="min-w-[40px]">LSU/ha</span>
            <input
              type="number"
              step="0.01"
              value={stockingRates.LSU}
              onChange={e => handleRateChange('LSU', e.target.value)}
              className="w-20 p-2 border border-gray-300 rounded"
            />
          </label>
          <label className="flex items-center gap-4">
            <span title={UNIT_INFO.SSU} className="min-w-[40px]">SSU/ha</span>
            <input
              type="number"
              step="0.01"
              value={stockingRates.SSU}
              onChange={e => handleRateChange('SSU', e.target.value)}
              className="w-20 p-2 border border-gray-300 rounded"
            />
          </label>
        </div>
        <button onClick={handleSaveRates} className="mt-4 p-2 bg-emerald-600 text-white rounded font-medium">Save Rates</button>
      </div>
      <button
        type="button"
        className="text-blue-500 bg-none border-none p-0 text-sm mt-4 cursor-pointer font-semibold text-decoration-underline inline-block transition-color duration-200"
        onMouseOver={e => (e.currentTarget.style.color = '#003c8f')}
        onMouseOut={e => (e.currentTarget.style.color = '#1565c0')}
        onClick={() => alert('More camp details and animal management coming soon!')}
      >
        View Details
      </button>
    </div>
  );
}; 