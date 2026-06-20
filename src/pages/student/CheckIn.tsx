import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, User, Clock, QrCode, CheckCircle, AlertCircle, XCircle, Keyboard } from 'lucide-react';
import { getCurrentUser } from '../../lib/auth';
import { 
  getSession, 
  recordAttendance, 
  hasStudentCheckedIn, 
  hasDeviceCheckedIn,
  getEnrollment,
  getActiveSessions 
} from '../../lib/db';
import { validateTOTP } from '../../lib/totp';

export default function CheckIn() {
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'already' | 'invalid' | 'not-enrolled' | 'expired' | null>(null);
  const [scanMessage, setScanMessage] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  // Find active session for this student
  useEffect(() => {
    async function findSession() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const sessions = await getActiveSessions();
        // Find first session where student is enrolled
        for (const session of sessions) {
          const enrollment = await getEnrollment(session.courseId, user.uid);
          if (enrollment) {
            setActiveSession(session);
            break;
          }
        }
      } catch (e) {
        console.error('Failed to find session:', e);
      } finally {
        setLoading(false);
      }
    }
    findSession();
  }, [user?.uid]);

  const processCheckIn = async (sessionId: string, token: string) => {
    if (!user?.uid) {
      setScanResult('invalid');
      setScanMessage('Please log in first');
      return;
    }

    try {
      const session = await getSession(sessionId);
      if (!session) {
        setScanResult('invalid');
        setScanMessage('Session not found');
        return;
      }

      if (session.status !== 'open') {
        setScanResult('expired');
        setScanMessage('This session has ended');
        return;
      }

      // Validate TOTP token
      if (!validateTOTP(session.totpSecret, token)) {
        setScanResult('expired');
        setScanMessage('QR code expired. Please scan again.');
        return;
      }

      // Check enrollment
      const enrollment = await getEnrollment(session.courseId, user.uid);
      if (!enrollment) {
        setScanResult('not-enrolled');
        setScanMessage('You are not enrolled in this course');
        return;
      }

      // Check if already checked in
      const alreadyChecked = await hasStudentCheckedIn(sessionId, user.uid);
      if (alreadyChecked) {
        setScanResult('already');
        setScanMessage('You are already marked present for this session');
        return;
      }

      // Check device fingerprint (prevent proxy attendance)
      const deviceFingerprint = navigator.userAgent + navigator.platform + navigator.language;
      const deviceUsed = await hasDeviceCheckedIn(sessionId, deviceFingerprint);
      if (deviceUsed) {
        setScanResult('invalid');
        setScanMessage('This device has already been used for this session');
        return;
      }

      // Record attendance
      await recordAttendance(sessionId, {
        studentId: user.uid,
        studentName: user.name,
        studentNumber: user.studentNumber,
        deviceFingerprint,
        status: 'present',
      });

      setScanResult('success');
      setScanMessage(`Checked in to ${session.courseName} at ${new Date().toLocaleTimeString()}`);

      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/student');
      }, 3000);

    } catch (e: any) {
      setScanResult('invalid');
      setScanMessage('Check-in failed: ' + e.message);
    }
  };

  const handleScan = async () => {
    // In a real app, this would use a camera QR scanner
    // For now, simulate by parsing a mock QR data or using manual entry
    if (activeSession) {
      // Simulate scan with current token (in real app, this comes from camera)
      // For demo, we'll just use the session ID
      await processCheckIn(activeSession.id, '000000'); // Token would be read from QR
    } else {
      setScanResult('invalid');
      setScanMessage('No active session found for your enrolled courses');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    // Parse manual code: format "SESSIONID:TOKEN"
    const parts = manualCode.trim().split(':');
    if (parts.length === 2) {
      await processCheckIn(parts[0], parts[1]);
    } else {
      // Try to find session by course code
      setScanResult('invalid');
      setScanMessage('Invalid code format. Use "SESSIONID:TOKEN"');
    }
  };

  const getResultIcon = () => {
    switch (scanResult) {
      case 'success': return <CheckCircle className="w-12 h-12 text-tertiary-container" />;
      case 'already': return <CheckCircle className="w-12 h-12 text-secondary" />;
      case 'invalid': return <XCircle className="w-12 h-12 text-error" />;
      case 'not-enrolled': return <AlertCircle className="w-12 h-12 text-error" />;
      case 'expired': return <AlertCircle className="w-12 h-12 text-error" />;
      default: return null;
    }
  };

  const getResultColor = () => {
    switch (scanResult) {
      case 'success': return 'text-tertiary-container';
      case 'already': return 'text-secondary';
      case 'invalid': case 'not-enrolled': case 'expired': return 'text-error';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center p-md md:p-gutter max-w-7xl mx-auto w-full min-h-[80vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-[448px] bg-surface-container-lowest rounded-xl shadow-lg border border-surface-variant p-6 flex flex-col items-center relative overflow-hidden">

        <div className="text-center mb-6">
          <h2 className="font-title-lg text-primary mb-2">Check-in</h2>
          <p className="font-body-sm text-on-surface-variant">Scan the classroom QR code to record your attendance.</p>
        </div>

        {/* QR Scanner Area */}
        {!showManual && (
          <div 
            onClick={handleScan} 
            className="w-full aspect-square max-w-[280px] bg-surface-container rounded-lg border-2 border-dashed border-outline relative flex items-center justify-center mb-8 cursor-pointer overflow-hidden group"
          >
            <div className="absolute inset-0 bg-surface-variant/30 flex items-center justify-center backdrop-blur-sm z-10 transition-opacity group-hover:opacity-75">
              <QrCode className="w-16 h-16 text-outline" />
            </div>

            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl z-20"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr z-20"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl z-20"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br z-20"></div>

            <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_10px_rgba(0,30,64,0.5)] z-30 animate-[scan_2s_linear_infinite]"></div>
          </div>
        )}

        {/* Manual Entry */}
        {showManual && (
          <form onSubmit={handleManualSubmit} className="w-full max-w-[280px] mb-8 space-y-4">
            <div className="text-center">
              <Keyboard className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="font-body-sm text-on-surface-variant">Enter session code manually</p>
            </div>
            <input
              type="text"
              placeholder="SESSIONID:TOKEN"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none font-mono text-center"
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary-container transition-colors"
            >
              Submit Code
            </button>
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="w-full py-2 text-on-surface-variant hover:text-primary transition-colors font-body-sm"
            >
              Back to QR Scanner
            </button>
          </form>
        )}

        {/* Session Info */}
        <div className="w-full bg-surface-container-low rounded-lg p-4 space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <School className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-label-md text-on-surface-variant uppercase tracking-wider">Current Session</p>
              <p className="font-body-md font-semibold text-on-background">
                {activeSession?.courseName || 'No active session'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <p className="font-body-sm text-on-surface-variant">{activeSession?.lecturerName || 'Dr. Alan Turing'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <p className="font-body-sm text-on-surface-variant">
              {activeSession?.startTime || '09:00 AM'} - {activeSession?.endTime || '11:00 AM'}
            </p>
          </div>
        </div>

        {!showManual && (
          <button 
            onClick={() => setShowManual(true)}
            className="font-label-md text-primary hover:text-primary-container transition-colors"
          >
            Having trouble? Enter code manually
          </button>
        )}

        {/* Scan Result Overlay */}
        {scanResult && (
          <div className="absolute inset-0 bg-surface-container-lowest/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center z-50 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-surface-variant">
              {getResultIcon()}
            </div>
            <h3 className={`font-title-lg mb-2 ${getResultColor()}`}>
              {scanResult === 'success' ? 'Attendance Verified' : 
               scanResult === 'already' ? 'Already Checked In' :
               scanResult === 'expired' ? 'QR Code Expired' :
               scanResult === 'not-enrolled' ? 'Not Enrolled' : 'Check-in Failed'}
            </h3>
            <p className="font-body-sm text-on-surface-variant mb-6">{scanMessage}</p>
            {scanResult !== 'success' && (
              <button 
                onClick={() => { setScanResult(null); setScanMessage(''); }}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary-container transition-colors"
              >
                Try Again
              </button>
            )}
            {scanResult === 'success' && (
              <p className="font-body-sm text-on-surface-variant">Redirecting to dashboard...</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
