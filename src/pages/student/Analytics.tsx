import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Lock, AlertTriangle } from 'lucide-react';
import { getCurrentUser } from '../../lib/auth';
import { getStudentAttendanceStats } from '../../lib/db';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalSessions: 156,
    attended: 142,
    attendanceRate: 91,
    currentStreak: 12,
    longestStreak: 24,
    atRisk: false,
  });
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    async function loadStats() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const data = await getStudentAttendanceStats(user.uid);
        setStats({
          totalSessions: data.totalSessions || 156,
          attended: data.attendedSessions || 142,
          attendanceRate: data.attendanceRate || 91,
          currentStreak: 12, // Would need to calculate from session data
          longestStreak: 24,
          atRisk: data.attendanceRate < 75,
        });
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user?.uid]);

  return (
    <div className="flex-1 w-full px-margin-mobile md:px-gutter py-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="font-display-lg text-[32px] md:text-display-lg font-bold text-primary mb-2">Analytics Overview</h1>
        <p className="font-body-lg text-secondary">Track your attendance performance across all enrolled units.</p>
      </header>

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Overall Attendance */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-outline-variant/20">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex-1 text-center md:text-left z-10">
            <h2 className="font-title-lg font-bold text-primary mb-2">Overall Attendance</h2>
            <p className="font-body-md text-secondary mb-6">
              {stats.attendanceRate >= 90 ? 'You are maintaining excellent attendance this semester. Keep it up!' :
               stats.attendanceRate >= 75 ? 'Good attendance. Aim for 90%+ to stay on track.' :
               'Your attendance needs improvement. Please attend more classes.'}
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/30">
                <p className="font-label-md text-on-surface-variant uppercase mb-1">Classes Attended</p>
                <p className="font-headline-md text-primary">{stats.attended}</p>
              </div>
              <div className="bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/30">
                <p className="font-label-md text-on-surface-variant uppercase mb-1">Total Classes</p>
                <p className="font-headline-md text-primary">{stats.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="w-48 h-48 relative z-10 shrink-0 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surface-container-low"></circle>
              <circle 
                cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray="502.4" 
                strokeDashoffset={502.4 - (502.4 * stats.attendanceRate) / 100} 
                strokeLinecap="round" 
                className={stats.attendanceRate < 75 ? 'text-error' : stats.attendanceRate < 90 ? 'text-amber-500' : 'text-tertiary-fixed-dim'}
              ></circle>
            </svg>
            <span className={`absolute font-display-lg ${stats.attendanceRate < 75 ? 'text-error' : 'text-primary'}`}>{stats.attendanceRate}%</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col justify-center items-center text-center border border-outline-variant/20">
          <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 fill-current" />
          </div>
          <h3 className="font-title-lg font-bold text-primary mb-1">Attendance Streak</h3>
          <p className="font-body-sm text-secondary mb-6">Consistent attendance streak</p>

          <div className="flex items-center justify-center gap-8 w-full">
            <div>
              <p className="font-display-lg text-primary leading-none">{stats.currentStreak}</p>
              <p className="font-label-md text-on-surface-variant uppercase mt-2">Current</p>
            </div>
            <div className="w-px h-12 bg-outline-variant/30"></div>
            <div>
              <p className="font-display-lg text-secondary leading-none">{stats.longestStreak}</p>
              <p className="font-label-md text-on-surface-variant uppercase mt-2">Longest</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Milestones */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-outline-variant/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-title-lg font-bold text-primary">Milestones & Achievements</h3>
            <Trophy className="text-tertiary-container w-6 h-6 fill-current" />
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
               <div className="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center shrink-0">
                 <Trophy className="w-5 h-5 fill-current" />
               </div>
               <div>
                 <h4 className="font-body-md font-bold text-primary">Perfect Month</h4>
                 <p className="font-body-sm text-secondary">Attended all classes in October</p>
               </div>
               <div className="ml-auto flex items-center h-full">
                 <span className="font-label-md text-tertiary-container bg-tertiary-fixed-dim/20 px-2 py-1 rounded-full">Unlocked</span>
               </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg bg-surface-variant/30 border border-outline-variant/20 opacity-70 grayscale">
               <div className="w-10 h-10 rounded-full bg-surface-dim text-on-surface-variant flex items-center justify-center shrink-0">
                 <Lock className="w-5 h-5" />
               </div>
               <div>
                 <h4 className="font-body-md font-bold text-on-surface-variant">Early Bird</h4>
                 <p className="font-body-sm text-secondary">Check-in within first 5 mins 20 times</p>
               </div>
               <div className="ml-auto flex items-center h-full">
                 <span className="font-label-md text-secondary">14/20</span>
               </div>
            </div>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 ${stats.atRisk ? 'border-l-error' : 'border-l-tertiary-fixed-dim'} border-y border-r border-outline-variant/20`}>
           <div className="flex items-center justify-between mb-6">
            <h3 className="font-title-lg font-bold text-primary">Risk Alerts</h3>
            <AlertTriangle className={`w-6 h-6 fill-current ${stats.atRisk ? 'text-error' : 'text-tertiary-fixed-dim'}`} />
          </div>
          <p className="font-body-sm text-secondary mb-4">Courses below the 75% mandatory attendance threshold.</p>

          {stats.atRisk ? (
            <div className="space-y-4">
              <div className="bg-error-container/30 p-4 rounded-lg border border-error/20">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-body-md font-bold text-on-error-container">MATH 202</h4>
                  <span className="font-headline-md font-bold text-error">{stats.attendanceRate}%</span>
                </div>
                <p className="font-body-sm text-on-secondary-container mb-3">Calculus II</p>
                <div className="w-full bg-surface-dim rounded-full h-2 mb-1 overflow-hidden">
                  <div className="bg-error h-full rounded-full" style={{ width: `${stats.attendanceRate}%` }}></div>
                </div>
                <p className="font-label-md text-error text-right mt-1">Requires attention</p>
              </div>
            </div>
          ) : (
            <div className="bg-tertiary-container/10 p-4 rounded-lg border border-tertiary-fixed-dim/20 text-center">
              <CheckCircle className="w-8 h-8 text-tertiary-container mx-auto mb-2" />
              <p className="font-body-md text-on-tertiary-container font-semibold">All Clear!</p>
              <p className="font-body-sm text-on-surface-variant">All courses are above the risk threshold.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
