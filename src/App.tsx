import { useState, useEffect } from 'react';
import './index.css';
import { EnvironmentPanel, AVAILABLE_GASES } from './components/EnvironmentPanel';
import type { MixtureItem } from './components/EnvironmentPanel';
import { BarrierPanel } from './components/BarrierPanel';
import { StructuralVisualizer } from './components/StructuralVisualizer';
import { BreachAlert } from './components/BreachAlert';
import { DataVisualizer } from './components/DataVisualizer';

// Default constants
const CONST_VOLUME = 10.0; // m^3
const R = 8.314; // J/(mol K)

function App() {
  const [envA, setEnvA] = useState({
    pressure: 101.3,
    tempK: 293.15,
    mixture: [{ gasId: 'O2', percentage: 21 }, { gasId: 'N2', percentage: 79 }] as MixtureItem[],
    n: 0, 
    lifeform: 'HUMAN',
    customConsume: 'O2',
    customProduce: 'CO2',
    metabolismRate: 2,
    homeostasis: true
  });

  const [envB, setEnvB] = useState({
    pressure: 50.0,
    tempK: 293.15,
    mixture: [{ gasId: 'CO2', percentage: 95 }, { gasId: 'N2', percentage: 5 }] as MixtureItem[],
    n: 0,
    lifeform: 'NONE',
    customConsume: 'O2',
    customProduce: 'CO2',
    metabolismRate: 1,
    homeostasis: true
  });

  const [barrier, setBarrier] = useState({
    width: 2.0, 
    height: 3.0, 
    thickness: 5.0, // cm
    shape: 'FLAT', // FLAT, DOME_A, DOME_B
    yieldStrength: 70000000 
  });

  const [isBreached, setIsBreached] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [fatigue, setFatigue] = useState(0); // 0 to 100%
  
  // Extended history state for charts
  const [history, setHistory] = useState<{ 
    time: number; 
    envAPressure: number; envBPressure: number; 
    force: number; fatigue: number;
    envATempC: number; envBTempC: number;
    envADensity: number; envBDensity: number;
    envAMass: number; envBMass: number;
  }[]>([]);
  const [timeTick, setTimeTick] = useState(0);

  // Initial calculation of n
  useEffect(() => {
    const nA = (envA.pressure * 1000 * CONST_VOLUME) / (R * envA.tempK);
    const nB = (envB.pressure * 1000 * CONST_VOLUME) / (R * envB.tempK);
    setEnvA(prev => ({ ...prev, n: nA }));
    setEnvB(prev => ({ ...prev, n: nB }));
  }, []);

  const applyMetabolism = (env: typeof envA) => {
    if (env.homeostasis || env.lifeform === 'NONE') return env;
    
    let newMixture = [...env.mixture];
    const rate = env.metabolismRate * 0.2; 
    let newTemp = env.tempK + (rate * 0.5); 

    const modifyGas = (consumeId: string, produceId: string) => {
      let consumedIdx = newMixture.findIndex(m => m.gasId === consumeId);
      let producedIdx = newMixture.findIndex(m => m.gasId === produceId);

      if (consumedIdx !== -1 && newMixture[consumedIdx].percentage > 0.5) {
        newMixture[consumedIdx].percentage = Math.max(0, newMixture[consumedIdx].percentage - rate);
        if (producedIdx !== -1) {
          newMixture[producedIdx].percentage += rate;
        } else {
          newMixture.push({ gasId: produceId, percentage: rate });
        }
      }
    };

    if (env.lifeform === 'HUMAN') modifyGas('O2', 'CO2');
    if (env.lifeform === 'XENOMORPH') modifyGas('NH3', 'N2');
    if (env.lifeform === 'SILICATE') modifyGas('CO2', 'O2');
    if (env.lifeform === 'CUSTOM') modifyGas(env.customConsume, env.customProduce);

    const newP = (env.n * R * newTemp) / (CONST_VOLUME * 1000);
    return { ...env, mixture: newMixture, tempK: newTemp, pressure: newP };
  };

  const calcAverageMass = (mixture: MixtureItem[]) => {
    const totalPct = mixture.reduce((sum, m) => sum + m.percentage, 0);
    if (totalPct === 0) return 29; 
    let totalMass = 0;
    mixture.forEach(m => {
      const gas = AVAILABLE_GASES.find(g => g.id === m.gasId);
      if (gas) totalMass += gas.mass * (m.percentage / totalPct);
    });
    return totalMass;
  };

  const area = barrier.width * barrier.height;
  const pressureDiffPa = Math.abs(envA.pressure - envB.pressure) * 1000;
  const force = pressureDiffPa * area;
  
  // Custom Barrier Math
  const thicknessMultiplier = barrier.thickness / 5.0; // 5cm is 1.0 baseline
  let shapeMultiplier = 1.0;
  const isPushingRight = (envA.pressure - envB.pressure) > 0;
  if (barrier.shape === 'DOME_A' && isPushingRight) shapeMultiplier = 1.15; // Dome resists internal pressure better
  if (barrier.shape === 'DOME_B' && !isPushingRight) shapeMultiplier = 1.15;

  const maxForce = (barrier.yieldStrength * area) * thicknessMultiplier * shapeMultiplier;

  useEffect(() => {
    if (isBreached || !isRunning) return; 
    const interval = setInterval(() => {
      setTimeTick(t => t + 1);
      setEnvA(prev => applyMetabolism(prev));
      setEnvB(prev => applyMetabolism(prev));
      
      // Fatigue calculation
      setFatigue(prevFat => {
        const stressRatio = force / maxForce;
        let nextFatigue = prevFat;
        if (stressRatio >= 0.95) {
          nextFatigue += 15; // Rapid failure
        } else if (stressRatio > 0.6) {
          nextFatigue += (stressRatio - 0.6) * 10; // Slow fatigue accumulation
        } else {
          nextFatigue -= 2; // Recovery if stress drops below 60%
        }
        return Math.max(0, Math.min(100, nextFatigue));
      });

    }, 1000);
    return () => clearInterval(interval);
  }, [isBreached, force, maxForce]);

  // History updater
  useEffect(() => {
    if (isBreached || !isRunning) return;
    
    const dA = (envA.pressure * 1000 * (calcAverageMass(envA.mixture) / 1000)) / (R * envA.tempK);
    const dB = (envB.pressure * 1000 * (calcAverageMass(envB.mixture) / 1000)) / (R * envB.tempK);

    setHistory(prev => {
      const newHist = [...prev, { 
        time: timeTick, 
        envAPressure: envA.pressure, envBPressure: envB.pressure, 
        force, fatigue,
        envATempC: envA.tempK - 273.15, envBTempC: envB.tempK - 273.15,
        envADensity: dA, envBDensity: dB,
        envAMass: dA * CONST_VOLUME, envBMass: dB * CONST_VOLUME
      }];
      if (newHist.length > 60) newHist.shift(); 
      return newHist;
    });
  }, [timeTick, envA.pressure, envB.pressure, force, envA.tempK, envB.tempK, envA.mixture, envB.mixture, fatigue, isBreached]);

  const handleEnvATempChange = (newTempK: number) => {
    const newP = (envA.n * R * newTempK) / (CONST_VOLUME * 1000);
    setEnvA(prev => ({ ...prev, tempK: newTempK, pressure: newP }));
  };

  const handleEnvAPressureChange = (newP: number) => {
    const newN = (newP * 1000 * CONST_VOLUME) / (R * envA.tempK);
    setEnvA(prev => ({ ...prev, pressure: newP, n: newN }));
  };

  const handleEnvBTempChange = (newTempK: number) => {
    const newP = (envB.n * R * newTempK) / (CONST_VOLUME * 1000);
    setEnvB(prev => ({ ...prev, tempK: newTempK, pressure: newP }));
  };

  const handleEnvBPressureChange = (newP: number) => {
    const newN = (newP * 1000 * CONST_VOLUME) / (R * envB.tempK);
    setEnvB(prev => ({ ...prev, pressure: newP, n: newN }));
  };

  useEffect(() => {
    if ((force > maxForce || fatigue >= 100) && !isBreached) {
      setIsBreached(true);
      setIsRunning(false);
    }
  }, [force, maxForce, fatigue, isBreached]);

  const resetSimulation = () => {
    setIsBreached(false);
    setIsRunning(false);
    setHistory([]);
    setTimeTick(0);
    setFatigue(0);
    setEnvA(prev => {
      const p = 101.3;
      const t = 293.15;
      const n = (p * 1000 * CONST_VOLUME) / (R * t);
      return { ...prev, pressure: p, tempK: t, n: n, homeostasis: true };
    });
    setEnvB(prev => {
      const p = 101.3;
      const t = 293.15;
      const n = (p * 1000 * CONST_VOLUME) / (R * t);
      return { ...prev, pressure: p, tempK: t, n: n, homeostasis: true };
    });
    setBarrier({ width: 2.0, height: 3.0, thickness: 5.0, shape: 'FLAT', yieldStrength: 70000000 });
  };

  return (
    <div style={{ padding: '10px 20px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <header style={{ textAlign: 'center', marginBottom: '5px' }}>
        <h1 style={{ fontFamily: 'var(--font-data)', color: 'var(--neon-cyan)', fontSize: '2rem', letterSpacing: '4px', textShadow: 'var(--glow-cyan)', margin: 0 }}>
          DUAL-ENVIRONMENT CONTROL DASHBOARD
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
          <p style={{ color: '#888', margin: 0 }}>SYSTEM STATUS: {isBreached ? <span style={{ color: 'var(--neon-red)' }}>COMPROMISED</span> : <span style={{ color: 'var(--neon-blue)' }}>NOMINAL</span>}</p>
          <button 
             onClick={() => setIsRunning(!isRunning)}
             disabled={isBreached}
             style={{
               background: isBreached ? '#333' : (isRunning ? 'var(--neon-orange)' : 'var(--neon-cyan)'),
               color: '#000', border: 'none', padding: '5px 20px', borderRadius: '4px',
               cursor: isBreached ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontFamily: 'var(--font-data)',
               letterSpacing: '1px'
             }}
          >
             {isRunning ? '⏸ PAUSE SIMULATION' : '▶ START SIMULATION'}
          </button>
          <button 
             onClick={resetSimulation}
             style={{
               background: '#222', color: '#fff', border: '1px solid #555', padding: '5px 15px', borderRadius: '4px',
               cursor: 'pointer', fontFamily: 'var(--font-data)'
             }}
          >
             🔄 RESET DATA
          </button>
        </div>
      </header>

      {/* COMPACT UI: 3-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <EnvironmentPanel 
            title="Environment A"
            pressure={envA.pressure} temperatureK={envA.tempK} mixture={envA.mixture} averageMolarMass={calcAverageMass(envA.mixture)}
            lifeform={envA.lifeform} metabolismRate={envA.metabolismRate} homeostasis={envA.homeostasis} customConsume={envA.customConsume} customProduce={envA.customProduce}
            onTempChange={handleEnvATempChange} onPressureChange={handleEnvAPressureChange} onMixtureChange={(m) => setEnvA(prev => ({ ...prev, mixture: m }))}
            onLifeformChange={(lf) => setEnvA(prev => ({...prev, lifeform: lf}))} onMetabolismChange={(rate) => setEnvA(prev => ({...prev, metabolismRate: rate}))}
            onHomeostasisChange={(h) => setEnvA(prev => ({...prev, homeostasis: h}))} onCustomLifeformChange={(c, p) => setEnvA(prev => ({...prev, customConsume: c, customProduce: p}))}
            locked={isBreached}
          />
        </div>

        {/* Center Structural and Barrier Core */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <StructuralVisualizer 
            envAPressure={envA.pressure} envBPressure={envB.pressure} area={area}
            force={force} yieldStrength={maxForce / area} shape={barrier.shape} fatigue={fatigue}
          />
          <BarrierPanel 
            width={barrier.width} height={barrier.height} thickness={barrier.thickness} shape={barrier.shape} yieldStrength={barrier.yieldStrength}
            onWidthChange={(w) => setBarrier(prev => ({...prev, width: w}))} onHeightChange={(h) => setBarrier(prev => ({...prev, height: h}))} onThicknessChange={(t) => setBarrier(prev => ({...prev, thickness: t}))}
            onShapeChange={(s) => setBarrier(prev => ({...prev, shape: s}))} onYieldChange={(y) => setBarrier(prev => ({...prev, yieldStrength: y}))} locked={isBreached}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <EnvironmentPanel 
            title="Environment B (Exterior)"
            pressure={envB.pressure} temperatureK={envB.tempK} mixture={envB.mixture} averageMolarMass={calcAverageMass(envB.mixture)}
            lifeform={envB.lifeform} metabolismRate={envB.metabolismRate} homeostasis={envB.homeostasis} customConsume={envB.customConsume} customProduce={envB.customProduce}
            onTempChange={handleEnvBTempChange} onPressureChange={handleEnvBPressureChange} onMixtureChange={(m) => setEnvB(prev => ({ ...prev, mixture: m }))}
            onLifeformChange={(lf) => setEnvB(prev => ({...prev, lifeform: lf}))} onMetabolismChange={(rate) => setEnvB(prev => ({...prev, metabolismRate: rate}))}
            onHomeostasisChange={(h) => setEnvB(prev => ({...prev, homeostasis: h}))} onCustomLifeformChange={(c, p) => setEnvB(prev => ({...prev, customConsume: c, customProduce: p}))}
            locked={isBreached}
          />
        </div>
      </div>

      {/* COMPACT UI: Data Visualizer Array */}
      <DataVisualizer envAMixture={envA.mixture} envBMixture={envB.mixture} history={history} />

      {isBreached && <BreachAlert onReset={resetSimulation} />}
    </div>
  );
}

export default App;
