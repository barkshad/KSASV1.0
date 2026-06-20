import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, Bell, Globe, HelpCircle, AlertOctagon, Edit2, ChevronRight, User, CheckCircle } from 'lucide-react';
import { getCurrentUser, logout } from '../../lib/auth';
import { getUserById, updateUser } from '../../lib/db';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', department: '' });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    async function loadUser() {
      const current = getCurrentUser();
      if (!current?.uid) {
        setLoading(false);
        return;
      }
      try {
        const data = await getUserById(current.uid);
        if (data) {
          setUser(data);
          setFormData({ name: data.name || '', department: data.department || '' });
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      await updateUser(user.id, { name: formData.name, department: formData.department });
      setUser({ ...user, name: formData.name, department: formData.department });
      showToast('Profile updated', 'success');
      setEditing(false);
    } catch (e: any) {
      showToast(e.message || 'Failed to update', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile md:px-gutter py-8 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayUser = user || {
    name: 'Jane Doe',
    email: 'jane@kabarak.ac.ke',
    studentNumber: 'KAB/001/2023',
    department: 'School of Science',
    year: 'Year 2, Sem 1',
    status: 'active',
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile md:px-gutter py-8 animate-in fade-in duration-500">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-right ${
          toast.type === 'success' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-on-error-container'
        }`}>
          <CheckCircle className="w-5 h-5" />
          <span className="font-body-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">

        {/* Profile Header Card */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-gutter">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col items-center text-center">

            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-display-lg border-4 border-surface shadow-md">
                {displayUser.avatar ? (
                  <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  displayUser.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'JD'
                )}
              </div>
              <button 
                onClick={() => setEditing(!editing)}
                className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container rounded-full p-2 shadow-sm hover:scale-105 transition-transform"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <h2 className="font-headline-lg text-on-surface mb-1">{displayUser.name}</h2>
            <p className="font-body-lg text-on-surface-variant mb-4">{displayUser.department || 'BSc. Computer Science'}</p>

            <div className="w-full bg-surface-container-low rounded-lg p-4 flex flex-col gap-2 text-left">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <span className="font-label-md text-outline">STUDENT ID</span>
                <span className="font-body-md font-semibold text-on-surface">{displayUser.studentNumber || displayUser.id?.substring(0, 12) || 'KAB/001/2023'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <span className="font-label-md text-outline">YEAR</span>
                <span className="font-body-md font-semibold text-on-surface">{displayUser.year || 'Year 2, Sem 1'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-md text-outline">STATUS</span>
                <span className={`px-2 py-1 rounded-full font-label-md ${
                  displayUser.status === 'active' ? 'bg-tertiary-fixed-dim/20 text-tertiary-container' : 'bg-error-container text-error'
                }`}>
                  {displayUser.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-gutter">

          {/* Edit Form */}
          {editing && (
            <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-6 animate-in fade-in">
              <h3 className="font-title-lg text-on-surface mb-4">Edit Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 py-2 border border-outline-variant text-on-surface rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </section>
          )}

          <section>
            <h3 className="font-title-lg text-on-surface mb-4">Academic Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-2">
                  <p className="font-label-md text-primary">TOTAL COURSES</p>
                  <p className="font-display-lg text-on-surface leading-none">8</p>
               </div>
               <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-2">
                  <p className="font-label-md text-tertiary-container">CREDITS EARNED</p>
                  <p className="font-display-lg text-on-surface leading-none">42</p>
               </div>
               <div className="col-span-2 md:col-span-1 bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                  <p className="font-label-md text-secondary">ATTENDANCE</p>
                  <div>
                    <p className="font-display-lg text-on-surface leading-none mb-1">92<span className="text-2xl text-on-surface-variant">%</span></p>
                    <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-tertiary-container w-[92%] rounded-full"></div>
                    </div>
                  </div>
               </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
             <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/50">
               <h3 className="font-title-lg text-on-surface">Settings & Preferences</h3>
             </div>
             <div className="divide-y divide-outline-variant/20">
                <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary-container/50 text-on-secondary-container rounded-lg">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-body-lg text-on-surface font-medium">Dark Theme</p>
                      <p className="font-body-sm text-on-surface-variant">Adjust appearance</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary-container/50 text-on-secondary-container rounded-lg">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-body-lg text-on-surface font-medium">Notifications</p>
                      <p className="font-body-sm text-on-surface-variant">Push and email alerts</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary-container/50 text-on-secondary-container rounded-lg">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-body-lg text-on-surface font-medium">Language</p>
                      <p className="font-body-sm text-on-surface-variant">English (UK)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                </div>
             </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
             <button className="flex items-center justify-center gap-2 p-4 bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface rounded-xl transition-colors border border-outline-variant/30">
               <HelpCircle className="w-5 h-5" />
               <span className="font-body-md font-medium">FAQ & Guides</span>
             </button>
             <button className="flex items-center justify-center gap-2 p-4 bg-error-container/20 hover:bg-error-container/40 text-error rounded-xl transition-colors border border-error/20">
               <AlertOctagon className="w-5 h-5" />
               <span className="font-body-md font-medium">Report an Issue</span>
             </button>
          </section>

          <div className="mt-8 mb-4">
             <button 
                onClick={handleLogout}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-surface text-error rounded-lg hover:bg-error-container transition-colors border border-outline-variant/30 mx-auto shadow-sm"
             >
               <LogOut className="w-5 h-5" />
               <span className="font-body-md font-semibold">Sign Out</span>
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
