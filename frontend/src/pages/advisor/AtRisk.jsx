import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { advisorService } from '../../services/advisorService';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AlertTriangle, Eye, Users, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdvisorAtRisk() {
  const { user } = useAuth();
  const [atRiskData, setAtRiskData] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentAudits, setStudentAudits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(null);

  useEffect(() => {
    loadAtRiskStudents();
  }, []);

  const loadAtRiskStudents = async () => {
    try {
      setLoading(true);
      console.log('Loading at-risk students for advisor:', user.advisorId);
      const data = await advisorService.getAtRiskStudents(user.advisorId);
      console.log('At-risk data received:', data);
      setAtRiskData(data);
    } catch (err) {
      console.error('Error loading at-risk students:', err);
      setError(err.response?.data?.message || 'Failed to load at-risk students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAudit = async (student) => {
    // If clicking the same student, collapse it
    if (expandedStudent?.studentId === student.studentId) {
      setExpandedStudent(null);
      return;
    }

    // If audit already loaded, just expand it
    if (studentAudits[student.studentId]) {
      setExpandedStudent(student);
      return;
    }

    // Load audit for the first time
    try {
      setLoadingAudit(student.studentId);
      const audit = await advisorService.getStudentAudit(user.advisorId, student.student.studentId);
      setStudentAudits(prev => ({
        ...prev,
        [student.studentId]: audit
      }));
      setExpandedStudent(student);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load student audit');
    } finally {
      setLoadingAudit(null);
    }
  };

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-700 border border-red-300';
      case 'Medium':
        return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'Low':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getGradePoint = (grade) => {
    if (typeof grade === 'number') return grade;
    const gradeMap = {
      'A': 10, 'AB': 9, 'B': 8, 'BC': 7,
      'C': 6, 'CD': 5, 'D': 4, 'F': 0
    };
    return gradeMap[String(grade).toUpperCase()] || 0;
  };

  const isPassed = (grade) => getGradePoint(grade) >= 4;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading at-risk students...</p>
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
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">At-Risk Students</h1>
          <p className="text-gray-600 mt-1">Monitor and support students requiring academic attention</p>
        </div>

        {/* Summary Card */}
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At-Risk Students</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{atRiskData.atRiskCount}</p>
                <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* At-Risk Student Table */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg">At-Risk Student List</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {atRiskData.atRiskCount > 0
                ? `${atRiskData.atRiskCount} students requiring academic support`
                : 'All advisees are performing well'}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {atRiskData.atRiskCount > 0 ? (
              <div className="divide-y divide-gray-200">
                {atRiskData.students.map((student) => {
                  const isExpanded = expandedStudent?.studentId === student.studentId;
                  const auditData = studentAudits[student.studentId];
                  const isLoadingThisAudit = loadingAudit === student.studentId;

                  return (
                    <div key={student.studentId}>
                      {/* Student Row */}
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          {/* Student Info */}
                          <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                            <div>
                              <p className="font-semibold text-gray-900">{student.student.name}</p>
                              <p className="text-sm text-gray-600">{student.student.studentId}</p>
                            </div>

                            <div className="text-center">
                              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getRiskBadgeClass(student.riskLevel)}`}>
                                {student.riskLevel}
                              </span>
                            </div>

                            <div className="text-center">
                              <p className="text-xs text-gray-500 uppercase">CGPA</p>
                              <p className={`text-base font-bold mt-0.5 ${student.audit.CGPA < 6.0 ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                {student.audit.CGPA}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-xs text-gray-500 uppercase">Credits</p>
                              <p className="text-base font-bold text-gray-900 mt-0.5">
                                {student.audit.totalCreditsEarned}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Risk Factors</p>
                              <div className="space-y-1">
                                {student.riskIndicators.slice(0, 2).map((indicator, idx) => (
                                  <p key={idx} className="text-xs text-red-600">• {indicator}</p>
                                ))}
                                {student.riskIndicators.length > 2 && (
                                  <p className="text-xs text-gray-500">+{student.riskIndicators.length - 2} more</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* View Audit Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAudit(student)}
                            disabled={isLoadingThisAudit}
                            className="ml-4 flex items-center space-x-1"
                          >
                            {isLoadingThisAudit ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                <span>View Audit</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Audit Details */}
                      {isExpanded && auditData && (
                        <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-6">
                          {(() => {
                            const audit = auditData.audit;
                            const studentInfo = auditData.student;
                            const progressPercentage = audit.totalCreditsRequired > 0
                              ? Math.round((audit.totalCreditsEarned / audit.totalCreditsRequired) * 100)
                              : 0;

                            return (
                              <>
                                {/* Student Information */}
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                  <h3 className="text-sm font-bold text-gray-800 uppercase mb-4">Student Information</h3>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase">Program</p>
                                      <p className="text-sm font-semibold text-gray-900 mt-1">{audit.program || studentInfo.program}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase">Department</p>
                                      <p className="text-sm font-semibold text-gray-900 mt-1">{audit.department || studentInfo.department || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase">Batch Year</p>
                                      <p className="text-sm font-semibold text-gray-900 mt-1">{audit.batchYear || studentInfo.batchYear || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase">Current Semester</p>
                                      <p className="text-sm font-semibold text-gray-900 mt-1">{audit.currentSemester || studentInfo.currentSemester}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Credit Summary */}
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                  <h3 className="text-sm font-bold text-gray-800 uppercase mb-4">Credit Summary</h3>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase">Earned</p>
                                      <p className="text-2xl font-bold text-green-600 mt-1">{audit.totalCreditsEarned}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase">Required</p>
                                      <p className="text-2xl font-bold text-gray-900 mt-1">{audit.totalCreditsRequired}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase">Remaining</p>
                                      <p className="text-2xl font-bold text-orange-600 mt-1">
                                        {Math.max(0, audit.totalCreditsRequired - audit.totalCreditsEarned)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase">Progress</p>
                                      <p className="text-2xl font-bold text-blue-600 mt-1">{progressPercentage}%</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Risk Indicators */}
                                <div className="bg-white border border-red-200 rounded-lg p-5">
                                  <h3 className="text-sm font-bold text-red-800 uppercase mb-3">Risk Indicators</h3>
                                  <div className="space-y-2">
                                    {student.riskIndicators.map((indicator, index) => (
                                      <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 rounded">
                                        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-red-900">{indicator}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Completed Courses Table */}
                                {audit.completedCourses && audit.completedCourses.length > 0 && (
                                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-800 px-5 py-3">
                                      <h3 className="text-sm font-bold text-white uppercase">Completed Courses</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs">
                                        <thead className="bg-gray-700 text-white">
                                          <tr>
                                            <th className="px-3 py-2 text-left font-medium uppercase">Course Code</th>
                                            <th className="px-3 py-2 text-left font-medium uppercase">Course Name</th>
                                            <th className="px-3 py-2 text-left font-medium uppercase">Semester</th>
                                            <th className="px-3 py-2 text-center font-medium uppercase">Credits</th>
                                            <th className="px-3 py-2 text-center font-medium uppercase">Grade</th>
                                            <th className="px-3 py-2 text-left font-medium uppercase">Type</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {audit.completedCourses.map((course, index) => {
                                            const passed = isPassed(course.grade);
                                            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                                            return (
                                              <tr key={index} className={`${rowBg} border-b border-gray-100`}>
                                                <td className="px-3 py-2.5 font-mono">{course.courseCode}</td>
                                                <td className="px-3 py-2.5">{course.courseName}</td>
                                                <td className="px-3 py-2.5">{course.semester}</td>
                                                <td className="px-3 py-2.5 text-center">{course.credits?.toFixed(1) || 'N/A'}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                  <span className={`font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                                    {String(course.grade).toUpperCase()}
                                                  </span>
                                                </td>
                                                <td className="px-3 py-2.5">{course.courseType}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Failed Courses (if any) */}
                                {audit.completedCourses &&
                                  audit.completedCourses.filter((course) => !isPassed(course.grade)).length > 0 && (
                                    <div className="bg-white border border-red-200 rounded-lg overflow-hidden">
                                      <div className="bg-red-600 px-5 py-3">
                                        <h3 className="text-sm font-bold text-white uppercase">Failed Courses</h3>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                          <thead className="bg-red-500 text-white">
                                            <tr>
                                              <th className="px-3 py-2 text-left font-medium uppercase">Course Code</th>
                                              <th className="px-3 py-2 text-left font-medium uppercase">Course Name</th>
                                              <th className="px-3 py-2 text-left font-medium uppercase">Semester</th>
                                              <th className="px-3 py-2 text-center font-medium uppercase">Credits</th>
                                              <th className="px-3 py-2 text-center font-medium uppercase">Grade</th>
                                              <th className="px-3 py-2 text-left font-medium uppercase">Type</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {audit.completedCourses
                                              .filter((course) => !isPassed(course.grade))
                                              .map((course, index) => {
                                                const rowBg = index % 2 === 0 ? 'bg-red-50' : 'bg-white';
                                                return (
                                                  <tr key={index} className={`${rowBg} border-b border-red-100`}>
                                                    <td className="px-3 py-2.5 font-mono">{course.courseCode}</td>
                                                    <td className="px-3 py-2.5">{course.courseName}</td>
                                                    <td className="px-3 py-2.5">{course.semester}</td>
                                                    <td className="px-3 py-2.5 text-center">{course.credits?.toFixed(1) || 'N/A'}</td>
                                                    <td className="px-3 py-2.5 text-center">
                                                      <span className="font-bold text-red-600">{String(course.grade).toUpperCase()}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5">{course.courseType}</td>
                                                  </tr>
                                                );
                                              })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Students On Track</h3>
                <p className="text-gray-600">No students currently meet at-risk criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
