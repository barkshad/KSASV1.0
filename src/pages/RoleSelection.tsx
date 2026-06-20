import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen, GraduationCap, ArrowRight, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { login } from '../lib/auth';

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'admin', title: 'Admin', icon: Shield, path: '/admin', description: 'System configuration & academic management' },
    { id: 'lecturer', title: 'Lecturer', icon: BookOpen, path: '/lecturer', description: 'Manage courses & view attendance analytics' },
    { id: 'student', title: 'Student', icon: GraduationCap, path: '/student', description: 'Check-in to classes & view history' },
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password, selectedRole);
      const rolePath = roles.find(r => r.id === selectedRole)?.path || '/';
      navigate(rolePath);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Right/Bottom Section: Role Selection + Login */}
        <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-surface relative">
          <div className="max-w-[448px] mx-auto w-full space-y-6 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="font-headline-lg font-bold text-on-surface">Welcome to KSAS</h2>
              <p className="font-body-md text-on-surface-variant">Select your role and sign in to access the dashboard</p>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`w-full flex items-center p-5 rounded-2xl border transition-all group text-left ${
                    selectedRole === role.id
                      ? 'bg-primary-container/30 border-primary shadow-md'
                      : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary hover:shadow-md hover:bg-surface-container'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                    selectedRole === role.id ? 'bg-primary text-on-primary scale-110' : 'bg-primary-container text-primary group-hover:scale-110'
                  }`}>
                    <role.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-title-lg font-bold text-on-surface">{role.title}</h3>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">{role.description}</p>
                  </div>
                  <ArrowRight className={`w-5 h-5 transition-colors ${
                    selectedRole === role.id ? 'text-primary' : 'text-outline-variant group-hover:text-primary'
                  }`} />
                </button>
              ))}
            </div>

            {/* Login Form */}
            {selectedRole && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-error bg-error-container/30 px-4 py-2 rounded-lg animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-body-sm">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold font-label-md uppercase tracking-wider hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-on-surface-variant">
                  Default Admin: <span className="font-mono text-primary">admin@kabarak.ac.ke</span> / <span className="font-mono text-primary">Mwahanga@1</span>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
