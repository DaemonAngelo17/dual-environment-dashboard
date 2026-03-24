import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StructuralVisualizerProps {
  envAPressure: number; // kPa
  envBPressure: number; // kPa
  area: number; // m^2
  force: number; // N
  yieldStrength: number; // N or Pa, force limit
}

export const StructuralVisualizer: React.FC<StructuralVisualizerProps> = ({
  envAPressure, envBPressure, area, force, yieldStrength
}) => {
  const pressureDiff = envAPressure - envBPressure;
  const isPushingRight = pressureDiff > 0;
  
  // Calculate stress percentage for visual feedback
  const stressPercent = Math.min((force / (yieldStrength * area)) * 100, 100);
  const barrierColor = stressPercent > 80 ? 'var(--neon-red)' : stressPercent > 50 ? 'var(--neon-orange)' : 'var(--neon-cyan)';

  return (
    <div className="panel flex-col gap-4">
      <h2 className="title-glow">Structural Integrity Core</h2>
      
      <div className="flex-row justify-between" style={{ padding: '20px 0', position: 'relative', height: '150px' }}>
        {/* Env A Side */}
        <div style={{ flex: 1, backgroundColor: 'rgba(69, 162, 158, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '1.2rem', color: 'var(--neon-blue)'}}>
            {(envAPressure).toFixed(1)} kPa
          </span>
        </div>
        
        {/* The Barrier */}
        <div style={{ width: '40px', backgroundColor: barrierColor, boxShadow: `0 0 ${stressPercent/5}px ${barrierColor}`, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: 'all 0.3s ease' }}>
          {/* Stress lines or something */}
          <div style={{ width: '100%', height: `${stressPercent}%`, backgroundColor: 'rgba(255,255,255,0.5)', transition: 'height 0.3s' }}></div>
        </div>

        {/* Env B Side */}
        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '1.2rem', color: '#ccc'}}>
            {(envBPressure).toFixed(1)} kPa
          </span>
        </div>

        {/* Force Arrows Overlays */}
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
            {(yieldStrength * area).toLocaleString(undefined, { maximumFractionDigits: 0 })} N
          </div>
        </div>
      </div>
    </div>
  );
};
