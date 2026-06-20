import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  GraduationCap,
  UserCheck,
  Mail,
  Hash,
  X,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db, collection, query, getDocs, where, doc, setDoc, deleteDoc, serverTimestamp } from '../../lib/firebase';
import { logAudit } from '../../lib/db';
import toast from 'react-hot-toast';

interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  department: string;
  createdAt?: any;
}

const ROLES = [
  { value: 'student', label: 'Student', icon: GraduationCap, color: 'bg-primary-container text-on-primary-container' },
  { value: 'lecturer', label: 'Lecturer', icon: UserCheck, color: 'bg-tertiary-container text-on-tertiary-container' },
  { value: 'admin', label: 'Administrator', icon: Shield, color: 'bg-error-container text-on-error-container' },
] as const;

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    uid: '',
    role: 'student' as const,
    department: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      const userList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User));
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(collection(db, 'users'));
      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Password is set to a secure random hash by backend; 
        // default password is communicated securely to user
      });

      await logAudit(user, 'USER_CREATE', 'user', `Created user ${newUser.email} with role ${newUser.role}`);
      toast.success(`User ${newUser.name} created successfully`);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', uid: '', role: 'student', department: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete ${targetUser.name}? This action cannot be undone.`)) return;

    try {
      await deleteDoc(doc(db, 'users', targetUser.id));
      await logAudit(user, 'USER_DELETE', 'user', `Deleted user ${targetUser.email}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users
    .filter((u) => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.uid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const aVal = a[sortField]?.toString().toLowerCase() || '';
      const bVal = b[sortField]?.toString().toLowerCase() || '';
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const toggleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">User Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage students, lecturers, and administrators
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-on-surface"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-on-surface-variant" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-on-surface"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="lecturer">Lecturers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-on-surface">
                    User
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <button onClick={() => toggleSort('role')} className="flex items-center gap-1 hover:text-on-surface">
                    Role
                    {sortField === 'role' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                    <p className="text-on-surface-variant font-medium">No users found</p>
                    <p className="text-sm text-on-surface-variant/60 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleConfig = ROLES.find((r) => r.value === u.role) || ROLES[0];
                  const RoleIcon = roleConfig.icon;
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-surface-container-high/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-on-surface">{u.name}</p>
                            <p className="text-xs text-on-surface-variant">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {u.department || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">
                        {u.uid}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-2 text-error hover:bg-error-container rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-scrim/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-outline-variant/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-on-surface">Add New User</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/50 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-on-surface"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/50 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-on-surface"
                    placeholder="john@kabarak.ac.ke"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    ID / Student Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.uid}
                    onChange={(e) => setNewUser({ ...newUser, uid: e.target.value })}
                    className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/50 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-on-surface"
                    placeholder="KAB/001/2023"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">
                      Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                      className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/50 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-on-surface"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/50 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-on-surface"
                      placeholder="School of Science"
                    />
                  </div>
                </div>

                {/* Password is auto-generated and communicated securely — not shown in UI */}
                <div className="p-3 bg-tertiary-container/50 rounded-xl flex items-start gap-3">
                  <Lock className="w-4 h-4 text-on-tertiary-container mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-on-tertiary-container">
                    A secure temporary password will be generated automatically. 
                    The user will receive instructions to set their own password on first login.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 border border-outline-variant rounded-xl font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
