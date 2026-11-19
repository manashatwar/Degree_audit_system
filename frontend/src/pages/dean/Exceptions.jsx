import React, { useState, useEffect } from 'react';
import { deanService } from '../../services/deanService';
import Layout from '../../components/Layout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ShieldCheck, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const TYPE_LABELS = {
  CourseWaiver: 'Course Waiver',
  CreditSubstitution: 'Credit Substitution',
  GradeException: 'Grade Exception',
  Other: 'Other',
};

const STATUS_COLOR = {
  Pending:  'text-yellow-600 font-bold',
  Approved: 'text-green-600 font-bold',
  Rejected: 'text-red-600 font-bold',
};

export default function DeanExceptions() {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [tab, setTab]               = useState('Pending');
  const [reviewing, setReviewing]   = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      setRequests(await deanService.getExceptions());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exception requests');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDecision = async () => {
    if (!reviewing) return;
    if (reviewing.action === 'reject' && !reviewNotes.trim()) {
      showToast('Review notes are required when rejecting.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      if (reviewing.action === 'approve') {
        await deanService.approveException(reviewing.request.requestId, reviewNotes || 'Approved by Dean');
        showToast(`Approved — ${reviewing.request.student?.name}`);
      } else {
        await deanService.rejectException(reviewing.request.requestId, reviewNotes);
        showToast(`Rejected — ${reviewing.request.student?.name}`, 'error');
      }
      setReviewing(null);
      setReviewNotes('');
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const pending  = requests.filter(r => r.status === 'Pending');
  const approved = requests.filter(r => r.status === 'Approved');
  const rejected = requests.filter(r => r.status === 'Rejected');

  const tabs = [
    { label: `Incoming (${pending.length})`,  key: 'Pending' },
    { label: `Approved (${approved.length})`, key: 'Approved' },
    { label: `Rejected (${rejected.length})`, key: 'Rejected' },
  ];

  const visibleRows = requests.filter(r => r.status === tab);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exception requests...</p>
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium
            ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            {toast.msg}
          </div>
        )}

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exception Requests</h1>
          <p className="text-gray-600 mt-1">Review and approve student exception requests</p>
        </div>

        {/* Summary Card */}
        <Card className="max-w-xs">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pending.length}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting your decision</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Panel */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">

          {/* Top bar — dark navy like the reference */}
          <div className="bg-[#1e2d4a] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-white" />
              <span className="text-white font-semibold text-sm uppercase tracking-wide">
                Dean Approval Desk &nbsp;|&nbsp; Exception Requests
              </span>
            </div>
            <button
              onClick={load}
              className="flex items-center space-x-1.5 text-white text-sm hover:text-blue-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-4 pt-3 space-x-1 bg-gray-50">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium rounded-t transition-colors
                  ${tab === t.key
                    ? 'bg-[#1e2d4a] text-white'
                    : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Table */}
          {visibleRows.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1e2d4a] text-white">
                  <th className="px-4 py-3 text-left font-medium">Roll No</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Dept</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium">Submitted</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  {tab === 'Pending' && (
                    <th className="px-4 py-3 text-left font-medium">Action</th>
                  )}
                  {tab !== 'Pending' && (
                    <th className="px-4 py-3 text-left font-medium">Dean's Notes</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((req, i) => (
                  <tr
                    key={req.requestId}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                  >
                    {/* Roll No */}
                    <td className="px-4 py-3 font-mono text-gray-700">{req.studentId}</td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{req.student?.name || '—'}</p>
                    </td>

                    {/* Dept */}
                    <td className="px-4 py-3 text-gray-700">{req.student?.department || '—'}</td>

                    {/* Type */}
                    <td className="px-4 py-3 text-gray-700">{TYPE_LABELS[req.requestType] || req.requestType}</td>

                    {/* Description */}
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <p className="line-clamp-2 text-xs leading-relaxed">{req.description}</p>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(req.submittedDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>

                    {/* Status */}
                    <td className={`px-4 py-3 ${STATUS_COLOR[req.status]}`}>
                      {req.status.toUpperCase()}
                    </td>

                    {/* Action or Notes */}
                    {tab === 'Pending' ? (
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => { setReviewing({ request: req, action: 'approve' }); setReviewNotes(''); }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setReviewing({ request: req, action: 'reject' }); setReviewNotes(''); }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    ) : (
                      <td className={`px-4 py-3 text-xs max-w-xs ${req.status === 'Approved' ? 'text-green-700' : 'text-red-600'}`}>
                        <p className="line-clamp-2">{req.reviewNotes || '—'}</p>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No {tab.toLowerCase()} requests</p>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {reviewing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5">
              <div className="flex items-center space-x-3">
                {reviewing.action === 'approve'
                  ? <CheckCircle className="h-6 w-6 text-green-600" />
                  : <XCircle className="h-6 w-6 text-red-600" />}
                <h2 className="text-xl font-bold text-gray-900">
                  {reviewing.action === 'approve' ? 'Approve' : 'Reject'} Request
                </h2>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <p><span className="font-medium">Student:</span> {reviewing.request.student?.name} ({reviewing.request.studentId})</p>
                <p><span className="font-medium">Type:</span> {TYPE_LABELS[reviewing.request.requestType]}</p>
                <p className="text-gray-600 mt-1 text-xs leading-relaxed">{reviewing.request.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Notes {reviewing.action === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={4}
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder={reviewing.action === 'approve'
                    ? 'Optional — add justification or conditions...'
                    : 'Required — explain why this request is being rejected...'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex space-x-3 justify-end">
                <Button variant="outline" onClick={() => setReviewing(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDecision}
                  disabled={submitting}
                  className={reviewing.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'}
                >
                  {submitting ? 'Processing...' : (reviewing.action === 'approve' ? 'Approve' : 'Reject')}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
