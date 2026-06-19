import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

export default function SignIn() {
  const navigate = useNavigate();

  const roles = [
    { id: 'admin', title: 'Admin', icon: Shield, path: '/admin', description: 'System configuration & academic management' },
    { id: 'lecturer', title: 'Lecturer', icon: BookOpen, path: '/lecturer', description: 'Manage courses & view attendance analytics' },
    { id: 'student', title: 'Student', icon: GraduationCap, path: '/student', description: 'Check-in to classes & view history' },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto min-h-[min(100vh,800px)] flex flex-col md:flex-row bg-surface rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30">
        
        {/* Left/Top Section: Branding */}
        <div className="md:w-5/12 bg-primary-container text-on-primary-container p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#7c0a1f 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-[384px]">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white shadow-xl flex items-center justify-center p-6 border-4 border-surface-container overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida/AP1WRLu2mQve9UxRQsu0A1RfcBO5LGyq7zz6UXNQRNchp0aCKPz2ZDZFrIqz9WBmoZPRT9IilfmfPwkT40GZnjgD1N7oQ3dLCt3lFGbCkTF2TMjvSL1JiX1HEVCD-QEfFfmLUaFX-AEHkWbavE42ktf3TV1dwwdRJg2EdjTWgWPPrhrEK_e4Bbog9er7FSUOT9HQf0wlbWh2O0y1-s-_lEcIKERN9LG9-1Jp7iPQlH4N8wsNKfC5XKgp4SJqO0R6" alt="KSAS Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display-lg font-bold tracking-tight">KSAS</h1>
              <p className="font-label-md tracking-widest uppercase opacity-80">Kabarak Smart Attendance</p>
            </div>
            
            <div className="space-y-6 pt-8 w-full text-left hidden md:block">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Secure Verification</h3>
                  <p className="text-sm opacity-80">Device-bound authentication prevents proxy attendance.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Live Synchronisation</h3>
                  <p className="text-sm opacity-80">Real-time attendance tracking for every active session.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right/Bottom Section: Role Selection */}
        <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-surface relative">
          <div className="max-w-[448px] mx-auto w-full space-y-8 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="font-headline-lg font-bold text-on-surface">Welcome to KSAS</h2>
              <p className="font-body-md text-on-surface-variant">Select your role to access the dashboard</p>
            </div>

            <div className="space-y-4 mt-8 animate-in fade-in duration-500">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => navigate(role.path)}
                  className="w-full flex items-center p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary hover:shadow-md hover:bg-surface-container transition-all group text-left"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary-container text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <role.icon className="w-7 h-7" />
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="font-title-lg font-bold text-on-surface">{role.title}</h3>
                    <p className="font-body-sm text-on-surface-variant mt-1">{role.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-outline-variant group-hover:text-primary transition-colors group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
