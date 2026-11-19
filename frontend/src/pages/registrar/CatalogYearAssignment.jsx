import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import api from '../../services/api';

export default function CatalogYearAssignment() {
  const [students, setStudents] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // localYears: { [studentId]: selectedCatalogYear }
  const [localYears, setLocalYears] = useState({});
  // toast: { studentId, type: 'success'|'error', message }
  const [toasts, setToasts] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, catalogsRes] = await Promise.all([
        api.get('/registrar/students'),
        api.get('/catalogs'),
      ]);
      const studentsArr = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data?.data || []);
      const catalogsArr = Array.isArray(catalogsRes.data) ? catalogsRes.data : (catalogsRes.data?.data || []);
      setStudents(studentsArr);
      setCatalogs(catalogsArr);
      // Init local year values from student data
      const initYears = {};
      studentsArr.forEach(s => {
        initYears[s.studentId] = s.catalogYear || s.batchYear || '';
      });
      setLocalYears(initYears);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique catalog years from catalogs list (field is catalogYear, not year)
  const availableCatalogYears = [...new Set(catalogs.map(c => c.catalogYear || c.year).filter(Boolean))].sort();

  // Extract unique batch years from students
  const availableBatchYears = [...new Set(students.map(s => String(s.batchYear)).filter(Boolean))].sort();

  // Bulk assign state
  const [bulkBatchYear, setBulkBatchYear] = useState('');
  const [bulkCatalogYear, setBulkCatalogYear] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null); // { success, failed }

  const handleBulkAssign = async () => {
    if (!bulkBatchYear || !bulkCatalogYear) return;
    const targets = students.filter(s => String(s.batchYear) === bulkBatchYear);
    if (targets.length === 0) return;
    setBulkLoading(true);
    setBulkResult(null);
    let success = 0, failed = 0;
    for (const student of targets) {
      try {
        await api.put(`/registrar/students/${student.studentId}/catalog-year`, { catalogYear: bulkCatalogYear });
        success++;
      } catch {
        failed++;
      }
    }
    // Refresh student list and localYears
    const studentsRes = await api.get('/registrar/students');
    const studentsArr = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data?.data || []);
    setStudents(studentsArr);
    const newYears = {};
    studentsArr.forEach(s => { newYears[s.studentId] = s.catalogYear || s.batchYear || ''; });
    setLocalYears(newYears);
    setBulkResult({ success, failed });
    setBulkLoading(false);
  };

  const handleSave = async (student) => {
    const catalogYear = localYears[student.studentId];
    try {
      await api.put(`/registrar/students/${student.studentId}/catalog-year`, { catalogYear });
      // Update local students list
      setStudents(prev =>
        prev.map(s => s.studentId === student.studentId ? { ...s, catalogYear } : s)
      );
      showToast(student.studentId, 'success', `Catalog year updated to ${catalogYear}`);
    } catch (err) {
      showToast(student.studentId, 'error', err.response?.data?.message || 'Failed to update catalog year');
    }
  };

  const showToast = (studentId, type, message) => {
    setToasts(prev => ({ ...prev, [studentId]: { type, message } }));
    setTimeout(() => {
      setToasts(prev => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    }, 3000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catalog Year Assignment</h1>
          <p className="text-gray-600 mt-1">Assign or override the catalog year for each student</p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Custom override (catalog year differs from batch year)</span>
          </div>
        </div>

        {/* Bulk Assign Panel */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4">
            <CardTitle className="text-base">Bulk Assign by Batch Year</CardTitle>
            <p className="text-sm text-gray-500 mt-0.5">Assign the same catalog year to all students of a given batch at once</p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Batch Year (students to update)</label>
                <select
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                  value={bulkBatchYear}
                  onChange={e => setBulkBatchYear(e.target.value)}
                >
                  <option value="">— Select batch —</option>
                  {availableBatchYears.map(y => (
                    <option key={y} value={y}>
                      Batch {y} ({students.filter(s => String(s.batchYear) === y).length} students)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assign Catalog Year</label>
                <select
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                  value={bulkCatalogYear}
                  onChange={e => setBulkCatalogYear(e.target.value)}
                >
                  <option value="">— Select catalog year —</option>
                  {availableCatalogYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <Button
                  onClick={handleBulkAssign}
                  disabled={!bulkBatchYear || !bulkCatalogYear || bulkLoading}
                  className="bg-[#1e2d4a] hover:bg-[#2a3f6b] text-white text-sm px-5 py-2"
                >
                  {bulkLoading
                    ? 'Assigning...'
                    : bulkBatchYear
                      ? `Assign All Batch ${bulkBatchYear} → Catalog ${bulkCatalogYear || '?'}`
                      : 'Assign All'}
                </Button>
              </div>
            </div>
            {bulkResult && (
              <div className={`mt-3 px-3 py-2 rounded text-sm font-medium border ${bulkResult.failed === 0 ? 'bg-green-50 text-green-800 border-green-300' : 'bg-yellow-50 text-yellow-800 border-yellow-300'}`}>
                {bulkResult.failed === 0
                  ? `✓ All ${bulkResult.success} students in Batch ${bulkBatchYear} updated to catalog year ${bulkCatalogYear}`
                  : `Updated ${bulkResult.success} students. ${bulkResult.failed} failed — check individual rows.`}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg">Students</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{students.length} student(s) found</p>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="bg-gray-800 px-4 py-3 grid grid-cols-5 gap-4 text-xs font-medium text-white uppercase">
              <div>Student ID</div>
              <div>Name</div>
              <div>Department</div>
              <div>Batch Year</div>
              <div>Catalog Year</div>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No students found.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {students.map((student, idx) => {
                  const currentCatalogYear = localYears[student.studentId] || '';
                  const isOverride = currentCatalogYear && String(currentCatalogYear) !== String(student.batchYear);
                  const rowBg = isOverride ? 'bg-yellow-50 hover:bg-yellow-100' : (idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100');
                  const toast = toasts[student.studentId];

                  return (
                    <div key={student.studentId} className={`${rowBg} transition-colors`}>
                      <div className="px-4 py-3 grid grid-cols-5 gap-4 items-center">
                        <div className="font-mono text-sm text-gray-900">{student.studentId}</div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-700">{student.department}</div>
                        <div className="text-sm text-gray-700">{student.batchYear}</div>
                        <div className="flex items-center space-x-2">
                          <select
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={currentCatalogYear}
                            onChange={e => setLocalYears(prev => ({ ...prev, [student.studentId]: e.target.value }))}
                          >
                            {availableCatalogYears.length === 0 && (
                              <option value="">No catalogs available</option>
                            )}
                            {availableCatalogYears.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleSave(student)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                      {/* Toast */}
                      {toast && (
                        <div className={`mx-4 mb-2 px-3 py-1.5 rounded text-xs font-medium ${
                          toast.type === 'success'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {toast.message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
