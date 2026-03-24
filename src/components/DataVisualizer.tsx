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

interface DataVisualizerProps {
  envAMixture: MixtureItem[];
  envBMixture: MixtureItem[];
  history: DataPoint[];
}

const COLORS = ['#45a29e', '#66fcf1', '#ff3333', '#ff8c00', '#f1c40f', '#9b59b6'];

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ envAMixture, envBMixture, history }) => {
  
  const getChartData = (mixture: MixtureItem[]) => {
    const total = mixture.reduce((sum, m) => sum + m.percentage, 0);
    return mixture.map(m => ({
      name: AVAILABLE_GASES.find(g => g.id === m.gasId)?.name || m.gasId,
      value: (m.percentage / total) * 100
    }));
  };

  const dataA = getChartData(envAMixture);
  const dataB = getChartData(envBMixture);

  return (
    <div className="panel flex-col gap-2" style={{ padding: '10px 15px' }}>
      <h2 className="title-glow" style={{ color: '#fff', fontSize: '1.1rem', margin: 0, paddingBottom: '5px' }}>Thermodynamic Analytics Array</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
        
        {/* Module 1: Atmospheres (Split Pie Charts) */}
        <div style={{ height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#ccc', margin: 0, marginBottom: '5px' }}>Atmospheric Composition</h3>
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={dataA} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" stroke="none">
                  {dataA.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} contentStyle={{background: '#111', border: '1px solid #444', fontSize: '0.7rem', padding: '5px'}} />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={dataB} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" stroke="none">
                  {dataB.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} contentStyle={{background: '#111', border: '1px solid #444', fontSize: '0.7rem', padding: '5px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Module 2: Pressure History */}
        <div style={{ height: '140px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#ccc', textAlign: 'center', margin: 0, marginBottom: '5px' }}>Pressure History (kPa)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'var(--neon-blue)', fontSize: '0.7rem', padding: '5px' }} formatter={(value: any) => Number(value).toFixed(2)} />
              <Line type="monotone" dataKey="envAPressure" name="Env A" stroke="var(--neon-cyan)" dot={false} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="envBPressure" name="Env B" stroke="#fff" dot={false} strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Module 3: Temperature History */}
        <div style={{ height: '140px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#ccc', textAlign: 'center', margin: 0, marginBottom: '5px' }}>Temperature History (°C)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 9 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'var(--neon-orange)', fontSize: '0.7rem', padding: '5px' }} formatter={(value: any) => Number(value).toFixed(1)} />
              <Line type="monotone" dataKey="envATempC" name="Env A" stroke="var(--neon-orange)" dot={false} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="envBTempC" name="Env B" stroke="#f1c40f" dot={false} strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Module 4: Total Gas Mass */}
        <div style={{ height: '140px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#ccc', textAlign: 'center', margin: 0, marginBottom: '5px' }}>Total Gas Mass (kg)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#45a29e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#45a29e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#45a29e', fontSize: '0.7rem', padding: '5px' }} formatter={(value: any) => Number(value).toFixed(2)} />
              <Area type="monotone" dataKey="envAMass" name="Env A Mass" stroke="#45a29e" fillOpacity={1} fill="url(#colorMass)" isAnimationActive={false}/>
              <Area type="monotone" dataKey="envBMass" name="Env B Mass" stroke="#888" fillOpacity={0.5} fill="#333" isAnimationActive={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Module 5: Atmospheric Density */}
        <div style={{ height: '140px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#ccc', textAlign: 'center', margin: 0, marginBottom: '5px' }}>Atmospheric Density (kg/m³)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#66fcf1', fontSize: '0.7rem', padding: '5px' }} formatter={(value: any) => Number(value).toFixed(2)} />
              <Line type="monotone" dataKey="envADensity" name="Env A" stroke="#66fcf1" dot={false} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="envBDensity" name="Env B" stroke="#aaa" dot={false} strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Module 6: Fatigue Accumulation */}
        <div style={{ height: '140px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--neon-red)', textAlign: 'center', margin: 0, marginBottom: '5px', textShadow: '0 0 5px var(--neon-red)' }}>Structural Fatigue (%)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--neon-red)" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="var(--neon-red)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 9 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'var(--neon-red)', fontSize: '0.7rem', padding: '5px' }} formatter={(value: any) => Number(value).toFixed(1)} />
              <Area type="monotone" dataKey="fatigue" name="Fatigue" stroke="var(--neon-red)" fillOpacity={1} fill="url(#colorFatigue)" isAnimationActive={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};
