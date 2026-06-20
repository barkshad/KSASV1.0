import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen, GraduationCap, ArrowRight, ArrowLeft, Lock, Mail, Loader2, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db, collection, query, where, getDocs } from '../lib/firebase';
import { hashPassword } from '../lib/auth';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { id: 'admin', title: 'Admin', icon: Shield, path: '/admin', description: 'System configuration & academic management' },
    { id: 'lecturer', title: 'Lecturer', icon: BookOpen, path: '/lecturer', description: 'Manage courses & view attendance analytics' },
    { id: 'student', title: 'Student', icon: GraduationCap, path: '/student', description: 'Check-in to classes & view history' },
  ];

  useEffect(() => {
    const cachedUser = localStorage.getItem('ksas_current_user');
    if (cachedUser) {
        try {
            const userObj = JSON.parse(cachedUser);
            if (userObj.role === 'admin') navigate('/admin');
            else if (userObj.role === 'lecturer') navigate('/lecturer');
            else if (userObj.role === 'student') navigate('/student');
        } catch(e){}
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setLoading(true);
    setError('');
    
    try {
      const usersRef = collection(db, 'users');
      // Look for the user with this email and role
      const q = query(usersRef, where('email', '==', email), where('role', '==', selectedRole));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Invalid credentials or role');
      }
      
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      if (userData.password !== hashPassword(password)) {
        throw new Error('Invalid credentials');
      }
      
      // Success
      login({ uid: userDoc.id, ...userData });
      const roleObj = roles.find(r => r.id === selectedRole);
      navigate(roleObj!.path);
      
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

        {/* Right/Bottom Section: Role Selection & Login */}
        <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-surface relative">
          <div className="max-w-[448px] mx-auto w-full space-y-8 relative z-10">
            
            {!selectedRole ? (
              <>
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="font-headline-lg font-bold text-on-surface">Welcome to KSAS</h2>
                  <p className="font-body-md text-on-surface-variant">Select your role to access the dashboard</p>
                </div>

                <div className="grid gap-4 mt-8 animate-in fade-in duration-500">
                  {roles.map((role, idx) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className="group flex flex-col sm:flex-row items-center sm:items-start p-5 sm:p-6 rounded-[24px] bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/40 hover:bg-surface-container-low transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface shadow-sm hover:shadow-md"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mb-4 sm:mb-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                        <role.icon className="w-8 h-8" />
                      </div>
                      
                      <div className="sm:ml-6 flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{role.title}</h3>
                        <p className="font-body-sm text-on-surface-variant mt-1.5 leading-relaxed">{role.description}</p>
                      </div>

                      <div className="hidden sm:flex mt-4 sm:mt-0 items-center justify-center w-10 h-10 rounded-full bg-surface-container text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
               <div className="animate-in slide-in-from-right-8 duration-300 space-y-6">
                  <button 
                    onClick={() => {
                      setSelectedRole(null);
                      setError('');
                      setPassword('');
                    }}
                    className="flex items-center text-primary font-bold text-sm mb-6 hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roles
                  </button>
                  
                  <div className="space-y-2">
                    <h2 className="font-headline-md font-bold text-on-surface capitalize">{selectedRole} Login</h2>
                    <p className="font-body-md text-on-surface-variant">Enter your credentials to continue</p>
                  </div>

                  {error && (
                    <div className="bg-error/10 text-error p-4 rounded-xl flex items-start gap-3">
                       <Info className="w-5 h-5 shrink-0 mt-0.5" />
                       <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-on-surface">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 text-on-surface-variant/50" />
                        </div>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant/50 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                          placeholder="your.email@kabarak.ac.ke"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-on-surface">Password <span className="text-xs text-on-surface-variant font-normal tracking-wide ml-1">(Default is 123456)</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-on-surface-variant/50" />
                        </div>
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant/50 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-70 mt-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Secure Login'}
                    </button>
                  </form>
               </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
