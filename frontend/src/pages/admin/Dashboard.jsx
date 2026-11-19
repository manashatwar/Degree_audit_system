import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { adminService } from '../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  Shield, 
  Settings, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  ArrowRight,
  RefreshCw,
  Server,
  Lock
} from 'lucide-react';

const ROLE_COLORS = {
  Student: 'bg-blue-100 text-blue-800 border-blue-200',
  FacultyAdvisor: 'bg-purple-100 text-purple-800 border-purple-200',
  RegistrarStaff: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Dean: 'bg-amber-100 text-amber-800 border-amber-200',
  AdmissionCell: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  SystemAdmin: 'bg-red-100 text-red-800 border-red-200'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, logsData] = await Promise.all([
        adminService.getStats(),
        adminService.getLogs({ limit: 6 })
      ]);
      setStats(statsData);
      setRecentLogs(logsData || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system administrator statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Administration Desk</h1>
            <p className="text-gray-600 mt-1">
              Institutional security, multi-role user accounts, platform settings, and immutable audit logs
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="flex items-center space-x-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => navigate('/admin/users')}
              className="bg-[#1e2d4a] hover:bg-[#2a3f6b] text-white flex items-center space-x-1.5 text-sm px-4 py-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Manage Users</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Top 4 Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-green-600 font-medium mt-0.5">{stats?.activeUsers || 0} active • {stats?.suspendedUsers || 0} suspended</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role Classes</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">6 Roles</p>
                <p className="text-xs text-gray-500 mt-0.5">Students, Advisors, Staff, Dean</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                <Shield className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Audit Trail</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.totalLogs || 0} Events</p>
                <p className="text-xs text-gray-500 mt-0.5">Immutable activity logs</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                <FileText className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Status</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {stats?.systemConfig?.maintenanceMode ? 'Maintenance' : 'Operational'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{stats?.systemConfig?.currentSemester || 'Active Session'}</p>
              </div>
              <div className={`p-3 rounded-full ${stats?.systemConfig?.maintenanceMode ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                <Server className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Distribution & Platform Settings */}
          <div className="space-y-6 lg:col-span-1">
            {/* Role Breakdown Card */}
            <Card>
              <CardHeader className="bg-gray-50 border-b border-gray-200 py-3.5 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900">User Distribution by Role</CardTitle>
                <span className="text-xs text-gray-500 font-medium">{stats?.totalUsers || 0} total</span>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {stats?.roleBreakdown && Object.entries(stats.roleBreakdown).map(([role, count]) => {
                  const pct = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
                  return (
                    <div key={role} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-700">{role}</span>
                        <span className="font-mono text-gray-600">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-[#1e2d4a] h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Platform Settings Preview */}
            <Card>
              <CardHeader className="bg-gray-50 border-b border-gray-200 py-3.5 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900">Institutional Configuration</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/settings')}
                  className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                >
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-2.5">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Academic Session:</span>
                  <span className="font-bold text-gray-900">{stats?.systemConfig?.academicYear} ({stats?.systemConfig?.currentSemester})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Default Catalog Year:</span>
                  <span className="font-bold text-gray-900">{stats?.systemConfig?.defaultCatalogYear}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">At-Risk CGPA Cutoff:</span>
                  <span className="font-bold text-amber-700 font-mono">{stats?.systemConfig?.atRiskCgpaThreshold || 5.0} CGPA</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Max Semester Credits:</span>
                  <span className="font-bold text-gray-900 font-mono">{stats?.systemConfig?.maxCreditsPerSemester || 26.0} cr</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Maintenance Mode:</span>
                  <span className={`font-bold ${stats?.systemConfig?.maintenanceMode ? 'text-amber-600' : 'text-green-600'}`}>
                    {stats?.systemConfig?.maintenanceMode ? 'Enabled' : 'Disabled (Live)'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audit Logs Trail */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="bg-[#1e2d4a] py-3.5 px-5 flex flex-row items-center justify-between text-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                    Recent System & Security Audit Events
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/logs')}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 h-7"
                >
                  <span>View All Logs</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {recentLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs">
                    No system log events recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentLogs.map((log) => (
                      <div key={log.logId} className="p-4 hover:bg-gray-50 transition-colors text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800 border">
                                {log.action}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="font-medium text-gray-700">{log.userEmail}</span>
                            </div>
                            <p className="text-gray-600 pt-0.5">{log.details}</p>
                          </div>
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm text-left transition-all group"
              >
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 mt-3 text-sm">User Management</h3>
                <p className="text-xs text-gray-500 mt-1">Create accounts, change roles, lock/unlock access</p>
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm text-left transition-all group"
              >
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Settings className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 mt-3 text-sm">System Settings</h3>
                <p className="text-xs text-gray-500 mt-1">Configure academic sessions, at-risk criteria</p>
              </button>

              <button
                onClick={() => navigate('/admin/logs')}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm text-left transition-all group"
              >
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 mt-3 text-sm">Audit Trail</h3>
                <p className="text-xs text-gray-500 mt-1">Inspect immutable security & operational actions</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
