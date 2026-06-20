import React, { useState, useEffect } from 'react';
import { Download, Settings, Users, CheckCircle, Loader2 } from 'lucide-react';
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

  // Setup Firestore Listeners
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const unsubSession = onSnapshot(doc(db, collections.SESSIONS, sessionId), (docSnap) => {
        if(docSnap.exists()) {
            setSessionData({ id: docSnap.id, ...docSnap.data() });
        }
    });

    const unsubAttendance = onSnapshot(collection(db, `${collections.SESSIONS}/${sessionId}/attendance`), (snapshot) => {
        const attList = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
        setAttendance(attList.sort((a: any, b: any) => b.timestamp?.toMillis() - a.timestamp?.toMillis()));
    });

    setLoading(false);

    return () => {
        unsubSession();
        unsubAttendance();
    }
  }, [sessionId]);

  // Handle Token Rotation timer
  useEffect(() => {
      if (!sessionData?.totpSecret) return;

      const updateToken = () => {
          const newToken = getCurrentTOTP(sessionData.totpSecret);
          setTotpToken(newToken);
          // Calculate seconds remaining until next 30s period
          const epoch = Math.round(new Date().getTime() / 1000.0);
          const remaining = 30 - (epoch % 30);
          setTimeLeft(remaining);
      };

      updateToken();
      const interval = setInterval(updateToken, 1000);
      return () => clearInterval(interval);
  }, [sessionData?.totpSecret]);

  const handleEndSession = async () => {
      if (!sessionId) return;
      if (confirm('End this session? Data will be archived.')) {
          // 1. Update status
          await updateDoc(doc(db, collections.SESSIONS, sessionId), { status: 'closed' });
          // 2. Archive
          await archiveSession(sessionId);
          navigate('/lecturer');
      }
  };

  if (loading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!sessionData) {
      return (
          <div className="max-w-7xl mx-auto p-xl text-center">
              <h2 className="text-xl font-bold">No active session found.</h2>
              <button onClick={() => navigate('/lecturer')} className="mt-4 text-primary underline">Return to Dashboard</button>
          </div>
      );
  }

  const qrData = `ksas://attend?sessionId=${sessionId}&token=${totpToken}`;
  const totalEnrolled = sessionData.enrolledCount || 50; // Mock total if not persisted on session
  const totalPresent = attendance.length;
  const totalAbsent = totalEnrolled > totalPresent ? totalEnrolled - totalPresent : 0;

  return (
    <div className="max-w-7xl mx-auto p-md md:p-xl space-y-lg animate-in fade-in duration-500">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        
        {/* Main Control Center */}
        <div className="lg:col-span-8 space-y-lg">
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
              <div>
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider">Current Lecture • <span className={`font-bold ${sessionData.status === 'open' ? 'text-green-600' : 'text-error'}`}>{sessionData.status.toUpperCase()}</span></p>
                <h2 className="font-headline-lg text-primary mt-1">{sessionData.courseName}</h2>
                <div className="flex space-x-md mt-base text-on-surface-variant font-body-sm">
                  <span>Room {sessionData.room}</span>
                  <span>{sessionData.startTime} - {sessionData.endTime}</span>
                </div>
              </div>
              <button 
                onClick={handleEndSession}
                className="bg-error text-on-error py-2 px-6 rounded-lg font-bold shadow hover:bg-error/90 transition-colors"
                disabled={sessionData.status === 'closed'}
              >
                  End Session
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-tertiary-fixed-dim">
              <p className="text-on-surface-variant font-label-md">Present</p>
              <p className="text-display-lg text-primary">{totalPresent}</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-error">
              <p className="text-on-surface-variant font-label-md">Absent</p>
              <p className="text-display-lg text-error">{totalAbsent}</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-secondary-fixed-dim">
              <p className="text-on-surface-variant font-label-md">Late</p>
              <p className="text-display-lg text-secondary">0</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-primary-container">
              <p className="text-on-surface-variant font-label-md">Total Enrollment</p>
              <p className="text-display-lg text-primary">{totalEnrolled}</p>
            </div>
          </div>

          {/* Student Feed */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-title-lg text-primary flex items-center gap-2">
                <Users className="w-5 h-5" /> Recent Check-ins
              </h3>
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {attendance.length === 0 ? (
                  <p className="text-center text-on-surface-variant py-4">No check-ins yet.</p>
              ) : (
                  attendance.map((att: any) => (
                    <div key={att.id} className="flex items-center justify-between animate-in slide-in-from-left-4 fade-in duration-300">
                        <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center font-bold text-on-surface-variant">
                            {att.studentName?.charAt(0) || '?'}
                        </div>
                        <div>
                            <p className="font-body-md font-bold text-on-surface">{att.studentName}</p>
                            <p className="font-body-sm text-on-surface-variant">{att.studentNumber || 'Verified Device'}</p>
                        </div>
                        </div>
                        <span className="font-label-md bg-tertiary-container/20 text-on-tertiary-container px-3 py-1 rounded-full text-xs">
                          {new Date(att.timestamp?.toMillis() || Date.now()).toLocaleTimeString()}
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
              <div className="bg-secondary-container px-sm py-xs rounded-full flex items-center gap-1">
                 <div className="w-3 h-3 border-2 border-on-secondary-container border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-on-secondary-container font-label-md text-label-md w-6 tracking-tighter">{timeLeft}s</span>
              </div>
            </div>
            
            <div className={`relative bg-white p-lg rounded-xl aspect-square flex items-center justify-center overflow-hidden border-4 border-on-primary-container/20 transition-opacity ${sessionData.status !== 'open' ? 'opacity-20' : 'opacity-100'}`}>
              <QRCodeSVG value={qrData} size={256} className="w-full h-full text-primary" includeMargin={true} />
            </div>

            <div className="mt-lg space-y-md">
              <p className="font-body-sm text-on-primary-container/80 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Dynamic Rotation Active
              </p>
              <button 
                  disabled={sessionData.status !== 'open'}
                  onClick={() => alert(`Manual check in raw data: ${qrData}`)}
                  className="w-full py-md bg-on-primary-container text-primary font-bold rounded-xl hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-sm disabled:opacity-50"
               >
                 Show Raw QR Code link
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
