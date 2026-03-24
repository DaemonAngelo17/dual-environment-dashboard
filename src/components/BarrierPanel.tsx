import React, { useState, useEffect } from 'react';

export const MATERIALS = [
  { label: 'Acrylic Glass (70 MPa)', value: 70000000 },
  { label: 'Structural Steel (250 MPa)', value: 250000000 },
  { label: 'Aluminum Alloy (276 MPa)', value: 276000000 },
  { label: 'Titanium Grade 5 (830 MPa)', value: 830000000 },
  { label: 'Carbon Nanotubes (5000 MPa)', value: 5000000000 },
  { label: 'Custom', value: 0 } 
];

interface BarrierPanelProps {
  width: number; // in meters
  height: number; // in meters
  thickness: number; // in cm
  shape: string; // 'FLAT', 'DOME_A', 'DOME_B'
  yieldStrength: number; // in Pascals (N/m^2)
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  onThicknessChange: (t: number) => void;
  onShapeChange: (s: string) => void;
  onYieldChange: (y: number) => void;
  locked?: boolean;
}

export const BarrierPanel: React.FC<BarrierPanelProps> = ({
  width, height, thickness, shape, yieldStrength,
  onWidthChange, onHeightChange, onThicknessChange, onShapeChange, onYieldChange,
  locked = false
}) => {
  const area = width * height;
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Custom');

  useEffect(() => {
    const preset = MATERIALS.find(m => m.value === yieldStrength);
    if (preset) setSelectedMaterial(preset.label);
    else setSelectedMaterial('Custom');
  }, [yieldStrength]);

  const handleMaterialSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const label = e.target.value;
    setSelectedMaterial(label);
    const preset = MATERIALS.find(m => m.label === label);
    if (preset && preset.value > 0) {
      onYieldChange(preset.value);
    }
  };

  return (
    <div className="panel flex-col gap-4">
      <h2 className="title-glow" style={{ color: 'var(--neon-orange)', textShadow: '0 0 10px rgba(255, 140, 0, 0.5)'}}>Barrier specs</h2>
      
      <div className="flex-col gap-2">
        <div className="flex-row justify-between items-center">
          <label>Dimensions (W x H)</label>
          <div className="data-display" style={{ fontSize: '1.2rem', padding: '5px 10px', color: 'var(--neon-orange)', borderColor: 'var(--neon-orange)' }}>
            {area.toFixed(2)} m²
          </div>
        </div>
        <div className="flex-row gap-4">
          <div className="flex-col gap-2" style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>Width (m)</label>
            <input 
              type="number" 
              className="control-input" 
              value={width} 
              onChange={(e) => onWidthChange(parseFloat(e.target.value) || 0)}
              disabled={locked}
              min="0.1" step="0.1"
            />
          </div>
          <div className="flex-col gap-2" style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>Height (m)</label>
            <input 
              type="number" 
              className="control-input" 
              value={height} 
              onChange={(e) => onHeightChange(parseFloat(e.target.value) || 0)}
              disabled={locked}
              min="0.1" step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="flex-col gap-2" style={{ marginTop: '10px' }}>
        <div className="flex-row justify-between items-center">
          <label>Architectural Geometry</label>
        </div>
        <select 
          className="control-input"
          value={shape}
          onChange={(e) => onShapeChange(e.target.value)}
          disabled={locked}
        >
          <option value="FLAT">Flat Plate (Standard Load)</option>
          <option value="DOME_A">Convex Dome facing Env A (+15% Strength vs A)</option>
          <option value="DOME_B">Convex Dome facing Env B (+15% Strength vs B)</option>
        </select>
        
        <div className="flex-row justify-between items-center" style={{ marginTop: '5px' }}>
          <label style={{ fontSize: '0.8rem', color: '#888' }}>Material Thickness (cm)</label>
          <span style={{ fontFamily: 'var(--font-data)', color: 'var(--neon-orange)' }}>{thickness.toFixed(1)} cm</span>
        </div>
        <input 
          type="range"
          min="1" max="100" step="1"
          value={thickness}
          onChange={(e) => onThicknessChange(parseFloat(e.target.value) || 1)}
          disabled={locked}
        />
      </div>

      <div className="flex-col gap-2" style={{ marginTop: '10px' }}>
        <div className="flex-row justify-between items-center">
          <label>Containment Material</label>
        </div>
        <select 
          className="control-input"
          value={selectedMaterial}
          onChange={handleMaterialSelect}
          disabled={locked}
          style={{ marginBottom: '5px' }}
        >
          {MATERIALS.map(m => (
            <option key={m.label} value={m.label}>{m.label}</option>
          ))}
        </select>
        
        <div className="flex-row justify-between items-center" style={{ marginTop: '5px' }}>
          <label style={{ fontSize: '0.8rem', color: '#888' }}>Base Yield Strength (Pa)</label>
        </div>
        <input 
          type="number" 
          className="control-input" 
          value={yieldStrength} 
          onChange={(e) => onYieldChange(parseFloat(e.target.value) || 0)}
          disabled={locked}
          min="1000" step="1000"
        />
        <input 
          type="range"
          min="1000" max="1000000000" step="1000000"
          value={yieldStrength}
          onChange={(e) => onYieldChange(parseFloat(e.target.value) || 0)}
          disabled={locked}
        />
      </div>
    </div>
  );
};
