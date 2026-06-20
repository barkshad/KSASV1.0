import React, { useState, useEffect } from 'react';
import { School, User, Clock, QrCode, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useAuth } from '../../hooks/useAuth';
import { checkInStudent } from '../../lib/db';
import { validateTOTP } from '../../lib/totp';
import { db, doc, getDoc } from '../../lib/firebase';
import { collections } from '../../lib/db';

export default function CheckIn() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Create a stable device fingerprint (simple for demo)
  const deviceFingerprint = btoa(navigator.userAgent + window.screen.width).substring(0, 16);

  const processQrData = async (qrData: string) => {
      setShowScanner(false);
      setLoading(true);
      setError(null);
      try {
          if (!qrData.startsWith('ksas://attend')) {
              throw new Error("Invalid QR code format.");
          }
          const url = new URL(qrData);
          const sessionId = url.searchParams.get('sessionId');
          const token = url.searchParams.get('token');
          
          if (!sessionId || !token) throw new Error("Missing session or token data.");

          // 1. Fetch Session to get totpSecret
          const sessionRef = doc(db, collections.SESSIONS, sessionId);
          const sessionDoc = await getDoc(sessionRef);
          if (!sessionDoc.exists()) throw new Error("Session not found.");
          const sessionData = sessionDoc.data();

          // 2. Validate TOTP
          if (!validateTOTP(sessionData.totpSecret, token)) {
              throw new Error("QR code expired, please scan again");
          }

          // 3. Write Attendance
          await checkInStudent(sessionId, user, token, deviceFingerprint);

          setScanned(true);
          setTimeout(() => {
              navigate('/student');
          }, 3000);

      } catch (err: any) {
          setError(err.message || "Failed to check in");
      } finally {
          setLoading(false);
      }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQrData(manualCode);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-md md:p-gutter max-w-7xl mx-auto w-full min-h-[80vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-[448px] bg-surface-container-lowest rounded-xl shadow-lg border border-surface-variant p-6 flex flex-col items-center relative overflow-hidden">
        
        <div className="text-center mb-6">
          <h2 className="font-title-lg text-primary mb-2">Check-in</h2>
          <p className="font-body-sm text-on-surface-variant">Scan the classroom QR code to record your attendance.</p>
        </div>

        {error && (
            <div className="w-full bg-error-container text-on-error-container p-3 rounded-md mb-4 text-sm font-medium text-center">
                {error}
            </div>
        )}

        {!manualMode ? (
            <>
                {!showScanner ? (
                    <div onClick={() => setShowScanner(true)} className="w-full aspect-square max-w-[280px] bg-surface-container rounded-lg border-2 border-dashed border-outline relative flex items-center justify-center mb-8 cursor-pointer overflow-hidden group">
                      <div className="absolute inset-0 bg-surface-variant/30 flex items-center justify-center backdrop-blur-sm z-10 transition-opacity group-hover:opacity-75">
                        <QrCode className="w-16 h-16 text-outline" />
                      </div>
                      
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl z-20"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr z-20"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl z-20"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br z-20"></div>

                      <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_10px_rgba(0,30,64,0.5)] z-30 animate-[scan_2s_linear_infinite]"></div>
                      
                      <div className="absolute bottom-2 left-0 w-full text-center z-40 text-xs font-bold text-on-surface/50 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                          Click to Start Scanner
                      </div>
                    </div>
                ) : (
                    <div className="w-full aspect-square max-w-[280px] rounded-lg overflow-hidden relative mb-8">
                       <Scanner 
                          onScan={(result) => processQrData(result[0].rawValue)}
                          formats={['qr_code']}
                       />
                       <button onClick={() => setShowScanner(false)} className="absolute top-2 right-2 bg-error text-on-error px-3 py-1 rounded-full text-xs font-bold z-10">Cancel Scanner</button>
                    </div>
                )}

                <div className="w-full bg-surface-container-low rounded-lg p-4 space-y-3 mb-6">
                  <div className="flex items-start gap-3 opacity-50">
                    <School className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider">Awaiting Scan</p>
                    </div>
                  </div>
                </div>

                <button onClick={() => setManualMode(true)} className="font-label-md text-primary hover:text-primary-container transition-colors">
                  Having trouble? Enter code manually
                </button>
            </>
        ) : (
            <form onSubmit={handleManualSubmit} className="w-full space-y-4 mb-6">
                 <div>
                     <label className="block text-sm font-bold text-on-surface mb-1">Raw QR Link / Code</label>
                     <input 
                       type="text" 
                       required
                       value={manualCode}
                       onChange={(e) => setManualCode(e.target.value)}
                       placeholder="ksas://attend?sessionId=..."
                       className="w-full bg-surface-container border border-outline-variant/50 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all text-on-surface text-sm break-all"
                     />
                 </div>
                 <div className="flex gap-2">
                     <button type="button" onClick={() => setManualMode(false)} className="flex-1 py-3 font-bold text-on-surface-variant hover:bg-surface-variant/20 rounded-xl transition-all">Cancel</button>
                     <button type="submit" disabled={loading} className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-70">
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit'}
                     </button>
                 </div>
            </form>
        )}

        {scanned && (
          <div className="absolute inset-0 bg-surface-container-lowest flex flex-col items-center justify-center p-6 text-center z-50 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-tertiary-fixed-dim/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-tertiary-container" />
            </div>
            <h3 className="font-title-lg text-tertiary-container mb-2">Attendance Verified</h3>
            <p className="font-body-sm text-on-surface-variant mb-6">You have successfully checked in.</p>
          </div>
        )}

      </div>
    </div>
  );
}
