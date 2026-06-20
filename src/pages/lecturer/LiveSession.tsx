import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  GraduationCap,
  QrCode,
  StopCircle,
  Play,
  RotateCcw,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreRealtimeDocument } from '../../hooks/useFirestoreRealtime';
import { db, doc, onSnapshot, collection, query, where, getDocs, updateDoc, serverTimestamp } from '../../lib/firebase';
import { getCurrentTOTP } from '../../lib/totp';
import { logAudit, closeSession } from '../../lib/db';
import toast from 'react-hot-toast';

interface SessionData {
  id: string;
  courseId: string;
  courseName?: string;
  lecturerId: string;
  startTime: string;
  endTime: string;
  windowMinutes: number;
  status: 'open' | 'closed' | 'archived';
  totpSecret: string;
  room?: string;
  createdAt?: any;
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  studentEmail?: string;
  timestamp: any;
  deviceFingerprint: string;
  status: 'present' | 'late' | 'absent';
}

const QR_REFRESH_INTERVAL = 5; // seconds

export default function LiveSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<SessionData | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [totpToken, setTotpToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(QR_REFRESH_INTERVAL);
  const [isOpen, setIsOpen] = useState(false);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch session data
  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = onSnapshot(
      doc(db, 'sessions', sessionId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SessionData;
          setSession({ id: docSnap.id, ...data });
          setIsOpen(data.status === 'open');
          setConnectionStatus('connected');
        } else {
          toast.error('Session not found');
          navigate('/lecturer/dashboard');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Session listener error:', error);
        setConnectionStatus('disconnected');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [sessionId, navigate]);

  // Fetch enrolled students count
  useEffect(() => {
    if (!session?.courseId) return;
    const fetchEnrolled = async () => {
      const q = query(collection(db, 'enrollments'), where('courseId', '==', session.courseId));
      const snapshot = await getDocs(q);
      setTotalEnrolled(snapshot.size);
    };
    fetchEnrolled();
  }, [session?.courseId]);

  // Real-time attendance listener
  useEffect(() => {
    if (!sessionId) return;
    const q = collection(db, `sessions/${sessionId}/attendance`);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
      // Sort by timestamp descending
      records.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || 0;
        const bTime = b.timestamp?.toDate?.() || 0;
        return bTime - aTime;
      });
      setAttendance(records);
    });
    return () => unsubscribe();
  }, [sessionId]);

  // Generate QR token every 5 seconds
  const generateToken = useCallback(() => {
    if (!session?.totpSecret) return;
    const token = getCurrentTOTP(session.totpSecret);
    setTotpToken(token);
    setTimeLeft(QR_REFRESH_INTERVAL);
  }, [session?.totpSecret]);

  // Start QR refresh interval
  useEffect(() => {
    if (!isOpen || !session?.totpSecret) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    generateToken(); // Initial generation

    intervalRef.current = setInterval(() => {
      generateToken();
    }, QR_REFRESH_INTERVAL * 1000);

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return QR_REFRESH_INTERVAL;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isOpen, session?.totpSecret, generateToken]);

  const handleCloseSession = async () => {
    if (!sessionId || !user) return;
    try {
      await closeSession(sessionId, user.uid);
      await logAudit(user, 'SESSION_CLOSE', 'session', `Closed session ${sessionId}`);
      toast.success('Session closed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to close session');
    }
  };

  const handleReopenSession = async () => {
    if (!sessionId || !user) return;
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, { status: 'open', reopenedAt: serverTimestamp() });
      await logAudit(user, 'SESSION_REOPEN', 'session', `Reopened session ${sessionId}`);
      toast.success('Session reopened');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reopen session');
    }
  };

  const totalPresent = attendance.filter((a) => a.status === 'present').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const totalAbsent = Math.max(0, totalEnrolled - attendance.length);

  const progressPercent = totalEnrolled > 0
    ? Math.round((attendance.length / totalEnrolled) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <WifiOff className="w-16 h-16 text-error mb-4" />
        <h2 className="text-xl font-semibold text-on-surface">Session Unavailable</h2>
        <p className="text-on-surface-variant mt-2">The session may have been deleted or you don't have access.</p>
      </div>
    );
  }

  const qrData = JSON.stringify({
    sessionId: session.id,
    token: totpToken,
    courseId: session.courseId,
    timestamp: Date.now()
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{session.courseName || 'Live Session'}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {session.startTime} — {session.endTime} • Room {session.room || 'TBA'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            connectionStatus === 'connected'
              ? 'bg-success-container text-on-success-container'
              : 'bg-error-container text-on-error-container'
          }`}>
            {connectionStatus === 'connected' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {connectionStatus === 'connected' ? 'Live' : 'Offline'}
          </div>
          {isOpen ? (
            <button
              onClick={handleCloseSession}
              className="flex items-center gap-2 px-4 py-2 bg-error text-on-error rounded-xl font-medium hover:bg-error/90 transition-colors"
            >
              <StopCircle className="w-4 h-4" />
              End Session
            </button>
          ) : (
            <button
              onClick={handleReopenSession}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reopen
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stats + Attendance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<UserCheck className="w-5 h-5" />}
              label="Present"
              value={totalPresent}
              color="success"
            />
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              label="Late"
              value={lateCount}
              color="warning"
            />
            <StatCard
              icon={<UserX className="w-5 h-5" />}
              label="Absent"
              value={totalAbsent}
              color="error"
            />
            <StatCard
              icon={<GraduationCap className="w-5 h-5" />}
              label="Enrolled"
              value={totalEnrolled}
              color="primary"
            />
          </div>

          {/* Progress */}
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-on-surface">Check-in Progress</span>
              <span className="text-sm font-bold text-primary">
                {attendance.length}/{totalEnrolled} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Attendance Feed */}
          <div className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="font-semibold text-on-surface flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Check-ins ({attendance.length})
              </h3>
              <span className="text-xs text-on-surface-variant">
                {isOpen ? 'Accepting new check-ins' : 'Session closed'}
              </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {attendance.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <QrCode className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                  <p className="text-on-surface-variant font-medium">No check-ins yet</p>
                  <p className="text-sm text-on-surface-variant/60 mt-1">
                    Students should scan the QR code to register attendance
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/20">
                  <AnimatePresence>
                    {attendance.map((att, index) => (
                      <motion.div
                        key={att.studentId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className="px-6 py-3 flex items-center gap-4 hover:bg-surface-container-high/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
                          {att.studentName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-on-surface truncate">{att.studentName}</p>
                          <p className="text-xs text-on-surface-variant truncate">{att.studentId}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          att.status === 'present'
                            ? 'bg-success-container text-on-success-container'
                            : att.status === 'late'
                            ? 'bg-warning-container text-on-warning-container'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          {att.status || 'present'}
                        </span>
                        <span className="text-xs text-on-surface-variant tabular-nums">
                          {att.timestamp?.toDate
                            ? att.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: QR Code */}
        <div className="space-y-6">
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                QR Code
              </h3>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-success animate-pulse' : 'bg-error'}`} />
                <span className="text-xs text-on-surface-variant">
                  {isOpen ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-on-surface-variant">Refreshes in</span>
                <span className="font-mono font-bold text-primary">{timeLeft}s</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / QR_REFRESH_INTERVAL) * 100}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
            </div>

            {/* QR Display */}
            <div className="relative bg-white rounded-xl p-4 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {totpToken && isOpen ? (
                  <motion.div
                    key={totpToken}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <QRCodeSVG
                      value={qrData}
                      size={240}
                      level="H"
                      includeMargin={false}
                      className="rounded-lg"
                    />
                  </motion.div>
                ) : (
                  <div className="w-[240px] h-[240px] flex flex-col items-center justify-center text-on-surface-variant">
                    <Shield className="w-12 h-12 mb-2 opacity-30" />
                    <p className="text-sm">Session Closed</p>
                    <p className="text-xs opacity-60">QR code is no longer active</p>
                  </div>
                )}
              </AnimatePresence>

              {/* Refresh indicator overlay */}
              {isOpen && (
                <div className="absolute top-2 right-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent"
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-center text-on-surface-variant mt-4">
              Token refreshes every {QR_REFRESH_INTERVAL} seconds for security
            </p>

            {!isOpen && (
              <div className="mt-4 p-3 bg-error-container/50 rounded-xl text-center">
                <p className="text-sm text-on-error-container font-medium">Session Ended</p>
                <p className="text-xs text-on-error-container/70 mt-1">
                  No new check-ins accepted
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'primary' | 'success' | 'warning' | 'error';
}) {
  const colorClasses = {
    primary: 'bg-primary-container text-on-primary-container',
    success: 'bg-success-container text-on-success-container',
    warning: 'bg-warning-container text-on-warning-container',
    error: 'bg-error-container text-on-error-container',
  };

  return (
    <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/30">
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-on-surface">{value}</p>
      <p className="text-xs text-on-surface-variant mt-1">{label}</p>
    </div>
  );
}
