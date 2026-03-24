import React from 'react';

interface ThermoMonitorProps {
  envAPressure: number;
  envATempK: number;
  envA_n: number;
  envBPressure: number;
  envBTempK: number;
  envB_n: number;
  volume: number; // constant volume
}

export const ThermodynamicMonitor: React.FC<ThermoMonitorProps> = ({
  envAPressure, envATempK, envA_n,
  envBPressure, envBTempK, envB_n,
  volume
}) => {
  const R = 8.314; // Ideal gas constant J/(mol·K)

  return (
    <div className="panel flex-col gap-4">
      <h2 className="title-glow" style={{ color: 'var(--neon-blue)'}}>Thermodynamic State Monitor</h2>
      <div className="flex-row gap-4">
        {/* Env A */}
        <div className="flex-col gap-2" style={{ flex: 1, borderRight: '1px solid #333', paddingRight: '10px' }}>
          <h3 style={{ color: '#ccc', textAlign: 'center' }}>ENVIRONMENT A</h3>
          <div className="data-display" style={{ fontSize: '1rem', textAlign: 'left' }}>
            <div>P = {envAPressure.toFixed(1)} kPa</div>
            <div>V = {volume.toFixed(1)} m³</div>
            <div>n = {envA_n.toFixed(1)} mol</div>
            <div>R = 8.314</div>
            <div>T = {envATempK.toFixed(1)} K</div>
            <hr style={{ margin: '10px 0', borderColor: 'var(--neon-blue)', opacity: 0.5 }} />
            <div>PV = {(envAPressure * volume).toFixed(0)} kJ</div>
            <div>nRT = {((envA_n * R * envATempK)/1000).toFixed(0)} kJ</div>
          </div>
        </div>

        {/* Env B */}
        <div className="flex-col gap-2" style={{ flex: 1, paddingLeft: '10px' }}>
          <h3 style={{ color: '#ccc', textAlign: 'center' }}>ENVIRONMENT B</h3>
          <div className="data-display" style={{ fontSize: '1rem', textAlign: 'left', color: '#fff', borderColor: '#ccc' }}>
            <div>P = {envBPressure.toFixed(1)} kPa</div>
            <div>V = {volume.toFixed(1)} m³</div>
            <div>n = {envB_n.toFixed(1)} mol</div>
            <div>R = 8.314</div>
            <div>T = {envBTempK.toFixed(1)} K</div>
            <hr style={{ margin: '10px 0', borderColor: '#ccc', opacity: 0.5 }} />
            <div>PV = {(envBPressure * volume).toFixed(0)} kJ</div>
            <div>nRT = {((envB_n * R * envBTempK)/1000).toFixed(0)} kJ</div>
          </div>
        </div>
      </div>
    </div>
  );
};
