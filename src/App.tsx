import { useState, useEffect } from 'react';
import './index.css';
import { EnvironmentPanel, GAS_TYPES } from './components/EnvironmentPanel';
import { BarrierPanel } from './components/BarrierPanel';
import { ThermodynamicMonitor } from './components/ThermodynamicMonitor';
import { StructuralVisualizer } from './components/StructuralVisualizer';
import { BreachAlert } from './components/BreachAlert';

// Default constants
const CONST_VOLUME = 10.0; // m^3
const R = 8.314; // J/(mol K)

function App() {
  // Environment A State
  const [envA, setEnvA] = useState({
    pressure: 101.3, // kPa
    tempK: 293.15, // 20 C
    gasType: 'O2',
    molarMass: 32,
    n: 0 // moles
  });

  // Environment B State
  const [envB, setEnvB] = useState({
    pressure: 50.0, // kPa
    tempK: 293.15, // 20 C
    gasType: 'N2',
    molarMass: 28.01,
    n: 0
  });

  // Barrier State
  const [barrier, setBarrier] = useState({
    width: 2.0, // m
    height: 3.0, // m
    yieldStrength: 50000 // Pa (N/m^2)
  });

  const [isBreached, setIsBreached] = useState(false);

  // Initial calculation of n
  useEffect(() => {
    // P*V = n*R*T -> n = (P*1000 * V) / (R * T)
    const nA = (envA.pressure * 1000 * CONST_VOLUME) / (R * envA.tempK);
    const nB = (envB.pressure * 1000 * CONST_VOLUME) / (R * envB.tempK);
    setEnvA(prev => ({ ...prev, n: nA }));
    setEnvB(prev => ({ ...prev, n: nB }));
  }, []);

  // Handlers for Env A
  const handleEnvATempChange = (newTempK: number) => {
    // Recalculate P based on fixed n and V
    const newP = (envA.n * R * newTempK) / (CONST_VOLUME * 1000);
    setEnvA(prev => ({ ...prev, tempK: newTempK, pressure: newP }));
  };

  const handleEnvAPressureChange = (newP: number) => {
    // Recalculate n based on fixed T and V
    const newN = (newP * 1000 * CONST_VOLUME) / (R * envA.tempK);
    setEnvA(prev => ({ ...prev, pressure: newP, n: newN }));
  };

  const handleEnvAGasChange = (type: string, cm_mass?: number) => {
    const mass = cm_mass || GAS_TYPES.find(g => g.value === type)?.molarMass || 29;
    setEnvA(prev => ({ ...prev, gasType: type, molarMass: mass }));
  };

  // Handlers for Env B
  const handleEnvBTempChange = (newTempK: number) => {
    const newP = (envB.n * R * newTempK) / (CONST_VOLUME * 1000);
    setEnvB(prev => ({ ...prev, tempK: newTempK, pressure: newP }));
  };

  const handleEnvBPressureChange = (newP: number) => {
    const newN = (newP * 1000 * CONST_VOLUME) / (R * envB.tempK);
    setEnvB(prev => ({ ...prev, pressure: newP, n: newN }));
  };

  const handleEnvBGasChange = (type: string, cm_mass?: number) => {
    const mass = cm_mass || GAS_TYPES.find(g => g.value === type)?.molarMass || 29;
    setEnvB(prev => ({ ...prev, gasType: type, molarMass: mass }));
  };

  // Calculations
  const area = barrier.width * barrier.height;
  const pressureDiffPa = Math.abs(envA.pressure - envB.pressure) * 1000;
  const force = pressureDiffPa * area;
  const maxForce = barrier.yieldStrength * area;

  // Breach Check
  useEffect(() => {
    if (force > maxForce && !isBreached) {
      setIsBreached(true);
    }
  }, [force, maxForce, isBreached]);

  const resetSimulation = () => {
    setIsBreached(false);
    // Reset to safe defaults
    setEnvA(prev => {
      const p = 101.3;
      const t = 293.15;
      const n = (p * 1000 * CONST_VOLUME) / (R * t);
      return { ...prev, pressure: p, tempK: t, n: n };
    });
    setEnvB(prev => {
      const p = 101.3;
      const t = 293.15;
      const n = (p * 1000 * CONST_VOLUME) / (R * t);
      return { ...prev, pressure: p, tempK: t, n: n };
    });
    setBarrier({ width: 2.0, height: 3.0, yieldStrength: 50000 });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'var(--font-data)', color: 'var(--neon-cyan)', fontSize: '2.5rem', letterSpacing: '4px', textShadow: 'var(--glow-cyan)' }}>
          DUAL-ENVIRONMENT CONTROL DASHBOARD
        </h1>
        <p style={{ color: '#888' }}>SYSTEM STATUS: {isBreached ? <span style={{ color: 'var(--neon-red)' }}>COMPROMISED</span> : <span style={{ color: 'var(--neon-blue)' }}>NOMINAL</span>}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '20px' }}>
        {/* Left Column: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <EnvironmentPanel 
            title="Environment A"
            pressure={envA.pressure}
            temperatureK={envA.tempK}
            gasType={envA.gasType}
            customMolarMass={envA.molarMass}
            onTempChange={handleEnvATempChange}
            onPressureChange={handleEnvAPressureChange}
            onGasChange={handleEnvAGasChange}
            locked={isBreached}
          />
          <EnvironmentPanel 
            title="Environment B (Exterior)"
            pressure={envB.pressure}
            temperatureK={envB.tempK}
            gasType={envB.gasType}
            customMolarMass={envB.molarMass}
            onTempChange={handleEnvBTempChange}
            onPressureChange={handleEnvBPressureChange}
            onGasChange={handleEnvBGasChange}
            locked={isBreached}
          />
          <BarrierPanel 
            width={barrier.width}
            height={barrier.height}
            yieldStrength={barrier.yieldStrength}
            onWidthChange={(w) => setBarrier(prev => ({...prev, width: w}))}
            onHeightChange={(h) => setBarrier(prev => ({...prev, height: h}))}
            onYieldChange={(y) => setBarrier(prev => ({...prev, yieldStrength: y}))}
            locked={isBreached}
          />
        </div>

        {/* Right Column: Visualizations output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <StructuralVisualizer 
            envAPressure={envA.pressure}
            envBPressure={envB.pressure}
            area={area}
            force={force}
            yieldStrength={barrier.yieldStrength}
          />
          
          <ThermodynamicMonitor 
            envAPressure={envA.pressure}
            envATempK={envA.tempK}
            envA_n={envA.n}
            envBPressure={envB.pressure}
            envBTempK={envB.tempK}
            envB_n={envB.n}
            volume={CONST_VOLUME}
          />
        </div>
      </div>

      {isBreached && <BreachAlert onReset={resetSimulation} />}
    </div>
  );
}

export default App;
