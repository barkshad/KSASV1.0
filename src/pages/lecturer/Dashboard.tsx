import React, { useMemo } from 'react';
import { Radio, StopCircle, QrCode, PlusCircle, AlertCircle, FileBarChart, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreRealtimeCollection } from '../../hooks/useFirestoreRealtime';
import { db, collection, addDoc, serverTimestamp, doc, updateDoc } from '../../lib/firebase';
import { collections, archiveSession } from '../../lib/db';
import { generateSessionTOTPSecret } from '../../lib/totp';

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Realtime active sessions for this lecturer
  const { data: allSessions, loading: loadingSessions } = useFirestoreRealtimeCollection(collections.SESSIONS);
  
  const activeSession = useMemo(() => {
    return allSessions.find(s => s.lecturerId === user?.uid && s.status === 'open');
  }, [allSessions, user]);

  const [starting, setStarting] = React.useState(false);

  const [attendanceCount, setAttendanceCount] = React.useState(0);

  // Quick listener for the active session's attendance
  React.useEffect(() => {
      if (!activeSession?.id) {
          setAttendanceCount(0);
          return;
      }
      // Simple fetch for dashboard count
      import('../../lib/firebase').then(({ getDocs, query }) => {
          getDocs(query(collection(db, `${collections.SESSIONS}/${activeSession.id}/attendance`))).then(snap => {
             setAttendanceCount(snap.docs.length);
          });
      });
  }, [activeSession?.id]);

  const handleStartSession = async (courseCode: string, courseName: string, room: string) => {
    setStarting(true);
    try {
        const secret = generateSessionTOTPSecret();
        const dateStr = new Date().toISOString().split('T')[0];
        const newSessionRef = await addDoc(collection(db, collections.SESSIONS), {
            courseCode,
            courseName,
            lecturerId: user?.uid,
            room,
            date: dateStr,
            startTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            windowMinutes: 15,
            status: "open",
            totpSecret: secret,
            enrolledCount: 50, // mock fallback
            createdAt: serverTimestamp()
        });

        navigate(`/lecturer/live?sessionId=${newSessionRef.id}`);
    } catch (err) {
        console.error("Failed to start session", err);
        alert("Failed to start session.");
    } finally {
        setStarting(false);
    }
  };

  const handleEndSession = async () => {
      if (!activeSession) return;
      if (confirm('End this session? Data will be archived.')) {
          await updateDoc(doc(db, collections.SESSIONS, activeSession.id), { status: 'closed' });
          await archiveSession(activeSession.id);
      }
  };

  if (loadingSessions) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-gutter py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-headline-lg text-on-surface mb-2">Welcome back, {user?.name || 'Dr. Lecturer'}</h1>
        <p className="font-body-md text-on-surface-variant">Here is an overview of your sessions and attendance today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        
        {/* Active Session Card */}
        <div className="md:col-span-8 glass-card rounded-xl p-6 border-l-4 border-l-tertiary-fixed-dim relative overflow-hidden bg-white/80 min-h-[300px]">
          {activeSession ? (
              <>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Radio className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                     <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed-dim opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary-container"></span>
                          </span>
                          <span className="font-label-md text-on-surface-variant uppercase tracking-wider">Active Session Ongoing</span>
                        </div>
                        <h2 className="font-title-lg text-on-surface mb-1">{activeSession.courseName} ({activeSession.courseCode})</h2>
                        <p className="font-body-md text-on-surface-variant mb-6">Room: {activeSession.room} • Started at {activeSession.startTime}</p>

                        <div className="flex items-end space-x-8 mb-8">
                          <div>
                             <span className="font-display-lg text-primary block leading-none">{attendanceCount}<span className="font-title-lg text-on-surface-variant">/{activeSession.enrolledCount || 50}</span></span>
                             <span className="font-label-md text-on-surface-variant mt-2 block">STUDENTS CHECKED IN</span>
                          </div>
                          <div className="h-16 flex-1 flex flex-col justify-end">
                             <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden">
                               <div className="bg-tertiary-container h-full rounded-full" style={{ width: `${Math.min(100, (attendanceCount / (activeSession.enrolledCount || 50)) * 100)}%` }}></div>
                             </div>
                          </div>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={handleEndSession}
                          className="bg-error text-on-error px-6 py-3 rounded-lg font-body-md font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2 active:scale-95"
                        >
                           <StopCircle className="w-5 h-5" />
                           <span>End Session</span>
                        </button>
                        <button 
                          onClick={() => navigate(`/lecturer/live?sessionId=${activeSession.id}`)}
                          className="bg-surface-variant text-on-surface-variant px-6 py-3 rounded-lg font-body-md font-semibold hover:bg-surface-container-high transition-colors flex items-center space-x-2 active:scale-95"
                        >
                           <QrCode className="w-5 h-5" />
                           <span>Show QR</span>
                        </button>
                     </div>
                  </div>
              </>
          ) : (
              <div className="h-full flex items-center justify-center flex-col text-on-surface-variant text-center opacity-80">
                  <div className="w-16 h-16 rounded-full bg-surface-variant/30 flex items-center justify-center mb-4">
                      <StopCircle className="w-8 h-8 text-on-surface-variant" />
                  </div>
                  <h3 className="font-title-lg font-bold mb-2">No Active Session</h3>
                  <p>Start a session from your schedule to begin accepting check-ins.</p>
              </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="md:col-span-4 glass-card rounded-xl p-6 flex flex-col bg-white/80">
           <h3 className="font-title-lg text-on-surface mb-6">Quick Actions</h3>
           <div className="grid grid-cols-2 gap-4 flex-1">
             <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
                <div className="w-12 h-12 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <PlusCircle className="w-6 h-6" />
                </div>
                <span className="font-label-md text-on-surface">Manual Session</span>
             </button>
             <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
                <div className="w-12 h-12 rounded-full bg-secondary-container/20 text-on-secondary-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <AlertCircle className="w-6 h-6" />
                </div>
                <span className="font-label-md text-on-surface">Notify Absentees</span>
             </button>
             <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
                <div className="w-12 h-12 rounded-full bg-tertiary-container/20 text-tertiary-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <FileBarChart className="w-6 h-6" />
                </div>
                <span className="font-label-md text-on-surface">Generate Report</span>
             </button>
             <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
                <div className="w-12 h-12 rounded-full bg-error-container/20 text-on-error-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <Calendar className="w-6 h-6" />
                </div>
                <span className="font-label-md text-on-surface">Manage Schedule</span>
             </button>
           </div>
        </div>

        {/* Upcoming Classes / Ad-hoc Session */}
        <div className="md:col-span-6 glass-card rounded-xl p-6 bg-white/80">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-title-lg text-on-surface">Start New Session</h3>
          </div>
          <div className="space-y-4">
             {activeSession ? (
                 <div className="p-4 rounded-lg border border-outline-variant bg-surface-variant flex items-center justify-center text-on-surface-variant font-bold">
                     An active session is currently running. End it to start a new one.
                 </div>
             ) : (
                 <form 
                   onSubmit={(e) => {
                     e.preventDefault();
                     const fd = new FormData(e.currentTarget);
                     handleStartSession(fd.get('code') as string, fd.get('name') as string, fd.get('room') as string);
                   }}
                   className="space-y-4"
                 >
                     <div>
                       <label className="block text-sm font-bold mb-1">Course Code</label>
                       <input name="code" required placeholder="e.g. COMP 201" className="w-full p-2 rounded bg-surface-container border border-outline-variant" />
                     </div>
                     <div>
                       <label className="block text-sm font-bold mb-1">Course Name</label>
                       <input name="name" required placeholder="e.g. Data Structures" className="w-full p-2 rounded bg-surface-container border border-outline-variant" />
                     </div>
                     <div>
                       <label className="block text-sm font-bold mb-1">Room / Venue</label>
                       <input name="room" required placeholder="e.g. Room 104" className="w-full p-2 rounded bg-surface-container border border-outline-variant" />
                     </div>
                     <button type="submit" disabled={starting} className="w-full bg-primary text-on-primary px-4 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center mt-4">
                         {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Session'}
                     </button>
                 </form>
             )}
          </div>
        </div>

        {/* Weekly Attendance Trend Faux Chart */}
        <div className="md:col-span-6 glass-card rounded-xl p-6 flex flex-col bg-white/80">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-title-lg text-on-surface">Weekly Attendance Trend</h3>
             <span className="px-3 py-1 bg-tertiary-container/10 text-tertiary-container rounded-full font-label-md">Avg: 88%</span>
          </div>
          <div className="flex-1 flex items-end space-x-2 mt-4 min-h-[150px] relative pt-4">
             <div className="flex-1 flex flex-col items-center justify-end h-full">
               <div className="w-full max-w-[40px] bg-primary-container hover:bg-primary rounded-t-md transition-colors" style={{ height: '75%' }}></div>
               <span className="font-label-md text-on-surface-variant mt-2">Mon</span>
             </div>
             <div className="flex-1 flex flex-col items-center justify-end h-full">
               <div className="w-full max-w-[40px] bg-primary-container hover:bg-primary rounded-t-md transition-colors" style={{ height: '82%' }}></div>
               <span className="font-label-md text-on-surface-variant mt-2">Tue</span>
             </div>
             <div className="flex-1 flex flex-col items-center justify-end h-full">
               <div className="w-full max-w-[40px] bg-primary-container hover:bg-primary rounded-t-md transition-colors" style={{ height: '90%' }}></div>
               <span className="font-label-md text-on-surface-variant mt-2">Wed</span>
             </div>
             <div className="flex-1 flex flex-col items-center justify-end h-full">
               <div className="w-full max-w-[40px] bg-primary-container hover:bg-primary rounded-t-md transition-colors" style={{ height: '65%' }}></div>
               <span className="font-label-md text-on-surface-variant mt-2">Thu</span>
             </div>
             <div className="flex-1 flex flex-col items-center justify-end h-full">
               <div className="w-full max-w-[40px] bg-primary-container hover:bg-primary rounded-t-md transition-colors" style={{ height: '85%' }}></div>
               <span className="font-label-md text-on-surface-variant mt-2">Fri</span>
             </div>
             <div className="absolute w-full border-b border-outline-variant/30 bottom-[30px] -z-10"></div>
             <div className="absolute w-full border-b border-outline-variant/30 bottom-[50%] -z-10"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
