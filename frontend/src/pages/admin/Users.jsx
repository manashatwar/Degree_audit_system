import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminService } from '../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  UserPlus, 
  Search, 
  Lock, 
  Unlock, 
  Key, 
  Trash2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Edit,
  X
} from 'lucide-react';

const ROLES = ['Student', 'FacultyAdvisor', 'RegistrarStaff', 'Dean', 'AdmissionCell', 'SystemAdmin'];
const DEPARTMENTS = ['CSE', 'CCE', 'ECE', 'MME', 'Physics', 'Mathematics', 'HSS', 'Administration', 'CCIT'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Add User Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'Student',
    department: 'CSE',
    identifier: ''
  });

  // Change Role Modal
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newRole, setNewRole] = useState('Student');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.email || !form.name) {
      showToast('Name and Email are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await adminService.createUser(form);
      showToast(`User ${form.email} created successfully with role ${form.role}`);
      setShowAddModal(false);
      setForm({
        name: '',
        email: '',
        password: 'password123',
        role: 'Student',
        department: 'CSE',
        identifier: ''
      });
      await loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const targetStatus = user.accountStatus === 'Suspended' ? 'Active' : 'Suspended';
    const confirmMsg = targetStatus === 'Suspended'
      ? `Are you sure you want to suspend access for ${user.email}? They will not be able to log in.`
      : `Reactivate access for ${user.email}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await adminService.toggleStatus(user.userId, targetStatus);
      showToast(`Account for ${user.email} marked as ${targetStatus}`);
      await loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update account status', 'error');
    }
  };

  const handleResetPassword = async (user) => {
    if (!window.confirm(`Reset password for ${user.email} to default 'password123'?`)) return;

    try {
      const res = await adminService.resetPassword(user.userId, 'password123');
      showToast(res.message || 'Password reset to password123');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password', 'error');
    }
  };

  const handleChangeRoleSubmit = async (e) => {
    e.preventDefault();
    if (!roleModalUser) return;

    try {
      await adminService.updateUser(roleModalUser.userId, { role: newRole });
      showToast(`Role for ${roleModalUser.email} updated to ${newRole}`);
      setRoleModalUser(null);
      await loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user role', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete account for ${user.email}? This action is logged.`)) return;

    try {
      await adminService.deleteUser(user.userId);
      showToast(`Account ${user.email} deleted successfully`);
      await loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.accountStatus === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.department && u.department.toLowerCase().includes(term)) ||
      (u.identifier && u.identifier.toLowerCase().includes(term));

    return matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Maintain accounts, assign roles, lock/unlock login access, and reset passwords
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              className="flex items-center space-x-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#1e2d4a] hover:bg-[#2a3f6b] text-white flex items-center space-x-1.5 text-sm px-4 py-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create New User</span>
            </Button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`p-4 rounded-lg text-sm font-medium border flex items-center space-x-2 ${
            toast.type === 'success' ? 'bg-green-50 border-green-300 text-green-900' : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* User Table Card */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">System Users ({filteredUsers.length})</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Active accounts across Students, Advisors, Registrar, Dean, Admission, and Administration
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user, email, dept..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Roles</option>
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span>Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">No users found matching the filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1e2d4a] text-white text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">User & Email</th>
                      <th className="px-4 py-3">Assigned Role</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-3 py-3 text-center">Status</th>
                      <th className="px-3 py-3 text-center">Last Login</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-xs">
                    {filteredUsers.map((u, idx) => {
                      const isSuspended = u.accountStatus === 'Suspended';
                      const rowBg = idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100';

                      return (
                        <tr key={u.userId} className={`${rowBg} transition-colors`}>
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-gray-900">{u.name}</p>
                            <p className="text-gray-500 text-xs font-mono">{u.email}</p>
                            {u.identifier && (
                              <span className="text-[10px] text-gray-400">ID: {u.identifier}</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 inline-block">
                              {u.role}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-gray-700">
                            {u.department || 'Administration'}
                          </td>

                          <td className="px-3 py-3.5 text-center">
                            {isSuspended ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                                <Lock className="h-3 w-3" />
                                <span>SUSPENDED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">
                                <CheckCircle className="h-3 w-3" />
                                <span>ACTIVE</span>
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3.5 text-center text-gray-500 text-[11px]">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              {/* Change Role */}
                              <button
                                onClick={() => {
                                  setRoleModalUser(u);
                                  setNewRole(u.role);
                                }}
                                className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                                title="Change Role"
                              >
                                <Shield className="h-4 w-4" />
                              </button>

                              {/* Toggle Status (Lock/Unlock) */}
                              <button
                                onClick={() => handleToggleStatus(u)}
                                className={`p-1.5 rounded ${isSuspended ? 'text-green-600 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}
                                title={isSuspended ? 'Unlock Account' : 'Suspend / Lock Account'}
                              >
                                {isSuspended ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => handleResetPassword(u)}
                                className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded"
                                title="Reset Password"
                              >
                                <Key className="h-4 w-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#1e2d4a] px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                  <h3 className="font-bold text-base">Create New Institutional Account</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-gray-300 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Agrawal"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh.agrawal@lnmiit.ac.in"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Assigned Role *
                    </label>
                    <select
                      value={form.role}
                      onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <select
                      value={form.department}
                      onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Roll No / Employee ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24UCS150 or EMP-202"
                    value={form.identifier}
                    onChange={e => setForm(prev => ({ ...prev, identifier: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Default password is set to password123</p>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#1e2d4a] hover:bg-[#2a3f6b] text-white"
                  >
                    {submitting ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Role Modal */}
        {roleModalUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#1e2d4a] px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <h3 className="font-bold text-base">Modify User Role</h3>
                </div>
                <button onClick={() => setRoleModalUser(null)} className="text-gray-300 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleChangeRoleSubmit} className="p-6 space-y-4">
                <div className="bg-gray-50 p-3 rounded border text-xs space-y-1">
                  <p><strong>User:</strong> {roleModalUser.name}</p>
                  <p><strong>Email:</strong> {roleModalUser.email}</p>
                  <p><strong>Current Role:</strong> {roleModalUser.role}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Select New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRoleModalUser(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#1e2d4a] hover:bg-[#2a3f6b] text-white"
                  >
                    Save Role Change
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
