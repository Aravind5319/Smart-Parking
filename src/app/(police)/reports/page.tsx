'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Search, Filter, Eye, Check, X, ShieldAlert } from 'lucide-react';

const mockReports = [
  { id: 'REP-24-9824', type: 'Illegal Parking', reg: 'TN-32-AB-1234', location: 'Mission Street', time: '12m ago', priority: 'High', status: 'Pending' },
  { id: 'REP-24-9825', type: 'No Helmet', reg: 'PY-01-CV-9876', location: 'JN Street', time: '45m ago', priority: 'Medium', status: 'Pending' },
  { id: 'REP-24-9826', type: 'Traffic Signal Jump', reg: 'TN-01-ZX-5555', location: 'Goubert Avenue', time: '1h ago', priority: 'High', status: 'Under Review' },
  { id: 'REP-24-9827', type: 'Wrong Way', reg: 'PY-05-AB-1111', location: 'Dumas Street', time: '2h ago', priority: 'High', status: 'Verified' },
  { id: 'REP-24-9828', type: 'Over-speeding', reg: 'TN-31-XY-9999', location: 'ECR Road', time: '3h ago', priority: 'Medium', status: 'Action Taken' },
];

export default function ReportsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'New', 'Under Review', 'Verified', 'Action Taken', 'Dismissed'];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-subtle-border">
      
      <div className="p-4 border-b border-subtle-border flex items-center justify-between">
        <h1 className="text-xl font-bold text-main-text">{t.dashboard.reports}</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-ivory text-main-text font-medium text-sm rounded-md border border-subtle-border hover:bg-subtle-border transition-colors">
            <Filter size={16} />
            Filters
          </button>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search size={16} className="text-main-text/40" />
            </div>
            <input 
              type="text" 
              placeholder="Search reports..."
              className="block w-64 pl-8 pr-3 py-1.5 border border-subtle-border rounded-md leading-5 bg-white placeholder-main-text/40 focus:outline-none focus:ring-1 focus:ring-police focus:border-police sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-subtle-border flex gap-4 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
              activeTab === tab ? 'bg-police text-white' : 'text-main-text/70 hover:bg-ivory'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-subtle-border">
          <thead className="bg-ivory/50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-main-text/60 uppercase tracking-wider">Ref ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-main-text/60 uppercase tracking-wider">Violation</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-main-text/60 uppercase tracking-wider">Vehicle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-main-text/60 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-main-text/60 uppercase tracking-wider">Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-main-text/60 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-main-text/60 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-subtle-border">
            {mockReports.map((report) => (
              <tr key={report.id} className="hover:bg-ivory/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-police">
                  {report.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {report.priority === 'High' && <ShieldAlert size={16} className="text-urgent mr-2" />}
                    <span className="text-sm font-medium text-main-text">{report.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-main-text/80 font-mono">
                  {report.reg}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-main-text/80">
                  {report.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-main-text/60">
                  {report.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${report.status === 'Pending' ? 'bg-amber/10 text-amber' : 
                      report.status === 'Under Review' ? 'bg-police/10 text-police' : 
                      report.status === 'Verified' ? 'bg-teal/10 text-teal' :
                      'bg-main-text/10 text-main-text'}`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                  <button className="text-police hover:text-police/80 bg-police/5 p-1.5 rounded-md" title="Review">
                    <Eye size={16} />
                  </button>
                  <button className="text-teal hover:text-teal/80 bg-teal/5 p-1.5 rounded-md" title="Verify">
                    <Check size={16} />
                  </button>
                  <button className="text-urgent hover:text-urgent/80 bg-urgent/5 p-1.5 rounded-md" title="Dismiss">
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
