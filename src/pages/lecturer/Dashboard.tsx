import React, { useMemo, useEffect, useState } from 'react';
import { Radio, StopCircle, QrCode, AlertCircle, FileBarChart, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreRealtimeCollection } from '../../hooks/useFirestoreRealtime';
import { db, collection, onSnapshot } from '../../lib/firebase';
import { collections, createSession, closeSession, logAudit } from '../../lib/db';
import { generateSessionTOTPSecret } from '../../lib/totp';
import toast from 'react-hot-toast';

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: allSessions, loading: loadingSessions } = useFirestoreRealtimeCollection(collections.SESSIONS);

  const activeSession = useMemo(() => {
    return allSessions.find(s => s.lecturerId === user?.uid && s.status === 'open');
  }, [allSessions, user]);

  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState(0);

  // Real-time attendance count using onSnapshot (NOT one-time getDocs)
  useEffect(() => {
    if (!activeSession?.id) {
      setAttendanceCount(0);
      return;
    }

    const attCollRef = collection(db, `${collections.SESSIONS}/${activeSession.id}/attendance`);
    const unsubscribe = onSnapshot(attCollRef, (snapshot) => {
      setAttendanceCount(snapshot.docs.length);
    }, (error) => {
      console.error('Attendance count listener error:', error);
    });

    return () => unsubscribe();
  }, [activeSession?.id]);

  const handleStartSession = async (courseCode: string, courseName: string, room: string) => {
    setStarting(true);
    try {
      const secret = generateSessionTOTPSecret();
      const sessionId = await createSession({
        courseCode,
        courseName,
        lecturerId: user?.uid,
        lecturerName: user?.name || 'Lecturer',
        room,
        totpSecret: secret,
        windowMinutes: 15,
        enrolledCount: 50
      });

      await logAudit(user, 'SESSION_START', 'session', `Started session ${sessionId} for ${courseCode}`);
      navigate(`/lecturer/live?sessionId=${sessionId}`);
    } catch (err: any) {
      console.error('Failed to start session', err);
      toast.error(err.message || 'Failed to start session. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    if (!confirm('End this session? Attendance data will be archived.')) return;

    setEnding(true);
    try {
      await closeSession(activeSession.id, user?.uid);
      await logAudit(user, 'SESSION_CLOSE', 'session', `Closed session ${activeSession.id}`);
      toast.success('Session ended and archived');
    } catch (err: any) {
      console.error('Failed to end session', err);
      toast.error(err.message || 'Failed to end session.');
    } finally {
      setEnding(false);
    }
  };

  if (loadingSessions) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const enrolledCount = activeSession?.enrolledCount || 50;
  const attendancePct = Math.min(100, Math.round((attendanceCount / enrolledCount) * 100));

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-gutter py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-headline-lg text-on-surface mb-1">
          Welcome back, {user?.name || 'Lecturer'}
        </h1>
        <p className="font-body-md text-on-surface-variant">
          {activeSession
            ? `Active session: ${activeSession.courseName} — ${attendanceCount} students checked in`
            : 'No active session. Start one below to begin accepting check-ins.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">

        {/* Active Session / Start Session Panel */}
        <div className="md:col-span-8 glass-card rounded-xl p-6 border-l-4 border-l-tertiary-fixed-dim relative overflow-hidden bg-white/80 min-h-[320px]">
          {activeSession ? (
            <>
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Radio className="w-32 h-32" />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed-dim opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary-container"></span>
                    </span>
                    <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
                      Session Live
                    </span>
                  </div>

                  <h2 className="font-title-lg text-on-surface mb-1">
                    {activeSession.courseName}
                    <span className="text-on-surface-variant font-normal ml-2 text-base">
                      ({activeSession.courseCode})
                    </span>
                  </h2>
                  <p className="font-body-md text-on-surface-variant mb-6">
                    Room: {activeSession.room} · Started {activeSession.startTime}
                  </p>

                  {/* Attendance stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-tertiary-fixed-dim/10 rounded-xl p-4 text-center">
                      <p className="font-display-lg text-primary leading-none">{attendanceCount}</p>
                      <p className="font-label-md text-on-surface-variant mt-1">Present</p>
                    </div>
                    <div className="bg-error/5 rounded-xl p-4 text-center">
                      <p className="font-display-lg text-error leading-none">
                        {Math.max(0, enrolledCount - attendanceCount)}
                      </p>
                      <p className="font-label-md text-on-surface-variant mt-1">Absent</p>
                    </div>
                    <div className="bg-surface-container rounded-xl p-4 text-center">
                      <p className="font-display-lg text-on-surface leading-none">{attendancePct}%</p>
                      <p className="font-label-md text-on-surface-variant mt-1">Rate</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>Check-in progress</span>
                      <span>{attendanceCount} / {enrolledCount}</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-tertiary-container h-full rounded-full transition-all duration-500"
                        style={{ width: `${attendancePct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleEndSession}
                    disabled={ending}
                    className="bg-error text-on-error px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-60"
                  >
                    {ending ? <Loader2 className="w-5 h-5 animate-spin" /> : <StopCircle className="w-5 h-5" />}
                    {ending ? 'Ending...' : 'End Session'}
                  </button>
                  <button
                    onClick={() => navigate(`/lecturer/live?sessionId=${activeSession.id}`)}
                    className="bg-surface-variant text-on-surface-variant px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-surface-container-high transition-colors active:scale-95"
                  >
                    <QrCode className="w-5 h-5" />
                    Show QR & Attendance
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-title-lg text-on-surface mb-4">Start New Session</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  handleStartSession(
                    fd.get('code') as string,
                    fd.get('name') as string,
                    fd.get('room') as string
                  );
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-on-surface-variant">
                      Course Code
                    </label>
                    <input
                      name="code"
                      required
                      placeholder="e.g. COMP 201"
                      className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-on-surface-variant">
                      Room / Venue
                    </label>
                    <input
                      name="room"
                      required
                      placeholder="e.g. Room 104"
                      className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-on-surface-variant">
                    Course Name
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Data Structures & Algorithms"
                    className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={starting}
                  className="w-full bg-primary text-on-primary px-4 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Starting...
                    </>
                  ) : (
                    'Start Session & Show QR'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-4 glass-card rounded-xl p-6 flex flex-col bg-white/80">
          <h3 className="font-title-lg text-on-surface mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
              <div className="w-11 h-11 rounded-full bg-primary-container/20 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="font-label-md text-on-surface text-xs">Notify Absentees</span>
            </button>
            <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
              <div className="w-11 h-11 rounded-full bg-secondary-container/20 text-on-secondary-container flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FileBarChart className="w-5 h-5" />
              </div>
              <span className="font-label-md text-on-surface text-xs">Generate Report</span>
            </button>
            <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
              <div className="w-11 h-11 rounded-full bg-tertiary-container/20 text-tertiary-container flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-label-md text-on-surface text-xs">Schedule</span>
            </button>
            <button
              onClick={() => navigate('/lecturer/risk')}
              className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group"
            >
              <div className="w-11 h-11 rounded-full bg-error-container/20 text-on-error-container flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="font-label-md text-on-surface text-xs">Risk Monitor</span>
            </button>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="md:col-span-12 glass-card rounded-xl p-6 flex flex-col bg-white/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-title-lg text-on-surface">Weekly Attendance Trend</h3>
            <span className="px-3 py-1 bg-tertiary-container/10 text-tertiary-container rounded-full font-label-md text-xs">
              Avg: 88%
            </span>
          </div>
          <div className="flex items-end space-x-2 min-h-[120px] relative pt-4">
            {[
              { day: 'Mon', pct: 75 },
              { day: 'Tue', pct: 82 },
              { day: 'Wed', pct: 90 },
              { day: 'Thu', pct: 65 },
              { day: 'Fri', pct: 85 },
            ].map(({ day, pct }) => (
              <div key={day} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full max-w-[48px] bg-primary-container hover:bg-primary rounded-t-md transition-colors cursor-pointer"
                  style={{ height: `${pct}%`, minHeight: 8 }}
                  title={`${day}: ${pct}%`}
                ></div>
                <span className="font-label-md text-on-surface-variant mt-2 text-xs">{day}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
