import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Download, Search, ChevronDown, MoreVertical, Lock, Plus, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { hashPassword } from '../../lib/auth';
import { uploadJSONToCloudinary as uploadJSON, fetchJSONFromCloudinary as getJSON } from '../../lib/cloudinary';
import { db, doc, setDoc } from '../../lib/firebase';
import { collections } from '../../lib/db';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [filterRole, setFilterRole] = useState('student');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', uid: '', password: '', role: 'student', course: '', department: '' });
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
     const fetchUsers = async () => {
         setLoading(true);
         try {
             const data = await getJSON('users.json') || [];
             setUsers(data);
         } catch (e) {
             console.error(e);
             setUsers([]);
         } finally {
             setLoading(false);
         }
     };
     fetchUsers();
  }, []);

  const handleManualSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingUser(true);
      try {
          const hashedPassword = await hashPassword(newUser.password || '123456');
          const userObj = {
              ...newUser,
              password: hashedPassword,
              status: 'active'
          };
          
          await setDoc(doc(db, collections.USERS, userObj.uid.toLowerCase().replace(/[^a-z0-9]/g, '')), {
              uid: userObj.uid,
              name: userObj.name,
              email: userObj.email,
              role: userObj.role,
              password: hashedPassword
          }, { merge: true });

          const merged = [...users, userObj];
          await uploadJSON('users.json', merged);
          setUsers(merged);
          setShowAddModal(false);
          setNewUser({ name: '', email: '', uid: '', password: '', role: 'student', course: '', department: '' });
          alert("User created successfully!");
      } catch (err: any) {
          alert(`Failed to save: ${err.message}`);
      } finally {
          setSavingUser(false);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImporting(true);
      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
              try {
                  const newUsers = [];
                  for (const row of results.data as any[]) {
                      const role = row.Role?.toLowerCase() || (row.StudentNumber ? 'student' : 'lecturer');
                      const hashedPassword = await hashPassword(row.Password || '123456');
                      const id = (row.StudentNumber || row.StaffID || row.ID || '').toString();
                      
                      const newUser = {
                          uid: id,
                          name: row.FullName || row.Name,
                          email: row.Email,
                          password: hashedPassword,
                          role,
                          course: row.Course,
                          department: row.Department,
                          year: row.Year,
                          status: 'active'
                      };
                      newUsers.push(newUser);
                      
                      // Also push simple stub to Firestore for query performance during login & roles
                      await setDoc(doc(db, collections.USERS, id.toLowerCase().replace(/[^a-z0-9]/g, '')), {
                          uid: id,
                          name: newUser.name,
                          email: newUser.email,
                          role,
                          password: hashedPassword // For a real app, use Firebase Auth instead of storing hashed passwords like this
                      }, { merge: true });
                  }
                  
                  const merged = [...users, ...newUsers.filter(nu => !users.some(u => u.uid === nu.uid))];
                  await uploadJSON('users.json', merged);
                  setUsers(merged);
                  alert(`Successfully imported ${newUsers.length} users!`);
              } catch (err: any) {
                  alert(`Import failed: ${err.message}`);
              } finally {
                  setImporting(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
              }
          },
          error: (error) => {
              alert(`Parse error: ${error.message}`);
              setImporting(false);
          }
      });
  };

  const filteredUsers = users.filter(u => u.role === filterRole);

  return (
    <>
    <div className="flex-1 flex flex-col relative z-10 overflow-y-auto px-margin-mobile md:px-gutter py-md md:py-lg max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-on-surface">User Management</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Configure and manage accounts for the entire institution.</p>
        </div>
        <div className="flex gap-base">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={importing}
             className="flex items-center gap-xs px-md py-base h-10 md:h-12 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all font-body-sm shadow-sm disabled:opacity-50"
             >
             {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
             <span>{importing ? 'Importing...' : 'Bulk Import'}</span>
          </button>
          <button className="flex items-center gap-xs px-md py-base h-10 md:h-12 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all font-body-sm shadow-sm">
             <Download className="w-4 h-4" />
             <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-md mb-lg bg-surface-container-lowest/50 p-base rounded-xl border border-outline-variant/30 shadow-sm glass-card">
        <div className="flex border-b border-outline-variant/30 px-base overflow-x-auto hide-scrollbar">
           <button onClick={() => setFilterRole('student')} className={`px-md py-md font-bold transition-all whitespace-nowrap ${filterRole === 'student' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>Students</button>
           <button onClick={() => setFilterRole('lecturer')} className={`px-md py-md font-bold transition-all whitespace-nowrap ${filterRole === 'lecturer' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>Lecturers</button>
           <button onClick={() => setFilterRole('admin')} className={`px-md py-md font-bold transition-all whitespace-nowrap ${filterRole === 'admin' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>Administrators</button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-base px-base pb-base pt-2">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
             <input type="text" placeholder="Search by name, ID, or email..." className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-body-md transition-all outline-none" />
           </div>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filteredUsers.length === 0 ? (
          <div className="text-center p-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
              No users found for this role. Use Bulk Import to add users.
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-xl">
             {filteredUsers.map(u => (
                 <div key={u.uid} className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30 hover:shadow-lg hover:-translate-y-1 transition-all group">
                    <div className="flex items-start justify-between mb-md">
                       <div className="flex items-center gap-md">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container bg-surface-variant flex items-center justify-center font-bold text-lg text-primary">
                             {u.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h3 className="font-title-lg text-on-surface">{u.name}</h3>
                            <p className="text-on-surface-variant text-label-md">ID: {u.uid}</p>
                          </div>
                       </div>
                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-tertiary-fixed-dim/20 text-tertiary-container' : 'bg-error-container text-error'}`}>
                          {u.status || 'Active'}
                       </span>
                    </div>
                    <div className="space-y-xs mb-lg">
                       <div className="flex justify-between text-body-sm">
                         <span className="text-on-surface-variant">{u.role === 'student' ? 'Course' : 'Dept'}</span>
                         <span className="text-on-surface font-semibold truncate max-w-[150px]">{u.course || u.department || 'N/A'}</span>
                       </div>
                       <div className="flex justify-between text-body-sm">
                         <span className="text-on-surface-variant">Email</span>
                         <span className="text-primary font-semibold truncate max-w-[150px]">{u.email}</span>
                       </div>
                    </div>
                 </div>
             ))}
          </div>
      )}
    </div>

      <button onClick={() => setShowAddModal(true)} className="fixed bottom-24 right-8 md:bottom-12 md:right-12 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40">
         <Plus className="w-8 h-8" />
      </button>

      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 shadow-2xl backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface rounded-3xl p-8 w-[95vw] sm:w-full max-w-[448px] shadow-2xl border border-outline-variant/30 animate-in zoom-in-95 duration-200 text-left">
            <h3 className="font-headline-sm font-bold mb-6 text-on-surface">Add New User</h3>
            <form onSubmit={handleManualSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-on-surface-variant">Full Name</label>
                <input required value={newUser.name} onChange={e=>setNewUser({...newUser, name: e.target.value})} className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-on-surface-variant">Email</label>
                <input type="email" required value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="john@kabarak.ac.ke" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-on-surface-variant">ID / Student Number</label>
                <input required value={newUser.uid} onChange={e=>setNewUser({...newUser, uid: e.target.value})} className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="KAB/001/2023" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-on-surface-variant">Role</label>
                <select value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})} className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none">
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <p className="text-xs text-on-surface-variant mt-2">* Default password for new users is <strong>123456</strong></p>
              <div className="flex gap-3 justify-end mt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 font-bold hover:bg-surface-variant text-on-surface-variant rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={savingUser} className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-70">
                   {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save User
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </>
  );
}
