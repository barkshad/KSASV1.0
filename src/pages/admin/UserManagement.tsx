import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, Search, ChevronDown, MoreVertical, Lock, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  getAllUsers, 
  getUsersByRole, 
  createUser, 
  updateUser, 
  deleteUser,
  bulkImportStudents,
  bulkImportLecturers 
} from '../../lib/db';
import { exportToCSV } from '../../lib/db';
import Papa from 'papaparse';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'lecturer' | 'admin';
  studentNumber?: string;
  course?: string;
  year?: string;
  department?: string;
  status: 'active' | 'inactive';
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'student' | 'lecturer' | 'admin'>('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'progress' | 'done'>('upload');
  const [importData, setImportData] = useState<any[]>([]);
  [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentNumber: '',
    course: '',
    year: '',
    department: '',
    status: 'active',
  });

  // Load users
  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  // Filter users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = users.filter(u => 
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.studentNumber?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getUsersByRole(activeTab);
      setUsers(data);
      setFilteredUsers(data);
    } catch (e) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error' | 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        ...formData,
        password: formData.password || 'Mwahanga@1', // Default password if empty
      });
      showToast('User created successfully', 'success');
      setShowAddModal(false);
      setFormData({
        name: '', email: '', password: '', role: 'student',
        studentNumber: '', course: '', year: '', department: '', status: 'active'
      });
      loadUsers();
    } catch (e: any) {
      showToast(e.message || 'Failed to create user', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      showToast('User deleted', 'success');
      loadUsers();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete user', 'error');
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await updateUser(user.id, { status: newStatus });
      showToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
      loadUsers();
    } catch (e: any) {
      showToast(e.message || 'Failed to update user', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportData(results.data);
        setImportStep('preview');
      },
      error: () => {
        showToast('Failed to parse CSV', 'error');
      }
    });
  };

  const handleImport = async () => {
    setImportStep('progress');
    setImportProgress({ current: 0, total: importData.length, success: 0, failed: 0 });
    setImportErrors([]);

    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    // Process in batches of 10
    const batchSize = 10;
    for (let i = 0; i < importData.length; i += batchSize) {
      const batch = importData.slice(i, i + batchSize);
      const students = batch.map((row: any) => ({
        name: row.FullName || row.Name || row.fullName || row.name || '',
        email: row.Email || row.email || '',
        password: row.Password || row.StudentNumber || row.studentNumber || row['Student Number'] || 'temp123',
        studentNumber: row.StudentNumber || row.studentNumber || row['Student Number'] || '',
        course: row.Course || row.course || '',
        year: row.Year || row.year || '1',
        role: 'student',
        status: 'active',
      })).filter((s: any) => s.email && s.name);

      try {
        await bulkImportStudents(students);
        success += students.length;
      } catch (e: any) {
        failed += students.length;
        errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${e.message}`);
      }

      setImportProgress({
        current: Math.min(i + batchSize, importData.length),
        total: importData.length,
        success,
        failed,
      });
    }

    setImportErrors(errors);
    setImportStep('done');
    loadUsers();
  };

  const handleExport = () => {
    const data = filteredUsers.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Status: u.status,
      StudentNumber: u.studentNumber || '',
      Department: u.department || '',
      Course: u.course || '',
      Year: u.year || '',
    }));
    exportToCSV(data, `users_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Export downloaded', 'success');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??';
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 overflow-y-auto px-margin-mobile md:px-gutter py-md md:py-lg max-w-7xl mx-auto w-full animate-in fade-in duration-500">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-right $${
          toast.type === 'success' ? 'bg-tertiary-container text-on-tertiary-container' :
          toast.type === 'error' ? 'bg-error-container text-on-error-container' :
          'bg-primary-container text-on-primary-container'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-body-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-on-surface">User Management</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Configure and manage accounts for the entire institution.</p>
        </div>
        <div className="flex gap-base">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-xs px-md py-base h-10 md:h-12 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all font-body-sm shadow-sm"
          >
             <Upload className="w-4 h-4" />
             <span>Bulk Import</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-xs px-md py-base h-10 md:h-12 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all font-body-sm shadow-sm"
          >
             <Download className="w-4 h-4" />
             <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-md mb-lg bg-surface-container-lowest/50 p-base rounded-xl border border-outline-variant/30 shadow-sm glass-card">
        <div className="flex border-b border-outline-variant/30 px-base overflow-x-auto hide-scrollbar">
           <button 
             onClick={() => setActiveTab('student')}
             className={`px-md py-md transition-all whitespace-nowrap ${activeTab === 'student' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
           >
             Students
           </button>
           <button 
             onClick={() => setActiveTab('lecturer')}
             className={`px-md py-md transition-all whitespace-nowrap ${activeTab === 'lecturer' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
           >
             Lecturers
           </button>
           <button 
             onClick={() => setActiveTab('admin')}
             className={`px-md py-md transition-all whitespace-nowrap ${activeTab === 'admin' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
           >
             Administrators
           </button>
        </div>

        <div className="flex flex-col md:flex-row gap-base px-base pb-base pt-2">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
             <input 
               type="text" 
               placeholder="Search by name, ID, or email..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-body-md transition-all outline-none" 
             />
           </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-on-surface-variant font-body-lg">No {activeTab}s found</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-lg font-bold"
          >
            Add {activeTab}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-xl">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30 hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between mb-md">
                 <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container bg-primary-container/20 flex items-center justify-center text-primary font-bold">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(user.name)
                      )}
                    </div>
                    <div>
                      <h3 className="font-title-lg text-on-surface">{user.name}</h3>
                      <p className="text-on-surface-variant text-label-md">ID: {user.studentNumber || user.id?.substring(0, 12)}</p>
                    </div>
                 </div>
                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                   user.status === 'active' ? 'bg-tertiary-fixed-dim/20 text-tertiary-container' : 'bg-error-container text-error'
                 }`}>
                   {user.status === 'active' ? 'Active' : 'Inactive'}
                 </span>
              </div>
              <div className="space-y-xs mb-lg">
                 <div className="flex justify-between text-body-sm">
                   <span className="text-on-surface-variant">Email</span>
                   <span className="text-on-surface font-semibold truncate max-w-[150px]">{user.email}</span>
                 </div>
                 <div className="flex justify-between text-body-sm">
                   <span className="text-on-surface-variant">{activeTab === 'student' ? 'Course' : 'Department'}</span>
                   <span className="text-on-surface font-semibold">{user.course || user.department || 'N/A'}</span>
                 </div>
                 {activeTab === 'student' && (
                   <div className="flex justify-between text-body-sm">
                     <span className="text-on-surface-variant">Attendance</span>
                     <span className="text-tertiary-container font-semibold">92%</span>
                   </div>
                 )}
              </div>
              <div className="flex gap-base border-t border-outline-variant/10 pt-md">
                 <button className="flex-1 py-2 text-primary bg-primary-fixed rounded-lg text-body-sm font-bold hover:bg-primary-container hover:text-on-primary-container transition-all">
                   View Profile
                 </button>
                 <button 
                   onClick={() => handleToggleStatus(user)}
                   className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg bg-surface-variant/30"
                   title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                 >
                    <Lock className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={() => handleDeleteUser(user.id)}
                   className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg bg-surface-variant/30"
                   title="Delete"
                 >
                    <X className="w-5 h-5" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add User FAB */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-8 md:bottom-12 md:right-12 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
      >
         <Plus className="w-8 h-8" />
      </button>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="font-title-lg text-on-surface">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-on-surface-variant mb-1 block">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'lecturer', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`py-2 rounded-lg font-body-sm font-semibold capitalize transition-all ${
                        formData.role === r 
                          ? 'bg-primary text-on-primary' 
                          : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-label-md text-on-surface-variant mb-1 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="font-label-md text-on-surface-variant mb-1 block">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="john@kabarak.ac.ke"
                />
              </div>

              <div>
                <label className="font-label-md text-on-surface-variant mb-1 block">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Leave empty for default: Mwahanga@1"
                />
              </div>

              {formData.role === 'student' && (
                <>
                  <div>
                    <label className="font-label-md text-on-surface-variant mb-1 block">Student Number</label>
                    <input
                      type="text"
                      value={formData.studentNumber}
                      onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="KAB/001/2023"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-label-md text-on-surface-variant mb-1 block">Course</label>
                      <input
                        type="text"
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <label className="font-label-md text-on-surface-variant mb-1 block">Year</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        <option value="">Select</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {(formData.role === 'lecturer' || formData.role === 'admin') && (
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="School of Science"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-outline-variant text-on-surface rounded-lg font-bold hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary-container transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="font-title-lg text-on-surface">Bulk Import Students</h3>
              <button onClick={() => { setShowImportModal(false); setImportStep('upload'); }} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            {importStep === 'upload' && (
              <div className="p-6 space-y-4">
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-outline mx-auto mb-4" />
                  <p className="font-body-md text-on-surface mb-2">Drop CSV file here or click to browse</p>
                  <p className="font-body-sm text-on-surface-variant mb-4">Required columns: FullName, Email, StudentNumber, Course, Year</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold"
                  >
                    Select File
                  </button>
                </div>
              </div>
            )}

            {importStep === 'preview' && (
              <div className="p-6 space-y-4">
                <p className="font-body-md text-on-surface">Preview: {importData.length} rows found</p>
                <div className="max-h-[300px] overflow-y-auto border border-outline-variant rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Student #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 5).map((row: any, i: number) => (
                        <tr key={i} className="border-b border-outline-variant/20">
                          <td className="px-3 py-2">{row.FullName || row.Name}</td>
                          <td className="px-3 py-2">{row.Email || row.email}</td>
                          <td className="px-3 py-2">{row.StudentNumber || row.studentNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importData.length > 5 && (
                    <p className="text-center py-2 text-on-surface-variant text-sm">...and {importData.length - 5} more</p>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setImportStep('upload')}
                    className="flex-1 py-3 border border-outline-variant text-on-surface rounded-lg font-bold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-bold"
                  >
                    Import {importData.length} Students
                  </button>
                </div>
              </div>
            )}

            {importStep === 'progress' && (
              <div className="p-6 space-y-4 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="font-body-lg text-on-surface">Importing...</p>
                <p className="font-body-md text-on-surface-variant">
                  {importProgress.current} of {importProgress.total} processed
                </p>
                <div className="w-full bg-surface-variant rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-tertiary-container">Success: {importProgress.success} | Failed: {importProgress.failed}</p>
              </div>
            )}

            {importStep === 'done' && (
              <div className="p-6 space-y-4 text-center">
                <div className="w-16 h-16 bg-tertiary-container/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-tertiary-container" />
                </div>
                <p className="font-body-lg text-on-surface">Import Complete!</p>
                <p className="font-body-md text-on-surface-variant">
                  Successfully imported {importProgress.success} of {importProgress.total} students
                </p>
                {importErrors.length > 0 && (
                  <div className="text-left bg-error-container/20 rounded-lg p-4 max-h-[150px] overflow-y-auto">
                    <p className="text-error font-label-md mb-2">Errors:</p>
                    {importErrors.map((err, i) => (
                      <p key={i} className="text-sm text-error">• {err}</p>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setShowImportModal(false); setImportStep('upload'); }}
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
