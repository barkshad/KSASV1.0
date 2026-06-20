import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RefreshCcw, Settings, Download, Pause, Play, X, CheckCircle, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  getSession, 
  createSession, 
  updateSession, 
  closeSession, 
  getEnrollmentsByCourse, 
  getAttendanceRecords,
  exportToCSV 
} from '../../lib/db';
import { getCurrentUser } from '../../lib/auth';
import { generateTOTPSecret, getTOTPToken, getQRCodeData } from '../../lib/totp';
import { useLiveAttendance, useLiveSession } from '../../hooks/useFirestoreRealtime';

export default function LiveSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [token, setToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getCurrentUser();

  const { count: liveCount, records: liveRecords } = useLiveAttendance(sessionId);
  const { session: liveSessionData } = useLiveSession(sessionId);

  // Initialize or load session
  useEffect(() => {
    async function initSession() {
      const state = location.state as any;

      if (state?.sessionId) {
        // Resume existing session
        const existing = await getSession(state.sessionId);
        if (existing && existing.status === 'open') {
          setSessionId(existing.id);
          setSession(existing);
          setEnrolledCount(state.enrolledCount || 50);
          setLoading(false);
          return;
        }
      }

      if (state?.courseId) {
        // Create new session
        try {
          const enrollments = await getEnrollmentsByCourse(state.courseId);
          const newSession = {
            courseId: state.courseId,
            courseName: state.courseName || 'Introduction to Computer Science',
            courseCode: state.courseCode || 'CSC101',
            lecturerId: user?.uid,
            lecturerName: user?.name,
            room: state.room || 'Room 402',
            date: new Date().toISOString().split('T')[0],
            startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: '',
            windowMinutes: 15,
            totpSecret: generateTOTPSecret(),
          };

          const id = await createSession(newSession);
          const created = await getSession(id);
          setSessionId(id);
          setSession(created);
          setEnrolledCount(enrollments.length || 50);
        } catch (e: any) {
          setError('Failed to create session: ' + e.message);
        }
      } else {
        setError('No course selected. Please start from course management.');
      }
      setLoading(false);
    }

    initSession();
  }, [location.state, user?.uid]);

  // TOTP token rotation
  useEffect(() => {
    if (!session?.totpSecret || isPaused) return;

    const updateToken = () => {
      const newToken = getTOTPToken(session.totpSecret);
      setToken(newToken);
      setTimeLeft(30);
    };

    updateToken();
    const interval = setInterval(updateToken, 30000);
    return () => clearInterval(interval);
  }, [session?.totpSecret, isPaused]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) return 0;
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPaused, token]);

  const handleEndSession = async () => {
    if (!sessionId) return;
    if (!confirm('Are you sure you want to end this session?')) return;
    try {
      await closeSession(sessionId);
      navigate('/lecturer');
    } catch (e: any) {
      setError('Failed to end session: ' + e.message);
    }
  };

  const handlePauseResume = async () => {
    if (!sessionId) return;
    const newStatus = isPaused ? 'open' : 'paused';
    await updateSession(sessionId, { status: newStatus });
    setIsPaused(!isPaused);
  };

  const handleExport = async () => {
    if (!sessionId) return;
    const records = await getAttendanceRecords(sessionId);
    const data = records.map((r: any) => ({
      StudentName: r.studentName,
      StudentNumber: r.studentNumber,
      Status: r.status,
      Time: r.timestamp?.toDate ? r.timestamp.toDate().toLocaleString() : new Date().toLocaleString(),
      Device: r.deviceFingerprint?.substring(0, 20) + '...',
    }));
    exportToCSV(data, `attendance_${sessionId}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const qrData = sessionId && token ? getQRCodeData(sessionId, token) : '';
  const presentCount = liveCount;
  const absentCount = Math.max(0, enrolledCount - presentCount);
  const lateCount = liveRecords.filter((r: any) => r.status === 'late').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-md md:p-xl flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-md md:p-xl space-y-lg">
        <div className="bg-error-container/30 border border-error/20 rounded-xl p-lg text-center">
          <p className="text-error font-body-lg">{error}</p>
          <button 
            onClick={() => navigate('/lecturer/courses')}
            className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-lg font-bold"
          >
            Go to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-md md:p-xl space-y-lg animate-in fade-in duration-500">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">

        {/* Main Control Center */}
        <div className="lg:col-span-8 space-y-lg">
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
              <div>
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider">Current Lecture</p>
                <h2 className="font-headline-lg text-primary mt-1">{session?.courseName || 'Introduction to Computer Science'}</h2>
                <div className="flex space-x-md mt-base text-on-surface-variant font-body-sm">
                  <span>Room {session?.room || '402'}, Science Block</span>
                  <span>{session?.startTime || '10:00 AM'} - {session?.endTime || '12:00 PM'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handlePauseResume}
                  className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded-lg font-label-md hover:bg-surface-container-high transition-colors flex items-center gap-2"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button 
                  onClick={handleEndSession}
                  className="px-4 py-2 bg-error text-on-error rounded-lg font-label-md hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  End Session
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-tertiary-fixed-dim">
              <p className="text-on-surface-variant font-label-md">Present</p>
              <p className="text-display-lg text-primary">{presentCount}</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-error">
              <p className="text-on-surface-variant font-label-md">Absent</p>
              <p className="text-display-lg text-error">{absentCount}</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-secondary-fixed-dim">
              <p className="text-on-surface-variant font-label-md">Late</p>
              <p className="text-display-lg text-secondary">{lateCount}</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-primary-container">
              <p className="text-on-surface-variant font-label-md">Total Enrollment</p>
              <p className="text-display-lg text-primary">{enrolledCount}</p>
            </div>
          </div>

          {/* Student Feed */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-title-lg text-primary flex items-center gap-2">
                <Users className="w-5 h-5" /> Recent Check-ins ({liveCount})
              </h3>
            </div>
            <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
              {liveRecords.length === 0 ? (
                <p className="text-center text-on-surface-variant py-8">No check-ins yet. Waiting for students...</p>
              ) : (
                liveRecords.slice().reverse().slice(0, 10).map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-sm">
                        {record.studentName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-body-md font-bold text-on-surface">{record.studentName || 'Unknown'}</p>
                        <p className="font-body-sm text-on-surface-variant">{record.studentNumber || 'N/A'} &bull; Verified Device</p>
                      </div>
                    </div>
                    <span className="font-label-md bg-tertiary-container/20 text-on-tertiary-container px-3 py-1 rounded-full">
                      {record.timestamp?.toDate ? record.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* QR Code Command Area */}
        <div className="lg:col-span-4 space-y-lg">
          <div className="bg-primary-container p-lg rounded-2xl shadow-xl sticky top-20">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="text-on-primary-container font-title-lg text-title-lg">Attendance QR</h3>
              <div className={`bg-secondary-container px-sm py-xs rounded-full flex items-center gap-1 ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
                 <div className={`w-3 h-3 border-2 border-on-secondary-container ${isPaused ? '' : 'border-t-transparent'} rounded-full ${isPaused ? '' : 'animate-spin'}`}></div>
                 <span className={`text-on-secondary-container font-label-md text-label-md ${timeLeft <= 5 ? 'text-error font-bold' : ''}`}>
                   {isPaused ? 'Paused' : `${timeLeft}s`}
                 </span>
              </div>
            </div>

            <div className="relative bg-white p-lg rounded-xl aspect-square flex items-center justify-center overflow-hidden border-4 border-on-primary-container/20">
              {isPaused ? (
                <div className="text-center text-on-surface-variant">
                  <Pause className="w-16 h-16 mx-auto mb-2" />
                  <p className="font-label-md">Session Paused</p>
                </div>
              ) : qrData ? (
                <QRCodeSVG value={qrData} size={240} level="H" includeMargin={true} />
              ) : (
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            <div className="mt-lg space-y-md">
              <p className="font-body-sm text-on-primary-container/80 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {isPaused ? 'Session Paused' : 'Dynamic Rotation Active'}
              </p>
              <button 
                onClick={handleExport}
                className="w-full py-md bg-on-primary-container text-primary font-bold rounded-xl hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-sm"
              >
                 <Download className="w-5 h-5" /> Export Current List
              </button>
              <button className="w-full py-md border border-on-primary-container/30 text-on-primary-container font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-sm">
                 <Settings className="w-5 h-5" /> Session Settings
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
