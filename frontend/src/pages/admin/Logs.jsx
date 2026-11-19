import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminService } from '../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Search, RefreshCw, Filter, Shield, Eye, X } from 'lucide-react';

const ACTIONS = [
  'ALL',
  'USER_LOGIN',
  'USER_CREATED',
  'USER_UPDATED',
  'ROLE_CHANGE',
  'ACCOUNT_LOCKED',
  'ACCOUNT_UNLOCKED',
  'PASSWORD_RESET',
  'USER_DELETED',
  'CONFIG_UPDATE',
  'BULK_IMPORT',
  'EXCEPTION_DECISION',
  'TRANSFER_CREDIT_AWARDED',
  'CATALOG_PUBLISHED'
];

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (actionFilter !== 'ALL') params.action = actionFilter;
      const data = await adminService.getLogs(params);
      setLogs(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (l.userEmail && l.userEmail.toLowerCase().includes(s)) ||
      (l.action && l.action.toLowerCase().includes(s)) ||
      (l.details && l.details.toLowerCase().includes(s)) ||
      (l.entityType && l.entityType.toLowerCase().includes(s))
    );
  });

  const getActionBadgeColor = (action) => {
    if (action.includes('LOCKED') || action.includes('DELETED')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (action.includes('ROLE') || action.includes('PASSWORD')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (action.includes('CREATED') || action.includes('UNLOCKED') || action.includes('AWARDED')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit & System Logs</h1>
            <p className="text-gray-600 mt-1">
              Immutable chronological record of administrative actions, role assignments, and security events
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            className="flex items-center space-x-1.5 text-xs w-fit"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Logs</span>
          </Button>
        </div>

        {/* Logs Table Card */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">System Event Trail ({filteredLogs.length})</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Compliant with security audit standards and institutional governance
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
              </div>

              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ACTIONS.map(a => (
                  <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span>Loading audit trail...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">No system log entries found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1e2d4a] text-white text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Actor / Email</th>
                      <th className="px-3 py-3">Target Entity</th>
                      <th className="px-5 py-3">Details</th>
                      <th className="px-3 py-3 text-center">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-xs">
                    {filteredLogs.map((log, idx) => {
                      const rowBg = idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100';

                      return (
                        <tr key={log.logId} className={`${rowBg} transition-colors`}>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${getActionBadgeColor(log.action)}`}>
                              {log.action}
                            </span>
                          </td>

                          <td className="px-4 py-3 font-medium text-gray-800">
                            {log.userEmail}
                          </td>

                          <td className="px-3 py-3 text-gray-600 font-mono text-[11px]">
                            {log.entityType}{log.entityId ? ` (${log.entityId})` : ''}
                          </td>

                          <td className="px-5 py-3 text-gray-700 max-w-md truncate">
                            {log.details}
                          </td>

                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="text-gray-400 hover:text-blue-600 p-1 rounded"
                              title="Inspect Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
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

        {/* Log Inspector Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#1e2d4a] px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <h3 className="font-bold text-base">Audit Log Record Details</h3>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-gray-300 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-gray-500 font-semibold uppercase block">Log ID</span>
                    <span className="font-mono font-bold text-gray-900">{selectedLog.logId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold uppercase block">Timestamp</span>
                    <span className="text-gray-900">{new Date(selectedLog.timestamp).toISOString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-gray-500 font-semibold uppercase block">Actor</span>
                    <span className="font-bold text-gray-900">{selectedLog.userEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold uppercase block">Action</span>
                    <span className="font-mono font-bold text-blue-700">{selectedLog.action}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 font-semibold uppercase block mb-1">Details & Payload</span>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded font-mono text-gray-800 break-words">
                    {selectedLog.details}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedLog(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
