import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminService } from '../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Settings, Save, AlertTriangle, CheckCircle, RefreshCw, Shield } from 'lucide-react';

export default function AdminSettings() {
  const [config, setConfig] = useState({
    academicYear: '2026-27',
    currentSemester: 'Odd Semester (2026)',
    defaultCatalogYear: '2024',
    atRiskCgpaThreshold: 5.0,
    maxCreditsPerSemester: 26.0,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await adminService.getConfig();
      if (data) {
        setConfig({
          academicYear: data.academicYear || '2026-27',
          currentSemester: data.currentSemester || 'Odd Semester (2026)',
          defaultCatalogYear: data.defaultCatalogYear || '2024',
          atRiskCgpaThreshold: data.atRiskCgpaThreshold !== undefined ? data.atRiskCgpaThreshold : 5.0,
          maxCreditsPerSemester: data.maxCreditsPerSemester !== undefined ? data.maxCreditsPerSemester : 26.0,
          maintenanceMode: Boolean(data.maintenanceMode)
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updateConfig({
        ...config,
        atRiskCgpaThreshold: Number(config.atRiskCgpaThreshold),
        maxCreditsPerSemester: Number(config.maxCreditsPerSemester)
      });
      showToast('System configuration updated and logged successfully!');
      await loadConfig();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update system configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
            <p className="text-gray-600 mt-1">
              Configure institution-wide academic session parameters, risk thresholds, and maintenance status
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadConfig}
            className="flex items-center space-x-1.5 text-xs w-fit"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`p-4 rounded-lg text-sm font-medium border flex items-center space-x-2 ${
            toast.type === 'success' ? 'bg-green-50 border-green-300 text-green-900' : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>{toast.message}</span>
          </div>
        )}

        <Card>
          <CardHeader className="bg-[#1e2d4a] text-white py-4 px-6 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-base text-white">Institutional Parameters</CardTitle>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Parameters apply dynamically across degree audits, advisor evaluations, and student portals
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span>Loading configuration...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="2026-27"
                      value={config.academicYear}
                      onChange={e => setConfig(prev => ({ ...prev, academicYear: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Current operational academic cycle</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Current Semester Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Odd Semester (2026)"
                      value={config.currentSemester}
                      onChange={e => setConfig(prev => ({ ...prev, currentSemester: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Displayed in student audit reports & dashboards</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Default Catalog Year *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="2024"
                      value={config.defaultCatalogYear}
                      onChange={e => setConfig(prev => ({ ...prev, defaultCatalogYear: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Default catalog assignment for incoming students</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      At-Risk CGPA Threshold *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      value={config.atRiskCgpaThreshold}
                      onChange={e => setConfig(prev => ({ ...prev, atRiskCgpaThreshold: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Students below this CGPA are flagged in Faculty Advisor dashboards</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Max Credits Per Semester *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="10"
                      max="40"
                      required
                      value={config.maxCreditsPerSemester}
                      onChange={e => setConfig(prev => ({ ...prev, maxCreditsPerSemester: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Upper limit for standard course registrations</p>
                  </div>

                  {/* Maintenance Mode Toggle */}
                  <div className="flex flex-col justify-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900 uppercase">System Maintenance Mode</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Restrict student audits during end-semester grade processing</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.maintenanceMode}
                        onChange={e => setConfig(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>All configuration changes are recorded in the immutable administrative audit log with timestamps.</span>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#1e2d4a] hover:bg-[#2a3f6b] text-white flex items-center space-x-2 text-sm px-6 py-2.5"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
