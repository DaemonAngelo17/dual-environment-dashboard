import React from 'react';

export const AVAILABLE_GASES = [
  { id: 'O2', name: 'Oxygen (O2)', mass: 32 },
  { id: 'N2', name: 'Nitrogen (N2)', mass: 28.01 },
  { id: 'CO2', name: 'Carbon Dioxide (CO2)', mass: 44.01 },
  { id: 'NH3', name: 'Ammonia (NH3)', mass: 17.03 },
  { id: 'Ar', name: 'Argon (Ar)', mass: 39.95 },
  { id: 'He', name: 'Helium (He)', mass: 4.00 }
];

export const LIFEFORMS = [
  { id: 'NONE', label: 'None (Sterile)' },
  { id: 'HUMAN', label: 'Human (Consumes O2, Produces CO2 & Heat)' },
  { id: 'XENOMORPH', label: 'Ammonia-Bather (Consumes NH3, Produces N2)' },
  { id: 'SILICATE', label: 'Silicate Worm (Consumes CO2, Produces O2 & Heat)' },
  { id: 'CUSTOM', label: 'Custom Synthetic Organism' }
];

export interface MixtureItem {
  gasId: string;
  percentage: number;
}

interface EnvironmentPanelProps {
  title: string;
  pressure: number; // in kPa
  temperatureK: number; // in Kelvin
  mixture: MixtureItem[];
  averageMolarMass: number;
  lifeform: string;
  metabolismRate: number;
  homeostasis: boolean;
  customConsume?: string;
  customProduce?: string;
  onTempChange: (tempK: number) => void;
  onPressureChange: (pressure: number) => void;
  onMixtureChange: (newMixture: MixtureItem[]) => void;
  onLifeformChange: (lfId: string) => void;
  onMetabolismChange: (rate: number) => void;
  onHomeostasisChange: (enabled: boolean) => void;
  onCustomLifeformChange?: (consumeGas: string, produceGas: string) => void;
  locked?: boolean;
}

export const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({
  title, pressure, temperatureK, mixture, averageMolarMass,
  lifeform, metabolismRate, homeostasis, customConsume = 'O2', customProduce = 'CO2',
  onTempChange, onPressureChange, onMixtureChange,
  onLifeformChange, onMetabolismChange, onHomeostasisChange, onCustomLifeformChange,
  locked = false
}) => {
  const tempC = temperatureK - 273.15;

  const handleToggleGas = (gasId: string) => {
    if (locked) return;
    const exists = mixture.find(m => m.gasId === gasId);
    if (exists) {
      if (mixture.length > 1) {
        onMixtureChange(mixture.filter(m => m.gasId !== gasId));
      }
    } else {
      onMixtureChange([...mixture, { gasId, percentage: 10 }]);
    }
  };

  const handlePercentageChange = (gasId: string, value: number) => {
    if (locked) return;
    onMixtureChange(mixture.map(m => m.gasId === gasId ? { ...m, percentage: value } : m));
  };

  const total = mixture.reduce((sum, m) => sum + m.percentage, 0);

  return (
    <div className="panel flex-col gap-4">
      <h2 className="title-glow">{title}</h2>
      
      {/* Biosphere Section */}
      <div className="flex-col gap-2" style={{ background: 'rgba(69, 162, 158, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid var(--neon-blue)' }}>
        <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1rem', marginBottom: '5px' }}>Biosphere / Lifeforms</h3>
        
        <select 
          className="control-input"
          value={lifeform}
          onChange={(e) => onLifeformChange(e.target.value)}
          disabled={locked}
        >
          {LIFEFORMS.map(lf => (
            <option key={lf.id} value={lf.id}>{lf.label}</option>
          ))}
        </select>

        {lifeform === 'CUSTOM' && onCustomLifeformChange && (
          <div className="flex-row gap-2" style={{ marginTop: '10px' }}>
            <div className="flex-col" style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: '#888' }}>Consumes (Inhales)</label>
              <select className="control-input" value={customConsume} onChange={(e) => onCustomLifeformChange(e.target.value, customProduce)} disabled={locked}>
                {AVAILABLE_GASES.map(g => <option key={g.id} value={g.id}>{g.id}</option>)}
              </select>
            </div>
            <div className="flex-col" style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: '#888' }}>Produces (Exhales)</label>
              <select className="control-input" value={customProduce} onChange={(e) => onCustomLifeformChange(customConsume, e.target.value)} disabled={locked}>
                {AVAILABLE_GASES.map(g => <option key={g.id} value={g.id}>{g.id}</option>)}
              </select>
            </div>
          </div>
        )}

        {lifeform !== 'NONE' && (
          <div className="flex-col gap-2" style={{ marginTop: '10px' }}>
            <div className="flex-row justify-between items-center">
              <label style={{ fontSize: '0.8rem' }}>Population / Metabolism Rate</label>
              <span style={{ fontFamily: 'var(--font-data)', color: 'var(--neon-cyan)' }}>x{metabolismRate}</span>
            </div>
            <input 
              type="range"
              min="1" max="10" step="1"
              value={metabolismRate}
              onChange={(e) => onMetabolismChange(parseFloat(e.target.value))}
              disabled={locked}
            />
            
            <label className="flex-row items-center gap-2" style={{ marginTop: '10px', cursor: 'pointer', color: homeostasis ? 'var(--neon-cyan)' : '#888' }}>
              <input 
                type="checkbox" 
                checked={homeostasis}
                onChange={(e) => onHomeostasisChange(e.target.checked)}
                disabled={locked}
              />
              Enable Artificial Homeostasis (Life Support counters metabolism)
            </label>
          </div>
        )}
      </div>

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
        <div className="flex-row justify-between items-center">
          <label>Gas Composition</label>
          <div style={{ fontSize: '0.9rem', color: '#888' }}>Avg Mass: {averageMolarMass.toFixed(2)} g/mol</div>
        </div>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', border: '1px solid #333' }}>
          {AVAILABLE_GASES.map(gas => {
            const mixItem = mixture.find(m => m.gasId === gas.id);
            const isChecked = !!mixItem;
            const normalized = mixItem ? (mixItem.percentage / total) * 100 : 0;

            return (
              <div key={gas.id} className="flex-row items-center gap-4" style={{ marginBottom: '8px' }}>
                <label className="flex-row items-center gap-2" style={{ width: '150px', cursor: locked ? 'not-allowed' : 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => handleToggleGas(gas.id)}
                    disabled={locked}
                  />
                  {gas.name}
                </label>

                {isChecked && (
                  <>
                    <input 
                      type="range"
                      min="1"
                      max="100"
                      value={mixItem.percentage}
                      onChange={(e) => handlePercentageChange(gas.id, parseFloat(e.target.value))}
                      disabled={locked}
                      style={{ flex: 1, margin: 0 }}
                    />
                    <div style={{ width: '60px', textAlign: 'right', fontFamily: 'var(--font-data)', color: 'var(--neon-cyan)' }}>
                      {normalized.toFixed(1)}%
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
