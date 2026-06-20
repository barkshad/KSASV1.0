import React, { useState } from 'react';
import {
  LogOut, Moon, Bell, Globe, HelpCircle, AlertOctagon,
  Edit2, ChevronRight, Save, Lock, Eye, EyeOff,
  User, Mail, CheckCircle, X, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

type Tab = 'profile' | 'security' | 'preferences';

export default function Profile() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile edit state
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Password state
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const roleLabel: Record<string, string> = {
    student: 'Student',
    lecturer: 'Lecturer',
    admin: 'Administrator',
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile(editName.trim(), editEmail.trim());
      setProfileMsg({ type: 'ok', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'err', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'err', text: 'New passwords do not match.' });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: 'err', text: 'Password must be at least 6 characters.' });
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(oldPw, newPw);
      setPwMsg({ type: 'ok', text: 'Password changed successfully!' });
      setOldPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      setPwMsg({ type: 'err', text: err.message || 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">

      {/* Header Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 mb-6 shadow-sm border border-outline-variant/20 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-primary text-on-primary font-bold text-2xl flex items-center justify-center shrink-0 border-4 border-primary-container shadow-md">
          {initials}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-headline-md text-on-surface font-bold">{user?.name}</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">{user?.email}</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary-container text-on-primary-container">
              <ShieldCheck className="w-3 h-3" />
              {roleLabel[user?.role] || user?.role}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant border border-outline-variant/30">
              {user?.uid}
            </span>
          </div>
        </div>

        {/* Logout on header for quick access */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-error border border-error/30 hover:bg-error-container/20 transition-colors font-bold text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 mb-6 bg-surface-container-lowest rounded-t-xl overflow-hidden">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary bg-primary-container/10'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* === PROFILE TAB === */}
      {activeTab === 'profile' && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
          <h2 className="font-title-lg font-bold text-on-surface mb-1">Edit Profile</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Update your display name and email address.
          </p>

          {profileMsg && (
            <div className={`flex items-start gap-2 p-3 rounded-xl mb-4 text-sm font-medium ${
              profileMsg.type === 'ok'
                ? 'bg-tertiary-fixed-dim/20 text-on-tertiary-container'
                : 'bg-error-container text-on-error-container'
            }`}>
              {profileMsg.type === 'ok'
                ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                : <X className="w-4 h-4 shrink-0 mt-0.5" />}
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                <input
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                <input
                  required
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">
                Role
              </label>
              <input
                disabled
                value={roleLabel[user?.role] || user?.role || ''}
                className="w-full px-4 py-3 bg-surface-container-high border border-outline-variant/30 rounded-xl text-on-surface-variant cursor-not-allowed"
              />
              <p className="text-xs text-on-surface-variant mt-1">Role is assigned by the administrator.</p>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {/* === SECURITY TAB === */}
      {activeTab === 'security' && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
          <h2 className="font-title-lg font-bold text-on-surface mb-1">Change Password</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Choose a strong password with at least 6 characters.
          </p>

          {pwMsg && (
            <div className={`flex items-start gap-2 p-3 rounded-xl mb-4 text-sm font-medium ${
              pwMsg.type === 'ok'
                ? 'bg-tertiary-fixed-dim/20 text-on-tertiary-container'
                : 'bg-error-container text-on-error-container'
            }`}>
              {pwMsg.type === 'ok'
                ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                : <X className="w-4 h-4 shrink-0 mt-0.5" />}
              {pwMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                <input
                  required
                  type={showOld ? 'text' : 'password'}
                  value={oldPw}
                  onChange={e => setOldPw(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                >
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                <input
                  required
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {newPw.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        newPw.length >= i * 3
                          ? i <= 1 ? 'bg-error' : i <= 2 ? 'bg-secondary' : i <= 3 ? 'bg-tertiary-container' : 'bg-green-500'
                          : 'bg-surface-variant'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                <input
                  required
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-surface-container border rounded-xl focus:outline-none focus:ring-1 transition-all text-on-surface ${
                    confirmPw && confirmPw !== newPw
                      ? 'border-error focus:border-error focus:ring-error'
                      : 'border-outline-variant/50 focus:border-primary focus:ring-primary'
                  }`}
                  placeholder="Repeat new password"
                />
              </div>
              {confirmPw && confirmPw !== newPw && (
                <p className="text-xs text-error mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pwSaving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </form>

          {/* Danger zone */}
          <div className="mt-8 pt-6 border-t border-outline-variant/20">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              Account
            </h3>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-error-container/20 text-error border border-error/20 rounded-xl font-bold hover:bg-error-container/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of KSAS
            </button>
          </div>
        </div>
      )}

      {/* === PREFERENCES TAB === */}
      {activeTab === 'preferences' && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="divide-y divide-outline-variant/20">
            <label className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary-container/50 text-on-secondary-container rounded-lg">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-on-surface">Dark Theme</p>
                  <p className="text-sm text-on-surface-variant">Adjust appearance</p>
                </div>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>

            <label className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary-container/50 text-on-secondary-container rounded-lg">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-on-surface">Push Notifications</p>
                  <p className="text-sm text-on-surface-variant">Session alerts & reminders</p>
                </div>
              </div>
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>

            <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary-container/50 text-on-secondary-container rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-on-surface">Language</p>
                  <p className="text-sm text-on-surface-variant">English (UK)</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-outline" />
            </div>

            <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary-container/50 text-on-secondary-container rounded-lg">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-on-surface">Help & FAQ</p>
                  <p className="text-sm text-on-surface-variant">Guides and support</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-outline" />
            </div>

            <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-error-container/30 text-error rounded-lg">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-on-surface">Report an Issue</p>
                  <p className="text-sm text-on-surface-variant">Send feedback to admin</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-outline" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
