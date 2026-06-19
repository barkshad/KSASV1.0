import React, { useState } from 'react';
import { School, User, Clock, QrCode, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CheckIn() {
  const [scanned, setScanned] = useState(false);
  const navigate = useNavigate();

  const handleScan = () => {
    setScanned(true);
    // After scanning, wait 2 sec then back to dashboard or show success.
    setTimeout(() => {
        navigate('/student');
    }, 2000);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-md md:p-gutter max-w-7xl mx-auto w-full min-h-[80vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-[448px] bg-surface-container-lowest rounded-xl shadow-lg border border-surface-variant p-6 flex flex-col items-center relative overflow-hidden">
        
        <div className="text-center mb-6">
          <h2 className="font-title-lg text-primary mb-2">Check-in</h2>
          <p className="font-body-sm text-on-surface-variant">Scan the classroom QR code to record your attendance.</p>
        </div>

        <div onClick={handleScan} className="w-full aspect-square max-w-[280px] bg-surface-container rounded-lg border-2 border-dashed border-outline relative flex items-center justify-center mb-8 cursor-pointer overflow-hidden group">
          <div className="absolute inset-0 bg-surface-variant/30 flex items-center justify-center backdrop-blur-sm z-10 transition-opacity group-hover:opacity-75">
            <QrCode className="w-16 h-16 text-outline" />
          </div>
          
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl z-20"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr z-20"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl z-20"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br z-20"></div>

          <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_10px_rgba(0,30,64,0.5)] z-30 animate-[scan_2s_linear_infinite]"></div>
        </div>

        <div className="w-full bg-surface-container-low rounded-lg p-4 space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <School className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-label-md text-on-surface-variant uppercase tracking-wider">Current Session</p>
              <p className="font-body-md font-semibold text-on-background">Software Engineering Principles</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <p className="font-body-sm text-on-surface-variant">Dr. Alan Turing</p>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <p className="font-body-sm text-on-surface-variant">09:00 AM - 11:00 AM</p>
          </div>
        </div>

        <button className="font-label-md text-primary hover:text-primary-container transition-colors">
          Having trouble? Enter code manually
        </button>

        {scanned && (
          <div className="absolute inset-0 bg-surface-container-lowest/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center z-50 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-tertiary-fixed-dim/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-tertiary-container" />
            </div>
            <h3 className="font-title-lg text-tertiary-container mb-2">Attendance Verified</h3>
            <p className="font-body-sm text-on-surface-variant mb-6">You have successfully checked in for Software Engineering Principles.</p>
          </div>
        )}

      </div>
    </div>
  );
}
