/**
 * src/pages/RoleSelection.tsx
 * Landing page and login screen.
 * - No default password hints displayed
 * - Polished responsive layout
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, BookOpen, GraduationCap, ArrowRight, ArrowLeft,
  Lock, Mail, Loader2, AlertCircle, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db, collection, query, where, getDocs } from '../lib/firebase';
import { hashPassword } from '../lib/auth';

const roles = [
  {
    id: 'admin',
    title: 'Administrator',
    icon: Shield,
    path: '/admin',
    description: 'System configuration, user management, and institutional analytics.',
    color: 'bg-primary-container text-on-primary-container',
    iconBg: 'bg-primary',
    iconText: 'text-on-primary',
  },
  {
    id: 'lecturer',
    title: 'Lecturer',
    icon: BookOpen,
    path: '/lecturer',
    description: 'Manage course sessions, generate QR codes, and track attendance.',
    color: 'bg-secondary-container text-on-secondary-container',
    iconBg: 'bg-secondary',
    iconText: 'text-on-secondary',
  },
  {
    id: 'student',
    title: 'Student',
    icon: GraduationCap,
    path: '/student',
    description: 'Check in to classes, view attendance history, and track your progress.',
    color: 'bg-tertiary-container text-on-tertiary-container',
    iconBg: 'bg-tertiary',
    iconText: 'text-on-tertiary',
  },
] as const;

export default function RoleSelection() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const cached = localStorage.getItem('ksas_current_user');
    if (cached) {
      try {
        const u = JSON.parse(cached);
        if (u.role === 'admin') navigate('/admin');
        else if (u.role === 'lecturer') navigate('/lecturer');
        else if (u.role === 'student') navigate('/student');
      } catch { /* ignore */ }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    setError('');

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('email', '==', email.toLowerCase().trim()),
        where('role', '==', selectedRole)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('No account found with those credentials.');
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      if (userData.password !== hashPassword(password)) {
        throw new Error('Incorrect password. Please try again.');
      }

      if (userData.status === 'inactive') {
        throw new Error('This account has been deactivated. Contact your administrator.');
      }

      login({ uid: userDoc.id, ...userData });
      const roleObj = roles.find((r) => r.id === selectedRole);
      navigate(roleObj!.path);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setError('');
    setEmail('');
    setPassword('');
  };

  const activeRole = roles.find((r) => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/20 min-h-[600px]">

        {/* ── Left panel: Branding ─────────────────────────────────────── */}
        <div className="lg:w-5/12 bg-primary text-on-primary p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-on-primary/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-xl tracking-tight">KSAS</p>
                <p className="text-[10px] uppercase tracking-widest opacity-70">
                  Kabarak Smart Attendance
                </p>
              </div>
            </div>

            <h1 className="font-bold text-3xl lg:text-4xl leading-tight mb-4">
              Attendance,<br />made intelligent.
            </h1>
            <p className="text-on-primary/70 text-sm leading-relaxed max-w-xs">
              Secure QR-based check-in, real-time tracking, and institutional analytics
              — built for Kabarak University.
            </p>
          </div>

          <div className="relative z-10 space-y-4 hidden lg:block">
            {[
              { label: 'Rotating QR Codes', detail: 'Token refreshes every 30 seconds' },
              { label: 'Device-Bound Check-In', detail: 'Prevents proxy attendance' },
              { label: 'Real-Time Sync', detail: 'Instant updates across all devices' },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-on-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-on-primary rounded-full" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.label}</p>
                  <p className="text-xs text-on-primary/60">{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel: Role selection or Login ─────────────────────── */}
        <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col justify-center">

          {!selectedRole ? (
            /* Role selection */
            <div className="animate-in fade-in duration-300">
              <h2 className="font-bold text-2xl text-on-surface mb-1">Sign in to KSAS</h2>
              <p className="text-on-surface-variant text-sm mb-8">
                Select your role to continue.
              </p>

              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl border border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container transition-all duration-200 text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <div className={`w-12 h-12 ${role.iconBg} ${role.iconText} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <role.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface group-hover:text-primary transition-colors">
                        {role.title}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-outline opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Login form */
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-primary font-semibold mb-8 hover:gap-2.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {/* Role indicator */}
              {activeRole && (
                <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-surface-container">
                  <div className={`w-10 h-10 ${activeRole.iconBg} ${activeRole.iconText} rounded-xl flex items-center justify-center`}>
                    <activeRole.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{activeRole.title}</p>
                    <p className="text-xs text-on-surface-variant">Sign in to your account</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-error-container text-on-error-container rounded-xl mb-5 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@kabarak.ac.ke"
                      className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-on-surface-variant mt-6">
                Your account is created by your institution administrator.
                Contact IT support if you cannot access your account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
