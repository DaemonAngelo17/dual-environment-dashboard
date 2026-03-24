import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StructuralVisualizerProps {
  envAPressure: number; // kPa
  envBPressure: number; // kPa
  area: number; // m^2
  force: number; // N
  yieldStrength: number; // N or Pa, force limit
  shape: string; // FLAT, DOME_A, DOME_B
  fatigue: number; // 0-100%
}

export const StructuralVisualizer: React.FC<StructuralVisualizerProps> = ({
  envAPressure, envBPressure, area, force, yieldStrength, shape, fatigue
}) => {
  const pressureDiff = envAPressure - envBPressure;
  const isPushingRight = pressureDiff > 0;
  
  const maxForce = yieldStrength * area;
  const stressPercent = Math.min((force / maxForce) * 100, 100);
  
  const isWarning = stressPercent >= 85 || fatigue > 80;
  const barrierColor = stressPercent > 85 ? 'var(--neon-red)' : stressPercent > 50 ? 'var(--neon-orange)' : 'var(--neon-cyan)';

  // Determine CSS shape geometry
  let borderRadius = '0';
  if (shape === 'DOME_A') borderRadius = '50% 0 0 50%'; // Curve facing left (Env A)
  if (shape === 'DOME_B') borderRadius = '0 50% 50% 0'; // Curve facing right (Env B)

  return (
    <div className="panel flex-col gap-4" style={isWarning ? { border: '2px solid var(--neon-red)', animation: 'pulseRed 1s infinite alternate' } : {}}>
      <style>
        {`
          @keyframes pulseRed {
            from { box-shadow: 0 0 10px rgba(255, 0, 0, 0.2); }
            to { box-shadow: 0 0 30px rgba(255, 0, 0, 0.6); }
          }
          @keyframes flashText {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}
      </style>
      <h2 className="title-glow">Structural Integrity Core</h2>
      
      {isWarning && (
        <div style={{ background: '#4a0000', color: 'var(--neon-red)', border: '1px solid var(--neon-red)', padding: '10px', textAlign: 'center', fontFamily: 'var(--font-data)', fontSize: '1.2rem', animation: 'flashText 0.5s infinite', letterSpacing: '2px' }}>
          ⚠ WARNING: STRUCTURAL YIELD LIMIT APPROACHING ⚠
        </div>
      )}

      <div className="flex-row justify-between" style={{ padding: '20px 0', position: 'relative', height: '150px' }}>
        <div style={{ flex: 1, backgroundColor: 'rgba(69, 162, 158, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '1.2rem', color: 'var(--neon-blue)'}}>
            {(envAPressure).toFixed(1)} kPa
          </span>
        </div>
        
        {/* The Barrier Geometry */}
        <div style={{ width: '40px', backgroundColor: barrierColor, boxShadow: `0 0 ${stressPercent/5}px ${barrierColor}`, zIndex: 10, display: 'flex', flexDirection: 'column', justifyItems: 'end', justifyContent: 'flex-end', transition: 'all 0.3s ease', borderRadius: borderRadius, overflow: 'hidden' }}>
          <div style={{ width: '100%', height: `${stressPercent}%`, backgroundColor: 'rgba(255,255,255,0.5)', transition: 'height 0.3s' }}></div>
        </div>

        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '1.2rem', color: '#ccc'}}>
            {(envBPressure).toFixed(1)} kPa
          </span>
        </div>

        {Math.abs(pressureDiff) > 0.1 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', zIndex: 20 }}>
            {isPushingRight ? (
              <div className="flex-row items-center gap-2" style={{ color: 'var(--neon-orange)', transform: 'translateX(30px)' }}>
                <span style={{ fontFamily: 'var(--font-data)', textShadow: '0 0 5px #000' }}>{Math.round(force).toLocaleString()} N</span>
                <ArrowRight size={32} />
              </div>
            ) : (
              <div className="flex-row items-center gap-2" style={{ color: 'var(--neon-orange)', transform: 'translateX(-30px)' }}>
                <ArrowLeft size={32} />
                <span style={{ fontFamily: 'var(--font-data)', textShadow: '0 0 5px #000' }}>{Math.round(force).toLocaleString()} N</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-row justify-between items-center" style={{ marginTop: '10px' }}>
        <div className="flex-col">
          <label>Total Load</label>
          <div className="data-display" style={{ color: barrierColor, borderColor: barrierColor }}>
            {force.toLocaleString(undefined, { maximumFractionDigits: 0 })} N
          </div>
        </div>
        <div className="flex-col">
          <label>Material Max Yield</label>
          <div className="data-display" style={{ color: '#fff', borderColor: '#555' }}>
            {maxForce.toLocaleString(undefined, { maximumFractionDigits: 0 })} N
          </div>
        </div>
      </div>
      
      {/* Visual Stress Bar */}
      <div className="flex-row items-center gap-4" style={{ marginTop: '15px' }}>
        <div style={{ width: '80px', color: '#888', fontSize: '0.8rem' }}>LIVE STRESS</div>
        <div style={{ flex: 1, height: '15px', background: '#222', borderRadius: '4px', overflow: 'hidden', border: '1px solid #444' }}>
          <div style={{ height: '100%', width: `${stressPercent}%`, background: barrierColor, transition: 'width 0.3s' }}></div>
        </div>
      </div>

      {/* Visual Fatigue Bar */}
      <div className="flex-row items-center gap-4" style={{ marginTop: '5px' }}>
        <div style={{ width: '80px', color: '#888', fontSize: '0.8rem' }}>FATIGUE</div>
        <div style={{ flex: 1, height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden', border: '1px solid #444' }}>
          <div style={{ height: '100%', width: `${Math.min(100, fatigue)}%`, background: 'var(--neon-red)', transition: 'width 0.3s' }}></div>
        </div>
      </div>
    </div>
  );
};
