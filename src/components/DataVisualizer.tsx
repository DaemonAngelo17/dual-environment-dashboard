import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AVAILABLE_GASES } from './EnvironmentPanel';
import type { MixtureItem } from './EnvironmentPanel';

interface DataPoint {
  time: number;
  envAPressure: number; envBPressure: number;
  force: number; fatigue: number;
  envATempC: number; envBTempC: number;
  envADensity: number; envBDensity: number;
  envAMass: number; envBMass: number;
}

interface EnvState {
  mixture: MixtureItem[];
  lifeform: string;
  tempK: number;
  pressure: number;
}

interface DataVisualizerProps {
  envA: EnvState;
  envB: EnvState;
  history: DataPoint[];
}

const COLORS = ['#45a29e', '#66fcf1', '#ff3333', '#ff8c00', '#f1c40f', '#9b59b6'];

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ envA, envB, history }) => {
  
  const getChartData = (mixture: MixtureItem[]) => {
    const total = mixture.reduce((sum, m) => sum + m.percentage, 0);
    return mixture.map(m => ({
      name: AVAILABLE_GASES.find(g => g.id === m.gasId)?.name || m.gasId,
      value: (m.percentage / total) * 100
    }));
  };

  const dataA = getChartData(envA.mixture);
  const dataB = getChartData(envB.mixture);

  const checkDanger = (env: EnvState) => {
    const danger = { temp: false, pressure: false, gas: false };
    const tC = env.tempK - 273.15;
    const p = env.pressure;
    const totalGas = env.mixture.reduce((s, m) => s + m.percentage, 0);

    if (env.lifeform === 'HUMAN') {
      if (tC < 0 || tC > 40) danger.temp = true;
      if (p < 70 || p > 150) danger.pressure = true;
      const o2 = env.mixture.find(m => m.gasId === 'O2')?.percentage || 0;
      if ((o2 / totalGas) < 0.16) danger.gas = true;
    }
    if (env.lifeform === 'XENOMORPH') {
      if (tC < -73 || tC > -23) danger.temp = true;
      if (p < 200 || p > 500) danger.pressure = true;
      const nh3 = env.mixture.find(m => m.gasId === 'NH3')?.percentage || 0;
      if ((nh3 / totalGas) < 0.20) danger.gas = true;
    }
    if (env.lifeform === 'SILICATE') {
      if (tC < 226 || tC > 526) danger.temp = true;
      if (p < 1000 || p > 5000) danger.pressure = true;
      const co2 = env.mixture.find(m => m.gasId === 'CO2')?.percentage || 0;
      if ((co2 / totalGas) < 0.50) danger.gas = true;
    }
    return danger;
  };

  const dangerA = checkDanger(envA);
  const dangerB = checkDanger(envB);

  const dangerStyle = { 
    border: '1px solid var(--neon-red)', 
    borderRadius: '4px',
    animation: 'pulseRed 1s infinite alternate',
    boxShadow: '0 0 10px rgba(255, 0, 0, 0.3)'
  };
  
  const baseBox = { height: '220px', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px' } as React.CSSProperties;

  return (
    <div className="panel flex-col gap-2" style={{ padding: '10px 15px' }}>
      <style>
        {`
          @keyframes pulseRed {
            from { box-shadow: 0 0 5px rgba(255, 0, 0, 0.2); border-color: #550000; }
            to { box-shadow: 0 0 20px rgba(255, 0, 0, 0.8); border-color: #ff0000; }
          }
        `}
      </style>
      <h2 className="title-glow" style={{ color: '#fff', fontSize: '1.2rem', margin: 0, paddingBottom: '5px' }}>Thermodynamic Analytics Array</h2>
      
      {/* 2-Column Wide Grid for Enlarged Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
        
        {/* Module 1: Atmospheres (Split Pie Charts) */}
        <div style={{ ...baseBox }}>
          <h3 style={{ fontSize: '1rem', color: '#ccc', margin: 0, marginBottom: '5px', textAlign: 'center' }}>Atmospheric Composition</h3>
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Env A Box */}
            <div style={{ flex: 1, ...(dangerA.gas ? dangerStyle : {}) }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    {dataA.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} contentStyle={{background: '#111', border: '1px solid #444', fontSize: '0.9rem', padding: '5px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ fontSize: '0.8rem', textAlign: 'center', color: dangerA.gas ? 'var(--neon-red)' : '#888' }}>
                {dangerA.gas ? '⚠ TOXIC/ASPHYXIATION' : 'Env A'}
              </div>
            </div>

            {/* Env B Box */}
            <div style={{ flex: 1, ...(dangerB.gas ? dangerStyle : {}) }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataB} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    {dataB.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} contentStyle={{background: '#111', border: '1px solid #444', fontSize: '0.9rem', padding: '5px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ fontSize: '0.8rem', textAlign: 'center', color: dangerB.gas ? 'var(--neon-red)' : '#888' }}>
                {dangerB.gas ? '⚠ TOXIC/ASPHYXIATION' : 'Env B'}
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Pressure History */}
        <div style={{ ...baseBox, ...((dangerA.pressure || dangerB.pressure) ? dangerStyle : {}) }}>
          <h3 style={{ fontSize: '1rem', color: (dangerA.pressure || dangerB.pressure) ? 'var(--neon-red)' : '#ccc', textAlign: 'center', margin: 0, marginBottom: '5px' }}>
            Pressure History (kPa) {(dangerA.pressure || dangerB.pressure) && '⚠ LETHAL CRUSH/VACUUM'}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickFormatter={(val) => `${val}s`} />
              <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'var(--neon-blue)', fontSize: '0.9rem', padding: '8px' }} formatter={(value: any) => Number(value).toFixed(2)} />
              <Line type="monotone" dataKey="envAPressure" name="Env A" stroke="var(--neon-cyan)" dot={false} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="envBPressure" name="Env B" stroke="#fff" dot={false} strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Module 3: Temperature History */}
        <div style={{ ...baseBox, ...((dangerA.temp || dangerB.temp) ? dangerStyle : {}) }}>
          <h3 style={{ fontSize: '1rem', color: (dangerA.temp || dangerB.temp) ? 'var(--neon-red)' : '#ccc', textAlign: 'center', margin: 0, marginBottom: '5px' }}>
            Temperature History (°C) {(dangerA.temp || dangerB.temp) && '⚠ LETHAL THERMAL ZONE'}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickFormatter={(val) => `${val}s`} />
              <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'var(--neon-orange)', fontSize: '0.9rem', padding: '8px' }} formatter={(value: any) => Number(value).toFixed(1)} />
              <Line type="monotone" dataKey="envATempC" name="Env A" stroke="var(--neon-orange)" dot={false} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="envBTempC" name="Env B" stroke="#f1c40f" dot={false} strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Module 4: Total Gas Mass */}
        <div style={{ ...baseBox }}>
          <h3 style={{ fontSize: '1rem', color: '#ccc', textAlign: 'center', margin: 0, marginBottom: '5px' }}>Total Gas Mass (kg)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorMass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#45a29e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#45a29e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickFormatter={(val) => `${val}s`} />
              <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#45a29e', fontSize: '0.9rem', padding: '8px' }} formatter={(value: any) => Number(value).toFixed(2)} />
              <Area type="monotone" dataKey="envAMass" name="Env A Mass" stroke="#45a29e" fillOpacity={1} fill="url(#colorMass)" isAnimationActive={false}/>
              <Area type="monotone" dataKey="envBMass" name="Env B Mass" stroke="#888" fillOpacity={0.5} fill="#333" isAnimationActive={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Module 5: Atmospheric Density */}
        <div style={{ ...baseBox }}>
          <h3 style={{ fontSize: '1rem', color: '#ccc', textAlign: 'center', margin: 0, marginBottom: '5px' }}>Atmospheric Density (kg/m³)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickFormatter={(val) => `${val}s`} />
              <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#66fcf1', fontSize: '0.9rem', padding: '8px' }} formatter={(value: any) => Number(value).toFixed(2)} />
              <Line type="monotone" dataKey="envADensity" name="Env A" stroke="#66fcf1" dot={false} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="envBDensity" name="Env B" stroke="#aaa" dot={false} strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Module 6: Fatigue Accumulation */}
        <div style={{ ...baseBox }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--neon-red)', textAlign: 'center', margin: 0, marginBottom: '5px', textShadow: '0 0 5px var(--neon-red)' }}>Structural Fatigue (%)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--neon-red)" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="var(--neon-red)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickFormatter={(val) => `${val}s`} />
              <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'var(--neon-red)', fontSize: '0.9rem', padding: '8px' }} formatter={(value: any) => Number(value).toFixed(1)} />
              <Area type="monotone" dataKey="fatigue" name="Fatigue" stroke="var(--neon-red)" fillOpacity={1} fill="url(#colorFatigue)" isAnimationActive={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};
