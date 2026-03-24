import React from 'react';

interface BarrierPanelProps {
  width: number; // in meters
  height: number; // in meters
  yieldStrength: number; // in Pascals (N/m^2)
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  onYieldChange: (y: number) => void;
  locked?: boolean;
}

export const BarrierPanel: React.FC<BarrierPanelProps> = ({
  width, height, yieldStrength,
  onWidthChange, onHeightChange, onYieldChange,
  locked = false
}) => {
  const area = width * height;

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
              min="0.1"
              step="0.1"
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
              min="0.1"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="flex-col gap-2" style={{ marginTop: '10px' }}>
        <div className="flex-row justify-between items-center">
          <label>Max Yield Strength (Pa)</label>
        </div>
        <input 
          type="number" 
          className="control-input" 
          value={yieldStrength} 
          onChange={(e) => onYieldChange(parseFloat(e.target.value) || 0)}
          disabled={locked}
          min="1000"
          step="1000"
        />
        <input 
          type="range"
          min="1000"
          max="5000000"
          step="1000"
          value={yieldStrength}
          onChange={(e) => onYieldChange(parseFloat(e.target.value) || 0)}
          disabled={locked}
        />
      </div>
    </div>
  );
};
