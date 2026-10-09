'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { BrainCircuit, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { time: '08:00', risk: 20 },
  { time: '10:00', risk: 45 },
  { time: '12:00', risk: 30 },
  { time: '14:00', risk: 80 },
  { time: '16:00', risk: 65 },
  { time: '18:00', risk: 90 },
  { time: '20:00', risk: 50 },
];

export default function PredictionsPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-main-text flex items-center gap-2">
          <BrainCircuit className="text-police" />
          {t.dashboard.predictions}
        </h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-main-text/60 bg-white px-3 py-1.5 rounded-md border border-subtle-border">
          <div className="w-2 h-2 rounded-full bg-teal animate-pulse"></div>
          AI Engine Connected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Alert */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-urgent/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-urgent"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-urgent font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle size={16} /> High Risk Alert
              </div>
              <h2 className="text-2xl font-bold text-main-text">Severe Congestion Forecast</h2>
              <p className="text-main-text/70 mt-1">Goubert Avenue & JN Street intersection</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-main-text">Impact Time</div>
              <div className="text-lg font-bold text-amber">18:00 - 20:30</div>
            </div>
          </div>
          
          <div className="bg-ivory/50 rounded-md p-4 mb-4">
            <h3 className="text-sm font-semibold text-main-text mb-2">Recommended Actions</h3>
            <ul className="list-disc list-inside text-sm text-main-text/80 space-y-1">
              <li>Deploy 2 additional patrol units to JN Street.</li>
              <li>Activate temporary parking restrictions on side streets.</li>
              <li>Clear ambulance corridor along Mission Street.</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-police text-white text-sm font-medium rounded-md hover:bg-police/90 transition-colors">
              Dispatch Patrols
            </button>
            <button className="px-4 py-2 bg-ivory text-main-text text-sm font-medium rounded-md hover:bg-sandstone/30 transition-colors border border-subtle-border">
              View Detailed Heatmap
            </button>
          </div>
        </div>

        {/* Status panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-subtle-border">
          <h3 className="font-semibold text-main-text mb-4">Model Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-subtle-border pb-3">
              <span className="text-sm text-main-text/70">Data Recency</span>
              <span className="text-sm font-medium flex items-center gap-1"><Clock size={14} className="text-teal" /> 2m ago</span>
            </div>
            <div className="flex justify-between items-center border-b border-subtle-border pb-3">
              <span className="text-sm text-main-text/70">Prediction Confidence</span>
              <span className="text-sm font-medium text-teal">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-main-text/70">Analyzed Reports (24h)</span>
              <span className="text-sm font-medium text-main-text">1,248</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-subtle-border min-h-[300px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-main-text flex items-center gap-2">
            <TrendingUp size={18} className="text-amber" />
            Traffic Risk Trend - Next 12 Hours
          </h3>
        </div>
        <div className="flex-1 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C84646" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C84646" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#253449', opacity: 0.7, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#253449', opacity: 0.7, fontSize: 12 }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDE3EA" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #DDE3EA', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#C84646', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="risk" stroke="#C84646" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
