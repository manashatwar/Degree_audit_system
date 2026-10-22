import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import Layout from '../../components/Layout';

export default function StudentAudit() {
  const { user } = useAuth();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAudit();

    // Add print styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        /* Hide navigation and layout elements */
        nav, header, .print\\:hidden {
          display: none !important;
        }
        
        /* Remove background colors for printing */
        body {
          background: white !important;
        }
        
        /* Ensure proper page layout */
        .min-h-screen {
          min-height: auto !important;
        }
        
        /* Remove padding for print */
        .print\\:p-0 {
          padding: 0 !important;
        }
        
        /* Page breaks */
        .page-break-before {
          page-break-before: always;
        }
        
        .page-break-after {
          page-break-after: always;
        }
        
        .avoid-break {
          page-break-inside: avoid;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const loadAudit = async () => {
    try {
      setLoading(true);
      const auditData = await studentService.getAudit(user.studentId);
      console.log('Audit Data Received:', auditData);
      console.log('Program:', auditData.program);
      console.log('Department:', auditData.department);
      console.log('Batch Year:', auditData.batchYear);
      setAudit(auditData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const getGradePoint = (grade) => {
    if (typeof grade === 'number') return grade;
    const gradeMap = {
      'A': 10, 'AB': 9, 'B': 8, 'BC': 7,
      'C': 6, 'CD': 5, 'D': 4, 'F': 0
    };
    return gradeMap[grade?.toUpperCase()] || 0;
  };

  const isPassed = (grade) => getGradePoint(grade) >= 4;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading audit report...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6 print:p-2 print:bg-white">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 avoid-break">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Degree Audit Report</h1>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Student Name</p>
                <p className="font-semibold text-gray-900">{audit.studentName}</p>
              </div>
              <div>
                <p className="text-gray-600">Student ID</p>
                <p className="font-semibold text-gray-900">{audit.studentId}</p>
              </div>
              <div>
                <p className="text-gray-600">Program</p>
                <p className="font-semibold text-gray-900">{audit?.program || 'Not Available'}</p>
              </div>
              <div>
                <p className="text-gray-600">Department</p>
                <p className="font-semibold text-gray-900">{audit?.department || 'Not Available'}</p>
              </div>
              <div>
                <p className="text-gray-600">Batch Year</p>
                <p className="font-semibold text-gray-900">{audit?.batchYear || 'Not Available'}</p>
              </div>
              <div>
                <p className="text-gray-600">CGPA</p>
                <p className="font-semibold text-blue-600 text-xl">{audit.CGPA}</p>
              </div>
            </div>
          </div>

          {/* Graduation Eligibility Banner */}
          {audit.graduationEligible ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6 avoid-break">
              <div className="flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h2 className="text-2xl font-bold text-green-800 mb-1">ELIGIBLE TO GRADUATE</h2>
                  <p className="text-green-700">
                    Congratulations! You have met all degree requirements.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-green-700">Credits Earned</p>
                  <p className="text-xl font-bold text-green-800">{audit.totalCreditsEarned} / 160</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">CGPA</p>
                  <p className="text-xl font-bold text-green-800">{audit.CGPA} / 6.0</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-6 mb-6 avoid-break">
              <div className="flex items-start">
                <svg className="w-12 h-12 text-orange-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-orange-800 mb-2">NOT YET ELIGIBLE TO GRADUATE</h2>
                  <p className="text-orange-700 mb-4">
                    You need to fulfill the following requirements to be eligible for graduation:
                  </p>
                  <div className="space-y-3">
                    {audit.totalCreditsEarned < 160 && (
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">Credit Requirement</p>
                            <p className="text-sm text-gray-600">
                              Complete <span className="font-bold text-orange-600">{160 - audit.totalCreditsEarned}</span> more credits
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-600">{audit.totalCreditsEarned}</p>
                            <p className="text-sm text-gray-500">of 160 credits</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {audit.CGPA < 6.0 && (
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">CGPA Requirement</p>
                            <p className="text-sm text-gray-600">
                              Improve CGPA by <span className="font-bold text-orange-600">{(6.0 - audit.CGPA).toFixed(2)}</span> points
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-600">{audit.CGPA}</p>
                            <p className="text-sm text-gray-500">minimum 6.0</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credits Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Credit Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Credits Earned</p>
                <p className="text-3xl font-bold text-blue-600">{audit.totalCreditsEarned}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Credits Required</p>
                <p className="text-3xl font-bold text-gray-900">{audit.totalCreditsRequired}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Credits Remaining</p>
                <p className="text-3xl font-bold text-green-600">
                  {audit.totalCreditsRequired - audit.totalCreditsEarned}
                </p>
              </div>
            </div>
          </div>

          {/* Category Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Category Progress</h2>
            <div className="space-y-4">
              {audit.categoryProgress.map((category, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{category.category}</h3>
                    <span className={`text-sm font-semibold ${category.status === 'Satisfied' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                      {category.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{category.creditsEarned} / {category.creditsRequired} credits</span>
                    <span>{category.percentComplete}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${category.status === 'Satisfied' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      style={{ width: `${category.percentComplete}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Courses */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="bg-gray-800 px-5 py-3">
              <h2 className="text-sm font-bold text-white uppercase">Completed Courses</h2>
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
                        <td className="px-3 py-2.5 text-center">{course.credits.toFixed(1)}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                            {course.grade?.toUpperCase()}
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

          {/* Failed Courses */}
          {audit.completedCourses.filter(course => !isPassed(course.grade)).length > 0 && (
            <div className="bg-white rounded-lg border border-red-200 mb-6">
              <div className="bg-red-600 px-5 py-3">
                <h2 className="text-sm font-bold text-white uppercase">Failed Courses</h2>
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
                      .filter(course => !isPassed(course.grade))
                      .map((course, index) => {
                        const rowBg = index % 2 === 0 ? 'bg-red-50' : 'bg-white';
                        return (
                          <tr key={index} className={`${rowBg} border-b border-red-100`}>
                            <td className="px-3 py-2.5 font-mono">{course.courseCode}</td>
                            <td className="px-3 py-2.5">{course.courseName}</td>
                            <td className="px-3 py-2.5">{course.semester}</td>
                            <td className="px-3 py-2.5 text-center">{course.credits.toFixed(1)}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="font-bold text-red-600">
                                {course.grade?.toUpperCase()}
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

          {/* Print Button */}
          <div className="text-center print:hidden">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print Audit Report
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
