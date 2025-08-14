import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import GlicoLogo from '../components/GlicoLogo';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    password_hash: '',
    new_password: ''
  });
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: 'user',
    message: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: user?.role === 'admin' ? 'user' : 'user'
  });

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      loadStats();
      loadUsers();
    }
  }, [user, currentPage, searchTerm, roleFilter]);

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter
      });

      const response = await axios.get(`/api/admin/users?${params}`);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/users', formData);
      toast.success('User created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      
      await axios.put(`/api/admin/users/${selectedUser.id}`, updateData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    // Find the user to check their role
    const userToDelete = users.find(u => u.id === userId);
    const isSuperAdmin = userToDelete?.role === 'super_admin';
    
    const confirmMessage = isSuperAdmin 
      ? 'Are you sure you want to delete this SUPER ADMIN user? This action cannot be undone and will remove all their privileges.'
      : 'Are you sure you want to delete this user? This action cannot be undone.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/admin/users/${userId}`);
      toast.success(response.data.message || 'User deleted successfully');
      
      // Show warning if super admin was deleted
      if (response.data.warning) {
        toast(response.data.warning, { icon: '⚠️' });
      }
      
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const openPasswordModal = async (user) => {
    try {
      const response = await axios.get(`/api/admin/users/${user.id}/password`);
      setPasswordData({
        password_hash: response.data.user.password_hash,
        new_password: ''
      });
      setSelectedUser(user);
      setShowPasswordModal(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch password data');
    }
  };

  const openResetPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordData({ password_hash: '', new_password: '' });
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/admin/users/${selectedUser.id}/reset-password`, {
        new_password: passwordData.new_password
      });
      toast.success('Password reset successfully');
      setShowResetPasswordModal(false);
      setPasswordData({ password_hash: '', new_password: '' });
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    }
  };

  const handleInviteTeamMember = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/invite', inviteData);
      toast.success('Team member invited successfully');
      setShowInviteModal(false);
      setInviteData({ name: '', email: '', role: 'user', message: '' });
      loadUsers();
      
      // Show invitation details
      if (response.data.invitation) {
        toast.success(`Invitation sent! Temporary password: ${response.data.invitation.temporary_password}`, {
          duration: 10000
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to invite team member');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      user: 'bg-gray-100 text-gray-800',
      admin: 'bg-blue-100 text-blue-800',
      super_admin: 'bg-purple-100 text-purple-800'
    };
    return badges[role] || badges.user;
  };

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users and monitor system activity</p>
            </div>
            <GlicoLogo size="medium" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.userStats?.total_users || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.surveyStats?.total_surveys || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responseStats?.total_responses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Users (7d)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.userStats?.new_users_7d || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Management Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                <div className="flex space-x-3">
                  <Link
                    to="/register"
                    className="btn-secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Account
                  </Link>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn-secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </button>
                </div>
              </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input w-full"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surveys
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <div className="spinner mx-auto"></div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((tableUser) => (
                    <tr key={tableUser.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tableUser.name}</div>
                          <div className="text-sm text-gray-500">{tableUser.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(tableUser.role)}`}>
                          {tableUser.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tableUser.survey_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tableUser.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Show edit/delete buttons for super admins only */}
                          {user?.role === 'super_admin' && (
                            <>
                              <button
                                onClick={() => openEditModal(tableUser)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openPasswordModal(tableUser)}
                                className="text-purple-600 hover:text-purple-900"
                                title="View password hash"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openResetPasswordModal(tableUser)}
                                className="text-orange-600 hover:text-orange-900"
                                title="Reset password"
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                              {tableUser.id !== user.id && (
                                <button
                                  onClick={() => handleDeleteUser(tableUser.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input mt-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input mt-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input mt-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input mt-1 w-full"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {user?.role === 'super_admin' && (
                    <option value="super_admin">Super Admin</option>
                  )}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input mt-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input mt-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input mt-1 w-full"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {user?.role === 'super_admin' && (
                    <option value="super_admin">Super Admin</option>
                  )}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Team Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Team Member</h3>
            <form onSubmit={handleInviteTeamMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  className="input mt-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="input mt-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="input mt-1 w-full"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {user?.role === 'super_admin' && (
                    <option value="super_admin">Super Admin</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Personal Message (Optional)</label>
                <textarea
                  value={inviteData.message}
                  onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                  className="input mt-1 w-full"
                  rows="3"
                  placeholder="Welcome to the team! We're excited to have you on board."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Password Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <p className="text-sm text-gray-900 mt-1">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password Hash</label>
                <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700 break-all">
                  {passwordData.password_hash}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    openResetPasswordModal(selectedUser);
                  }}
                  className="btn-primary flex-1"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Password</h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <p className="text-sm text-gray-900 mt-1">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="input mt-1 w-full"
                  required
                  minLength="6"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 