import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ShieldCheck, Plus, Clock, CheckCircle, XCircle, AlertCircle, Send, GraduationCap, ArrowRight } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'CourseWaiver', label: 'Course Waiver (e.g., medical waiver of a core course)' },
  { value: 'CreditSubstitution', label: 'Credit Substitution (e.g., MOOC, NPTEL, exchange credits)' },
  { value: 'GradeException', label: 'Grade Exception (e.g., policy appeal, prerequisite waiver)' },
  { value: 'Other', label: 'Other Academic Policy Exception' }
];

const TYPE_LABELS = {
  CourseWaiver: 'Course Waiver',
  CreditSubstitution: 'Credit Substitution',
  GradeException: 'Grade Exception',
  Other: 'Other Exception'
};

export default function StudentExceptions() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    requestType: 'CourseWaiver',
    courseCode: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (user?.studentId) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await studentService.getExceptions(user.studentId);
      setRequests(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exception requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!form.description.trim()) {
      setErrorMessage('Please provide a detailed description and reason for your request.');
      return;
    }

    try {
      setSubmitting(true);
      await studentService.submitException(user.studentId, {
        requestType: form.requestType,
        courseCode: form.courseCode.trim() || undefined,
        description: form.description.trim()
      });

      setSuccessMessage('Your exception request has been submitted to the Dean of Academic Affairs for review.');
      setForm({
        requestType: 'CourseWaiver',
        courseCode: '',
        description: ''
      });

      await loadRequests();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit exception request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic Exception Requests</h1>
            <p className="text-gray-600 mt-1">
              Submit and track formal appeals to the Dean of Academic Affairs
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-blue-50 text-blue-800 border border-blue-200 px-3 py-2 rounded-lg">
            <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span>Approved waivers are dynamically applied to your official Degree Audit</span>
          </div>
        </div>

        {/* Submit New Request Card */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Submit New Request to Dean</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">
              Request a course waiver, credit substitution, or academic exception
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Request Type *
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={form.requestType}
                    onChange={(e) => setForm(prev => ({ ...prev, requestType: e.target.value }))}
                  >
                    {TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Course Code (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="e.g. MA101, CS102"
                    value={form.courseCode}
                    onChange={(e) => setForm(prev => ({ ...prev, courseCode: e.target.value }))}
                  />
                  <span className="text-xs text-gray-500 mt-1 block">Specify the course code if this is a waiver or course substitution</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Reason & Supporting Explanation *
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detail the circumstances justifying an exception (e.g., medical certificates, NPTEL course completion certificate details, exchange university transcript)..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              {successMessage && (
                <div className="bg-green-50 border border-green-300 text-green-800 text-sm px-4 py-2.5 rounded flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-50 border border-red-300 text-red-800 text-sm px-4 py-2.5 rounded flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={submitting || !form.description.trim()}
                  className="bg-[#1e2d4a] hover:bg-[#2a3f6b] text-white flex items-center space-x-2 text-sm px-6 py-2.5"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Submitting to Dean...' : 'Submit to Dean'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Requests History */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">My Submitted Requests</CardTitle>
              <p className="text-sm text-gray-600 mt-0.5">
                Status of requests submitted to Dean of Academic Affairs
              </p>
            </div>
            <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
              {requests.length} total
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span>Loading exception requests...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">{error}</div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShieldCheck className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">No exception requests submitted yet.</p>
                <p className="text-xs text-gray-500 mt-1">If you need a waiver or substitution, use the form above to submit an appeal to the Dean.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {requests.map((req) => {
                  const isApproved = req.status === 'Approved';
                  const isRejected = req.status === 'Rejected';
                  const isPending = req.status === 'Pending';

                  return (
                    <div key={req.requestId} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                              {TYPE_LABELS[req.requestType] || req.requestType}
                            </span>
                            {req.courseCode && (
                              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-gray-100 text-gray-800 border border-gray-300">
                                {req.courseCode}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              Submitted {new Date(req.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <p className="text-sm text-gray-800 font-medium pt-1">
                            {req.description}
                          </p>

                          {/* Dean's Review Notes */}
                          {(isApproved || isRejected) && (
                            <div className={`mt-3 p-3 rounded-lg text-xs ${isApproved ? 'bg-green-50 border border-green-200 text-green-900' : 'bg-red-50 border border-red-200 text-red-900'}`}>
                              <p className="font-semibold flex items-center space-x-1">
                                {isApproved ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-red-600" />}
                                <span>Dean's Decision: {req.status}</span>
                                {req.reviewDate && (
                                  <span className="font-normal text-gray-500 ml-2">
                                    on {new Date(req.reviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                )}
                              </p>
                              <p className="mt-1 pl-4.5">{req.reviewNotes || (isApproved ? 'Approved by Dean.' : 'Rejected by Dean.')}</p>
                            </div>
                          )}

                          {/* Credit Substitution Multi-Step Status */}
                          {req.requestType === 'CreditSubstitution' && isApproved && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                              <p className="font-semibold text-blue-900 mb-1 flex items-center space-x-1">
                                <GraduationCap className="h-4 w-4 text-blue-700" />
                                <span>Two-Step Credit Substitution Pipeline</span>
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                                <div className="flex items-center space-x-1.5 text-green-700 font-medium">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span>Step 1: Dean Approval (Granted)</span>
                                </div>
                                <ArrowRight className="hidden sm:inline h-3.5 w-3.5 text-gray-400" />
                                {req.transferCreditCreated || req.transferCredit ? (
                                  <div className="flex items-center space-x-1.5 text-green-700 font-medium">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span>
                                      Step 2: Admission Cell Verified & Credits Awarded ({req.transferCredit?.transferCreditId || 'Transfer Credit Applied'})
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1.5 text-amber-700 font-medium animate-pulse">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                    <span>Step 2: Forwarded to Admission Cell for Credit Recording & Course Mapping</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          {isPending && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                              <Clock className="h-3.5 w-3.5" />
                              <span>PENDING DEAN DECISION</span>
                            </span>
                          )}
                          {isApproved && req.requestType === 'CreditSubstitution' && !req.transferCreditCreated && !req.transferCredit && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              <Clock className="h-3.5 w-3.5 text-blue-600" />
                              <span>AT ADMISSION CELL</span>
                            </span>
                          )}
                          {isApproved && (req.requestType !== 'CreditSubstitution' || req.transferCreditCreated || req.transferCredit) && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>{req.requestType === 'CreditSubstitution' ? 'CREDITS AWARDED' : 'APPROVED'}</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>REJECTED</span>
                            </span>
                          )}
                        </div>
                      </div>
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
