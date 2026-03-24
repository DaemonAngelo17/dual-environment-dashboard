import React from 'react';

export const GAS_TYPES = [
  { label: 'Oxygen (O2)', value: 'O2', molarMass: 32 },
  { label: 'Nitrogen (N2)', value: 'N2', molarMass: 28.01 },
  { label: 'Ammonia (NH3)', value: 'NH3', molarMass: 17.03 },
  { label: 'Carbon Dioxide (CO2)', value: 'CO2', molarMass: 44.01 },
  { label: 'Custom Gas', value: 'CUSTOM', molarMass: 29 }, // Default to air approx
];

interface EnvironmentPanelProps {
  title: string;
  pressure: number; // in kPa
  temperatureK: number; // in Kelvin
  gasType: string;
  customMolarMass: number;
  onTempChange: (tempK: number) => void;
  onPressureChange: (pressure: number) => void;
  onGasChange: (gasType: string, customMolarMass?: number) => void;
  locked?: boolean;
}

export const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({
  title,
  pressure,
  temperatureK,
  gasType,
  customMolarMass,
  onTempChange,
  onPressureChange,
  onGasChange,
  locked = false
}) => {
  const tempC = temperatureK - 273.15;

  return (
    <div className="panel flex-col gap-4">
      <h2 className="title-glow">{title}</h2>
      
      <div className="flex-col gap-2">
        <div className="flex-row justify-between items-center">
          <label>Temperature</label>
          <div className="data-display" style={{ fontSize: '1.2rem', padding: '5px 10px' }}>
            {tempC.toFixed(1)} °C | {temperatureK.toFixed(1)} K
          </div>
        </div>
        <input 
          type="range" 
          min="100" 
          max="2000" 
          step="0.1"
          value={temperatureK} 
          onChange={(e) => onTempChange(parseFloat(e.target.value))}
          disabled={locked}
        />
      </div>

      <div className="flex-col gap-2" style={{ marginTop: '10px' }}>
        <div className="flex-row justify-between items-center">
          <label>Pressure</label>
          <div className="data-display" style={{ fontSize: '1.2rem', padding: '5px 10px' }}>
            {pressure.toFixed(2)} kPa
          </div>
        </div>
        <input 
          type="range" 
          min="0" 
          max="10000" 
          step="0.1"
          value={pressure} 
          onChange={(e) => onPressureChange(parseFloat(e.target.value))}
          disabled={locked}
        />
      </div>

      <div className="flex-col gap-2" style={{ marginTop: '10px' }}>
        <label>Gas Composition</label>
        <select 
          className="control-input"
          value={gasType}
          onChange={(e) => onGasChange(e.target.value)}
          disabled={locked}
        >
          {GAS_TYPES.map(g => (
            <option key={g.value} value={g.value}>{g.label} ({g.molarMass} g/mol)</option>
          ))}
        </select>
        
        {gasType === 'CUSTOM' && (
          <div className="flex-row gap-2 items-center" style={{ marginTop: '5px' }}>
            <label style={{ fontSize: '0.9rem' }}>Molar Mass (g/mol):</label>
            <input 
              type="number" 
              className="control-input" 
              style={{ width: '80px', padding: '5px' }}
              value={customMolarMass}
              onChange={(e) => onGasChange('CUSTOM', parseFloat(e.target.value) || 1)}
              disabled={locked}
              min="1"
            />
          </div>
        )}
      </div>
    </div>
  );
};
