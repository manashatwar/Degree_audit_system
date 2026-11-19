import React, { useState, useEffect } from 'react';
import { admissionService } from '../../services/admissionService';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  GraduationCap, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Award, 
  Check, 
  X, 
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = ['Core Courses', 'Mathematics', 'Electives', 'Humanities', 'Open Electives'];

export default function AdmissionDashboard() {
  const [stats, setStats] = useState(null);
  const [credits, setCredits] = useState([]);
  const [students, setStudents] = useState([]);
  const [deanApprovals, setDeanApprovals] = useState([]);
  const [selectedDeanApproval, setSelectedDeanApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    institutionName: '',
    externalCourseName: '',
    externalGrade: 'A',
    credits: '4.0',
    mappedCourseCode: 'CS402',
    mappedCategory: 'Electives',
    status: 'Approved',
    remarks: '',
    exceptionRequestId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, creditsData, studentsData, approvalsData] = await Promise.all([
        admissionService.getStats(),
        admissionService.getCredits(),
        admissionService.getStudents().catch(() => []),
        admissionService.getDeanApprovals().catch(() => [])
      ]);

      setStats(statsData);
      setCredits(creditsData || []);
      const stdList = Array.isArray(studentsData) ? studentsData : (studentsData?.data || []);
      setStudents(stdList);
      setDeanApprovals(approvalsData || []);
      if (stdList.length > 0 && !form.studentId) {
        setForm(prev => ({ ...prev, studentId: stdList[0].studentId }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transfer credit data');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleProcessDeanApproval = (item) => {
    setSelectedDeanApproval(item);
    setForm({
      studentId: item.studentId,
      institutionName: 'NPTEL / External Partner University',
      externalCourseName: item.courseCode ? `Course equivalent for ${item.courseCode}` : 'Approved External Course',
      externalGrade: 'A',
      credits: '4.0',
      mappedCourseCode: item.courseCode || 'CS402',
      mappedCategory: 'Electives',
      status: 'Approved',
      remarks: `Authorized by Dean of Academic Affairs: ${item.reviewNotes || 'Approved substitution'}`,
      exceptionRequestId: item.requestId
    });
    setShowAddForm(true);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.institutionName || !form.externalCourseName) {
      showToast('Please fill in Student ID, Institution, and External Course Name', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await admissionService.recordCredit({
        ...form,
        credits: Number(form.credits) || 4.0
      });
      showToast('Transfer credit recorded and degree audit updated successfully!');
      setShowAddForm(false);
      setSelectedDeanApproval(null);
      setForm(prev => ({
        ...prev,
        institutionName: '',
        externalCourseName: '',
        remarks: '',
        exceptionRequestId: ''
      }));
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record transfer credit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await admissionService.updateCreditStatus(id, { status });
      showToast(`Transfer credit marked as ${status}`);
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transfer credit record?')) return;
    try {
      await admissionService.deleteCredit(id);
      showToast('Record deleted successfully');
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete record', 'error');
    }
  };

  // Filter credits
  const filteredCredits = credits.filter(c => {
    const matchesTab = activeTab === 'All' ? true : c.status === activeTab;
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
      (c.studentId && c.studentId.toLowerCase().includes(term)) ||
      (c.studentName && c.studentName.toLowerCase().includes(term)) ||
      (c.institutionName && c.institutionName.toLowerCase().includes(term)) ||
      (c.externalCourseName && c.externalCourseName.toLowerCase().includes(term)) ||
      (c.mappedCourseCode && c.mappedCourseCode.toLowerCase().includes(term));
    return matchesTab && matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admission Cell — Transfer Credits</h1>
            <p className="text-gray-600 mt-1">
              Record external coursework, map degree equivalencies, and evaluate lateral transfer credits
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="flex items-center space-x-1 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => setShowAddForm(prev => !prev)}
              className="bg-[#1e2d4a] hover:bg-[#2a3f6b] text-white flex items-center space-x-1.5 text-sm px-4 py-2"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddForm ? 'Close Form' : 'Record Transfer Credit'}</span>
            </Button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`p-4 rounded-lg text-sm font-medium border flex items-center space-x-2 ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-300 text-green-900' 
              : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalApplications || 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">Recorded transfer credits</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <GraduationCap className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats?.pendingCount || 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">Awaiting equivalence approval</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Awarded</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats?.totalCreditsAwarded || 0} cr</p>
                <p className="text-xs text-gray-500 mt-0.5">{stats?.approvedCount || 0} approved courses</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full text-green-600">
                <Award className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">External Institutions</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats?.institutionsCount || 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">Partner universities & MOOCs</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                <Building2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dean-Approved Substitutions Queue */}
        <Card className="border-blue-300 shadow-sm">
          <CardHeader className="bg-[#1e2d4a] py-3.5 px-5 flex flex-row items-center justify-between text-white rounded-t-lg">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              <div>
                <CardTitle className="text-base text-white font-bold">
                  Dean-Approved Credit Substitutions
                </CardTitle>
                <p className="text-xs text-blue-200 mt-0.5">
                  Action Required: Requests approved by Dean of Academic Affairs awaiting Admission Cell course mapping & transfer credit award
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500 text-white">
              {deanApprovals.filter(d => !d.isProcessed).length} Awaiting Transfer Credit
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {deanApprovals.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No Dean-approved substitution requests at this time.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Target LNMIIT Course</th>
                      <th className="px-4 py-3">Student's Request</th>
                      <th className="px-4 py-3">Dean's Approval & Notes</th>
                      <th className="px-3 py-3 text-center">Pipeline Status</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {deanApprovals.map((item) => (
                      <tr key={item.requestId} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900 font-mono">{item.studentId}</p>
                          <p className="text-gray-600">{item.studentName}</p>
                          {item.department && (
                            <span className="text-[10px] text-gray-400">{item.department} Batch {item.batchYear}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.courseCode ? (
                            <span className="font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                              {item.courseCode}
                            </span>
                          ) : (
                            <span className="text-gray-500 italic">Elective Substitution</span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-gray-800 line-clamp-2">{item.description}</p>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="bg-green-50 border border-green-200 rounded p-1.5 text-green-900">
                            <p className="font-bold text-[11px] flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>Approved by Dean</span>
                            </p>
                            <p className="text-[11px] text-green-800 italic mt-0.5">{item.reviewNotes || 'Approved'}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {item.isProcessed ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">
                              <CheckCircle className="h-3 w-3" />
                              <span>Credits Awarded</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              <Clock className="h-3 w-3" />
                              <span>Awaiting Admission Action</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.isProcessed ? (
                            <span className="text-xs text-gray-400 italic font-medium">Completed</span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleProcessDeanApproval(item)}
                              className="bg-[#1e2d4a] hover:bg-blue-800 text-white text-xs h-8 px-3 flex items-center space-x-1.5 shadow-sm"
                            >
                              <span>Process & Award</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Record Transfer Credit Form (Collapsible) */}
        {showAddForm && (
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b border-blue-200 py-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-blue-700" />
                <CardTitle className="text-base text-blue-900">
                  {selectedDeanApproval ? 'Process Dean-Approved Transfer Credit' : 'Record New Transfer Credit'}
                </CardTitle>
              </div>
              <p className="text-xs text-blue-700 mt-0.5">
                Record external transcripts from exchange programs, NPTEL, or lateral transfer institutes
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {selectedDeanApproval && (
                <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-900 uppercase">Processing Dean-Approved Exception</p>
                    <p className="text-xs text-amber-800">
                      Student: <strong>{selectedDeanApproval.studentName} ({selectedDeanApproval.studentId})</strong> — Target: <strong>{selectedDeanApproval.courseCode || 'Elective'}</strong>
                    </p>
                    <p className="text-xs text-amber-700 italic mt-0.5">Dean's Note: "{selectedDeanApproval.reviewNotes}"</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedDeanApproval(null);
                      setForm(prev => ({ ...prev, exceptionRequestId: '', remarks: '' }));
                    }}
                    className="text-xs text-amber-800 border-amber-300 hover:bg-amber-100"
                  >
                    Clear Link
                  </Button>
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Student (Roll No) *
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={form.studentId}
                      onChange={e => setForm(prev => ({ ...prev, studentId: e.target.value }))}
                      required
                    >
                      <option value="">-- Select Student ({students.length} found) --</option>
                      {students.map(s => (
                        <option key={s.studentId} value={s.studentId}>
                          {s.studentId} — {s.name} ({s.department} Batch {s.batchYear})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      External Institution Name *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. TU Munich, Germany or NPTEL IIT Madras"
                      value={form.institutionName}
                      onChange={e => setForm(prev => ({ ...prev, institutionName: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      External Course Title *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Cloud Computing Architecture"
                      value={form.externalCourseName}
                      onChange={e => setForm(prev => ({ ...prev, externalCourseName: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      External Grade / Score
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. A or 88% or Elite"
                      value={form.externalGrade}
                      onChange={e => setForm(prev => ({ ...prev, externalGrade: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Credits Granted *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4.0"
                      value={form.credits}
                      onChange={e => setForm(prev => ({ ...prev, credits: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Mapped LNMIIT Course Code
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                      placeholder="e.g. CS402, CS202, OE101"
                      value={form.mappedCourseCode}
                      onChange={e => setForm(prev => ({ ...prev, mappedCourseCode: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Requirement Category
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={form.mappedCategory}
                      onChange={e => setForm(prev => ({ ...prev, mappedCategory: e.target.value }))}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Evaluation Status
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={form.status}
                      onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="Approved">Approved (Apply to Audit Immediately)</option>
                      <option value="Pending">Pending Review</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Verification Remarks / Certificate Details
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Verified against official NPTEL certificate ID or exchange university transcript"
                      value={form.remarks}
                      onChange={e => setForm(prev => ({ ...prev, remarks: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#1e2d4a] hover:bg-[#2a3f6b] text-white text-sm px-5"
                  >
                    {submitting ? 'Recording...' : 'Record & Map Course'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transfer Credits Table */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Transfer Credit Evaluations</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                Official records of transfer, lateral entry, and exchange credits
              </p>
            </div>

            {/* Search and Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student, course, institution..."
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex bg-gray-200 p-0.5 rounded text-xs">
                {['All', 'Pending', 'Approved', 'Rejected'].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-1 rounded font-medium transition-colors ${
                      activeTab === t 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span>Loading transfer credits...</span>
              </div>
            ) : filteredCredits.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <GraduationCap className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">No transfer credits found.</p>
                <p className="text-xs text-gray-500 mt-1">Use "Record Transfer Credit" above to log credits for lateral entry or exchange students.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1e2d4a] text-white text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">External Course & Institution</th>
                      <th className="px-3 py-3 text-center">Ext. Grade</th>
                      <th className="px-3 py-3 text-center">Credits</th>
                      <th className="px-4 py-3">Mapped LNMIIT Req</th>
                      <th className="px-3 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-xs">
                    {filteredCredits.map((c, idx) => {
                      const isPending = c.status === 'Pending';
                      const isApproved = c.status === 'Approved';
                      const isRejected = c.status === 'Rejected';
                      const rowBg = idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100';

                      return (
                        <tr key={c.transferCreditId} className={`${rowBg} transition-colors`}>
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-gray-900 font-mono">{c.studentId}</p>
                            <p className="text-gray-600 text-xs">{c.studentName}</p>
                            {c.department && (
                              <span className="text-[10px] text-gray-400">{c.department} • Batch {c.batchYear}</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 max-w-xs">
                            <p className="font-semibold text-gray-900">{c.externalCourseName}</p>
                            <p className="text-gray-500 text-xs flex items-center space-x-1 mt-0.5">
                              <Building2 className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{c.institutionName}</span>
                            </p>
                            {c.remarks && (
                              <p className="text-[11px] text-gray-400 italic mt-0.5">Note: {c.remarks}</p>
                            )}
                          </td>

                          <td className="px-3 py-3.5 text-center font-bold text-gray-800">
                            {c.externalGrade || '—'}
                          </td>

                          <td className="px-3 py-3.5 text-center font-bold text-blue-700">
                            {Number(c.credits).toFixed(1)}
                          </td>

                          <td className="px-4 py-3.5">
                            {c.mappedCourseCode ? (
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-900 rounded border border-blue-200">
                                  {c.mappedCourseCode}
                                </span>
                                <span className="text-xs text-gray-500">({c.mappedCategory})</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">{c.mappedCategory}</span>
                            )}
                          </td>

                          <td className="px-3 py-3.5 text-center">
                            {isPending && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                <Clock className="h-3 w-3" />
                                <span>PENDING</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                                <CheckCircle className="h-3 w-3" />
                                <span>APPROVED</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                                <XCircle className="h-3 w-3" />
                                <span>REJECTED</span>
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              {isPending && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStatus(c.transferCreditId, 'Approved')}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-2.5 flex items-center space-x-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span>Approve</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(c.transferCreditId, 'Rejected')}
                                    className="text-red-600 hover:bg-red-50 border-red-200 text-xs h-7 px-2 flex items-center space-x-1"
                                  >
                                    <X className="h-3 w-3" />
                                    <span>Reject</span>
                                  </Button>
                                </>
                              )}
                              {isApproved && (
                                <span className="text-[11px] text-green-700 font-medium">Applied to Audit</span>
                              )}
                              <button
                                onClick={() => handleDelete(c.transferCreditId)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors ml-1"
                                title="Delete Record"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
      </div>
    </Layout>
  );
}
