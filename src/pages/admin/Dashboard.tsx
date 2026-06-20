import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings, Users, BookOpen, UserPlus, Activity, CloudFog, Info, AlertOctagon, HelpCircle } from 'lucide-react';
import { getUsersByRole, getAllCourses, getActiveSessions, getRecentSessions, getAuditLogs } from '../../lib/db';
import { useActiveSessions } from '../../hooks/useFirestoreRealtime';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, lecturers: 0, courses: 0, liveSessions: 0 });
  const [avgRate, setAvgRate] = useState(87.6);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { count: liveSessionCount } = useActiveSessions();

  useEffect(() => {
    async function loadStats() {
      try {
        const [students, lecturers, courses, sessions, logs] = await Promise.all([
          getUsersByRole('student'),
          getUsersByRole('lecturer'),
          getAllCourses(),
          getRecentSessions(50),
          getAuditLogs(5),
        ]);

        setStats({
          students: students.length,
          lecturers: lecturers.length,
          courses: courses.length,
          liveSessions: sessions.filter((s: any) => s.status === 'open').length,
        });

        // Calculate average attendance rate from closed sessions
        let totalRate = 0;
        let closedCount = 0;
        for (const session of sessions) {
          if (session.status === 'closed' && session.attendanceRate) {
            totalRate += session.attendanceRate;
            closedCount++;
          }
        }
        if (closedCount > 0) setAvgRate(Math.round((totalRate / closedCount) * 10) / 10);

        setAuditLogs(logs);
      } catch (e) {
        console.error('Failed to load stats:', e);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="p-margin-mobile md:p-gutter max-w-7xl mx-auto w-full space-y-lg animate-in fade-in duration-500">
      
      {/* Stats Cards */}
      <div className="flex space-x-md overflow-x-auto hide-scrollbar pb-2 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
        <div className="min-w-[160px] flex-1 bg-surface-container-lowest border border-outline-variant/30 p-md rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase">Total Students</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-headline-md font-bold text-primary">{loading ? '...' : stats.students.toLocaleString()}</span>
            <span className="text-[10px] text-tertiary-container font-bold">+2.4%</span>
          </div>
        </div>
        <div className="min-w-[160px] flex-1 bg-surface-container-lowest border border-outline-variant/30 p-md rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase">Total Lecturers</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-headline-md font-bold text-primary">{loading ? '...' : stats.lecturers.toLocaleString()}</span>
          </div>
        </div>
        <div className="min-w-[160px] flex-1 bg-surface-container-lowest border border-outline-variant/30 p-md rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase">Active Courses</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-headline-md font-bold text-primary">{loading ? '...' : stats.courses.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        
        {/* Institutional Performance Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-4">
            <div>
              <h3 className="font-title-lg font-bold text-on-surface">Institutional Performance</h3>
              <p className="text-body-sm text-on-surface-variant">Real-time attendance & trend analysis</p>
            </div>
            <div className="flex items-center space-x-sm">
              <div className="bg-error/10 text-error px-3 py-1.5 rounded-full flex items-center space-x-2">
                <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">{liveSessionCount} Sessions Live</span>
              </div>
              <div className="bg-tertiary-container/10 text-tertiary-container px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-bold uppercase tracking-tighter">Rate: {avgRate}%</span>
              </div>
            </div>
          </div>
          
          <div className="h-48 w-full bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant/50 relative p-4 flex items-end justify-between space-x-1">
            <div className="w-full bg-primary/20 rounded-t-md h-[75%] relative"></div>
            <div className="w-full bg-primary/20 rounded-t-md h-[82%] relative"></div>
            <div className="w-full bg-primary/20 rounded-t-md h-[88%] relative"></div>
            <div className="w-full bg-primary/20 rounded-t-md h-[85%] relative"></div>
            <div className="w-full bg-primary rounded-t-md h-[92%] relative">
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary whitespace-nowrap">Today {avgRate}%</div>
            </div>
          </div>
        </div>

        {/* AI Intelligence Panel */}
        <div className="bg-primary text-on-primary rounded-2xl p-lg shadow-lg relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-32 h-32 bg-on-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
           <div>
             <div className="flex items-center space-x-2 mb-md z-10 relative">
               <CloudFog className="w-5 h-5" />
               <h3 className="font-label-md uppercase tracking-widest font-bold">AI Intelligence</h3>
             </div>
             <div className="space-y-md relative z-10">
               <div className="bg-on-primary/10 border border-on-primary/20 p-sm rounded-lg">
                 <p className="text-body-sm font-semibold">CSC220 Alert</p>
                 <p className="text-[11px] opacity-80 mt-1">Attendance declined by 18% in the last 4 sessions. Potential instructor feedback required.</p>
               </div>
               <div className="bg-error/20 border border-error/30 p-sm rounded-lg">
                 <p className="text-body-sm font-semibold">Student Risk Flag</p>
                 <p className="text-[11px] opacity-80 mt-1">45 students have crossed the "High Risk" threshold this week.</p>
               </div>
             </div>
           </div>
           <button className="mt-lg w-full py-2 bg-on-primary text-primary rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-on-primary/90 transition-all z-10 relative">View All Recommendations</button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Risk Center */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg shadow-sm">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-title-lg font-bold text-on-surface">Risk Center</h3>
            <Info className="text-on-surface-variant w-5 h-5" />
          </div>
          <div className="space-y-md">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-sm">
                 <div className="w-2 h-2 bg-error rounded-full"></div>
                 <span className="text-body-sm font-semibold">High Risk (&lt;50%)</span>
               </div>
               <span className="text-body-sm font-bold text-error">128</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
               <div className="bg-error h-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>

        {/* System Audit Feed */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg shadow-sm flex flex-col">
          <h3 className="font-title-lg font-bold text-on-surface mb-md">System Audit Feed</h3>
          <div className="flex-1 overflow-y-auto space-y-sm pr-1 max-h-[200px]">
            {loading ? (
              <p className="text-sm text-on-surface-variant">Loading...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No recent activity</p>
            ) : (
              auditLogs.map((log: any, i: number) => (
                <div key={log.id || i} className="flex items-start space-x-sm pb-sm border-b border-outline-variant/10">
                  <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                    <AlertOctagon className="w-4 h-4 text-error" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-on-surface">{log.action || 'System event'}</p>
                    <p className="text-[10px] text-on-surface-variant">{log.userEmail || 'System'} • {formatTimeAgo(log.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg shadow-sm">
          <h3 className="font-title-lg font-bold text-on-surface mb-md">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-sm">
             <button onClick={() => navigate('/admin/users')} className="flex flex-col items-center justify-center p-md bg-primary-container/20 rounded-xl hover:bg-primary-container/30 transition-colors border border-primary/10">
               <UserPlus className="w-6 h-6 text-primary mb-2" />
               <span className="text-[11px] font-bold uppercase text-primary">Create User</span>
             </button>
             <button className="flex flex-col items-center justify-center p-md bg-secondary-container/20 rounded-xl hover:bg-secondary-container/30 transition-colors border border-secondary/10">
               <Shield className="w-6 h-6 text-on-secondary-container mb-2" />
               <span className="text-[11px] font-bold uppercase text-on-secondary-container text-center">Enroll Student</span>
             </button>
          </div>
        </div>

      </div>

    </div>
  );
}
