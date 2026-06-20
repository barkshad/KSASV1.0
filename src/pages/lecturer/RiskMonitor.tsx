import React from 'react';
import { AlertTriangle, ChevronDown, CheckCircle, TrendingDown, Eye, Mail, Stethoscope } from 'lucide-react';

export default function RiskMonitor() {
  return (
    <div className="p-md md:p-lg max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Summary Alert Widget */}
      <div className="mb-lg relative overflow-hidden bg-error-container rounded-xl p-6 shadow-sm border border-error/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="text-error w-6 h-6 fill-current" />
            <h2 className="font-title-lg text-on-error-container">Action Required</h2>
          </div>
          <p className="font-body-md text-on-error-container/80">
            <span className="font-bold">12 Students</span> currently fall below the required attendance threshold. Their academic performance is at critical risk.
          </p>
        </div>
        <button className="relative z-10 px-6 py-2 bg-error text-on-error rounded-full font-label-md flex items-center gap-2 hover:bg-error/90 transition-all active:scale-95">
          Batch Intervene
        </button>
      </div>

      {/* Categorization Chips */}
      <div className="flex flex-wrap gap-4 mb-lg">
        <button className="px-6 py-2 rounded-full border border-error bg-error/5 text-error font-bold flex items-center gap-2">
          High Risk (&lt;50%)
          <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full">8</span>
        </button>
        <button className="px-6 py-2 rounded-full border border-amber-600 bg-amber-50 text-amber-700 font-bold flex items-center gap-2">
          Medium Risk (50-75%)
          <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full">4</span>
        </button>
        <button className="px-6 py-2 rounded-full border border-tertiary-fixed-dim bg-tertiary/5 text-on-tertiary-fixed-variant font-bold flex items-center gap-2">
          Low Risk (&gt;75%)
          <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed text-[10px] px-2 py-0.5 rounded-full">142</span>
        </button>
      </div>

      {/* At-Risk Student List */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 font-label-md text-outline">STUDENT</th>
                <th className="px-6 py-4 font-label-md text-outline">REG NUMBER</th>
                <th className="px-6 py-4 font-label-md text-outline">ATTENDANCE</th>
                <th className="px-6 py-4 font-label-md text-outline">TREND</th>
                <th className="px-6 py-4 font-label-md text-outline text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              <tr className="hover:bg-surface-container/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-variant flex-shrink-0">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYjJJyaipTeCeSo6hiSilblBw7zzzPxjsRbAO9qugMJQLCklZdSS2rupL7G90_5xeNskxwUs8GBINxVfsq9zVEeSPz5mP9cb5i-WlYS8oQeFyOxAhbeNlGKQYEv5L_R-WN5qhMVLyRrz0O4gj5fe_WJTZdFyj__mElUOfbjgin9Tk5iYvWPQyuNIptYRtLdsT_2IAkwFPVLTkr8T2Uprd2bA233kPbkrvRZ7P-D8xML8rqF-Q_IltCo6sQOv0rvtgxi0xceLIhy8L-" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-title-lg text-body-md font-bold text-on-surface">Alex Mwangi</p>
                      <p className="text-xs text-outline">BSc Computer Science</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-on-surface-variant font-body-sm">KAB/CSC/2021/045</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 w-32">
                    <span className="text-xs font-bold text-error">32%</span>
                    <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-error rounded-full" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-error">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs font-bold">-12% vs last month</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"><Eye className="w-5 h-5"/></button>
                    <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Mail className="w-5 h-5"/></button>
                    <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"><Stethoscope className="w-5 h-5"/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
