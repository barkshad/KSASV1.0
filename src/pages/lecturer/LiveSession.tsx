import React, { useState, useEffect } from 'react';
import { Download, Users, CheckCircle, Loader2, Clock, AlertCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { db, doc, collection, onSnapshot, updateDoc } from '../../lib/firebase';
import { collections, archiveSession } from '../../lib/db';
import { getCurrentTOTP } from '../../lib/totp';

export default function LiveSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');

  const [sessionData, setSessionData] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totpToken, setTotpToken] = useState('');
  const [ending, setEnding] = useState(false);

  // Session + attendance real-time listeners
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubSession = onSnapshot(
      doc(db, collections.SESSIONS, sessionId),
      (docSnap) => {
        if (docSnap.exists()) {
          setSessionData({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Session listener error:', error);
        setLoading(false);
      }
    );

    // Real-time attendance listener
    const unsubAttendance = onSnapshot(
      collection(db, `${collections.SESSIONS}/${sessionId}/attendance`),
      (snapshot) => {
        const attList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by timestamp descending (most recent first)
        attList.sort((a: any, b: any) => {
          const aMs = a.timestamp?.toMillis?.() ?? 0;
          const bMs = b.timestamp?.toMillis?.() ?? 0;
          return bMs - aMs;
        });
        setAttendance(attList);
      },
      (error) => {
        console.error('Attendance listener error:', error);
      }
    );

    return () => {
      unsubSession();
      unsubAttendance();
    };
  }, [sessionId]);

  // TOTP rotation timer
  useEffect(() => {
    if (!sessionData?.totpSecret) return;

    const updateToken = () => {
      const newToken = getCurrentTOTP(sessionData.totpSecret);
      setTotpToken(newToken);
      const epoch = Math.round(Date.now() / 1000);
      setTimeLeft(30 - (epoch % 30));
    };

    updateToken();
    const interval = setInterval(updateToken, 1000);
    return () => clearInterval(interval);
  }, [sessionData?.totpSecret]);

  const handleEndSession = async () => {
    if (!sessionId || ending) return;
    if (!confirm('End this session? Attendance data will be archived.')) return;

    setEnding(true);
    try {
      await updateDoc(doc(db, collections.SESSIONS, sessionId), { status: 'closed' });
      await archiveSession(sessionId);
      navigate('/lecturer');
    } catch (err) {
      console.error('Failed to end session:', err);
      alert('Failed to end session. Please try again.');
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="max-w-7xl mx-auto p-xl text-center">
        <h2 className="text-xl font-bold text-on-surface mb-2">Session not found</h2>
        <p className="text-on-surface-variant mb-6">This session may have ended or doesn't exist.</p>
        <button
          onClick={() => navigate('/lecturer')}
          className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const qrData = `ksas://attend?sessionId=${sessionId}&token=${totpToken}`;
  const totalEnrolled = sessionData.enrolledCount || 50;
  const totalPresent = attendance.length;
  const totalAbsent = Math.max(0, totalEnrolled - totalPresent);
  const lateCount = attendance.filter((a: any) => a.status === 'late').length;
  const isOpen = sessionData.status === 'open';

  return (
    <div className="max-w-7xl mx-auto p-md md:p-xl space-y-lg animate-in fade-in duration-500">

      {/* Session Header */}
      <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-outline'}`}></div>
              <span className={`font-label-md uppercase tracking-wider ${isOpen ? 'text-green-600' : 'text-on-surface-variant'}`}>
                {isOpen ? 'Session Live' : 'Session Closed'}
              </span>
            </div>
            <h2 className="font-headline-lg text-primary">{sessionData.courseName}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-on-surface-variant font-body-sm">
              <span>Code: {sessionData.courseCode}</span>
              <span>Room: {sessionData.room}</span>
              <span>{sessionData.startTime} – {sessionData.endTime}</span>
            </div>
          </div>
          <button
            onClick={handleEndSession}
            disabled={!isOpen || ending}
            className="bg-error text-on-error py-3 px-6 rounded-lg font-bold shadow hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {ending ? 'Ending...' : 'End Session'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">

        {/* Left: Stats + Attendance List */}
        <div className="lg:col-span-8 space-y-lg">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-green-400">
              <p className="font-label-md text-on-surface-variant mb-1">Present</p>
              <p className="font-headline-lg text-green-600">{totalPresent}</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-error">
              <p className="font-label-md text-on-surface-variant mb-1">Absent</p>
              <p className="font-headline-lg text-error">{totalAbsent}</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-secondary-fixed-dim">
              <p className="font-label-md text-on-surface-variant mb-1">Late</p>
              <p className="font-headline-lg text-secondary">{lateCount}</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-primary-container">
              <p className="font-label-md text-on-surface-variant mb-1">Enrolled</p>
              <p className="font-headline-lg text-primary">{totalEnrolled}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-on-surface">Check-in Progress</span>
              <span className="text-on-surface-variant">{totalPresent}/{totalEnrolled} ({Math.round((totalPresent/totalEnrolled)*100)}%)</span>
            </div>
            <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
              <div
                className="bg-tertiary-container h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalPresent/totalEnrolled)*100)}%` }}
              ></div>
            </div>
          </div>

          {/* Attendance Feed */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-title-lg text-primary flex items-center gap-2">
                <Users className="w-5 h-5" />
                Check-ins ({totalPresent})
              </h3>
              {totalPresent === 0 && isOpen && (
                <span className="text-sm text-on-surface-variant flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Waiting...
                </span>
              )}
            </div>

            <div className="divide-y divide-outline-variant/20 max-h-[400px] overflow-y-auto">
              {attendance.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No check-ins yet.</p>
                  <p className="text-sm mt-1">Students should scan the QR code to register attendance.</p>
                </div>
              ) : (
                attendance.map((att: any, index) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface-container-low transition-colors animate-in slide-in-from-left-4 fade-in duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center font-bold text-on-surface-variant shrink-0">
                        {att.studentName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-body-md font-bold text-on-surface">{att.studentName}</p>
                        <p className="font-body-sm text-on-surface-variant">{att.studentId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-label-md px-3 py-1 rounded-full text-xs capitalize ${
                        att.status === 'late'
                          ? 'bg-secondary-container/30 text-on-secondary-container'
                          : 'bg-tertiary-container/20 text-on-tertiary-container'
                      }`}>
                        {att.status || 'present'}
                      </span>
                      <span className="text-xs text-on-surface-variant whitespace-nowrap">
                        {att.timestamp?.toDate
                          ? att.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: QR Code */}
        <div className="lg:col-span-4">
          <div className="bg-primary-container p-lg rounded-2xl shadow-xl sticky top-20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-on-primary-container font-title-lg">QR Code</h3>
              <div className="bg-secondary-container px-3 py-1 rounded-full flex items-center gap-1.5">
                <div className="w-3 h-3 border-2 border-on-secondary-container border-t-transparent rounded-full animate-spin"></div>
                <span className="text-on-secondary-container font-label-md text-sm w-6 text-center">{timeLeft}s</span>
              </div>
            </div>

            <div className={`relative bg-white p-4 rounded-xl aspect-square flex items-center justify-center overflow-hidden border-4 border-on-primary-container/20 transition-opacity ${!isOpen ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
              {totpToken ? (
                <QRCodeSVG
                  value={qrData}
                  size={256}
                  className="w-full h-full"
                  includeMargin={true}
                />
              ) : (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              )}
            </div>

            {!isOpen && (
              <div className="mt-3 p-3 bg-error/10 rounded-lg text-center">
                <p className="text-sm font-bold text-error">Session Closed</p>
                <p className="text-xs text-on-surface-variant mt-1">QR code is no longer active</p>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <p className="font-body-sm text-on-primary-container/80 flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4" />
                Token rotates every 30 seconds
              </p>
              {isOpen && (
                <button
                  onClick={() => navigator.clipboard?.writeText(qrData).then(() => alert('QR link copied!'))}
                  className="w-full py-2 bg-on-primary-container text-primary font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  Copy QR Link
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
