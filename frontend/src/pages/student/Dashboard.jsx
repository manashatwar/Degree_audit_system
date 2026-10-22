import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import Layout from '../../components/Layout';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseListExpanded, setCourseListExpanded] = useState(true);
  const [failListExpanded, setFailListExpanded] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    try {
      setLoading(true);
      const auditData = await studentService.getAudit(user.studentId);
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

  const calculateStats = () => {
    if (!audit) return null;

    const coreCourses = audit.completedCourses.filter(c =>
      c.courseType === 'Core' || c.courseType === 'CORE' || c.courseType === 'PC'
    );
    const programElectives = audit.completedCourses.filter(c =>
      c.courseType === 'Program Elective' || c.courseType === 'PE' || c.courseType === 'PROGRAM ELECTIVE'
    );

    const completedCoreCourses = coreCourses.filter(c => isPassed(c.grade));
    const improvementCourses = audit.completedCourses.filter(c => {
      const grade = c.grade?.toString().toUpperCase();
      return grade === 'CD' || grade === 'D';
    });

    const totalCoreRequired = 37;
    const totalProgramElectiveRequired = 1;
    const totalBTPRequired = 2;

    return {
      totalCoreInCurriculum: totalCoreRequired,
      totalProgramElectiveInCurriculum: totalProgramElectiveRequired,
      totalBTPInCurriculum: totalBTPRequired,
      completedCore: completedCoreCourses.length,
      remainingCore: totalCoreRequired - completedCoreCourses.length,
      remainingProgramElective: totalProgramElectiveRequired - programElectives.filter(c => isPassed(c.grade)).length,
      remainingBTP: totalBTPRequired - audit.completedCourses.filter(c => (c.courseType === 'BTP' || c.courseType === 'BTP-CORE') && isPassed(c.grade)).length,
      registeredCore: coreCourses.length,
      registeredImprovement: improvementCourses.length,
      registeredProgramElective: programElectives.length
    };
  };

  const getFilteredCourses = () => {
    if (!audit) return [];
    if (categoryFilter === 'all') return audit.completedCourses;

    return audit.completedCourses.filter(c => {
      const type = c.courseType?.toLowerCase() || '';
      if (categoryFilter === 'core') {
        return type === 'core' || type === 'pc';
      } else if (categoryFilter === 'mandatory') {
        return type === 'mandatory';
      } else if (categoryFilter === 'elective') {
        return type === 'elective' || type === 'open elective' || type === 'oe' || type === 'program elective' || type === 'pe';
      }
      return false;
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded p-4 m-6">
          <p className="text-red-800">{error}</p>
        </div>
      </Layout>
    );
  }

  const stats = calculateStats();
  const failedCourses = audit.completedCourses.filter(c => !isPassed(c.grade));
  const filteredCourses = getFilteredCourses();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Simple Header */}
          <div className="bg-blue-600 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
                <p className="text-blue-100 text-sm mt-1">• {audit.studentId} • •</p>
              </div>
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <p className="text-xs text-blue-100 uppercase">CGPA</p>
                <p className="text-3xl font-bold text-white">{audit.CGPA}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Tables */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course List */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div
                  className="bg-gray-800 px-5 py-3 flex items-center justify-between cursor-pointer"
                  onClick={() => setCourseListExpanded(!courseListExpanded)}
                >
                  <h2 className="text-sm font-bold text-white uppercase">Course List</h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        e.stopPropagation();
                        setCategoryFilter(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gray-700 text-white text-xs px-3 py-1.5 rounded border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="core">Core</option>
                      <option value="mandatory">Mandatory</option>
                      <option value="elective">Electives</option>
                    </select>
                    <button className="text-white">
                      {courseListExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {courseListExpanded && (
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="w-full text-xs">
                      <thead className="bg-gray-700 text-white sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium uppercase">Sr. No.</th>
                          <th className="px-3 py-2 text-left font-medium uppercase">Session</th>
                          <th className="px-3 py-2 text-left font-medium uppercase">Course Name</th>
                          <th className="px-3 py-2 text-left font-medium uppercase">Grade - Credits</th>
                          <th className="px-3 py-2 text-left font-medium uppercase">Course Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                              No courses found
                            </td>
                          </tr>
                        ) : (
                          filteredCourses.map((course, index) => {
                            const passed = isPassed(course.grade);
                            const gradeDisplay = `${course.grade?.toUpperCase()} - ${course.credits.toFixed(2)}`;
                            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                            return (
                              <tr key={index} className={`${rowBg} border-b border-gray-100`}>
                                <td className="px-3 py-2.5">{index + 1}</td>
                                <td className="px-3 py-2.5 font-medium">{course.semester}</td>
                                <td className="px-3 py-2.5">{course.courseName}</td>
                                <td className="px-3 py-2.5">
                                  <span className={`font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                    {gradeDisplay}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5">{course.courseType || 'Core'}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Fail Course List */}
              {failedCourses.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div
                    className="bg-red-600 px-5 py-3 flex items-center justify-between cursor-pointer"
                    onClick={() => setFailListExpanded(!failListExpanded)}
                  >
                    <h2 className="text-sm font-bold text-white uppercase">Fail Course List</h2>
                    <button className="text-white">
                      {failListExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {failListExpanded && (
                    <table className="w-full text-xs">
                      <thead className="bg-red-600 text-white">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium uppercase">Sr. No.</th>
                          <th className="px-3 py-2 text-left font-medium uppercase">Session</th>
                          <th className="px-3 py-2 text-left font-medium uppercase">Course Name</th>
                          <th className="px-3 py-2 text-left font-medium uppercase">Grade - Credits</th>
                          <th className="px-3 py-2 text-left font-medium uppercase">Course Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failedCourses.map((course, index) => (
                          <tr key={index} className="bg-white border-b border-gray-100">
                            <td className="px-3 py-2.5">{index + 1}</td>
                            <td className="px-3 py-2.5 font-medium">{course.semester}</td>
                            <td className="px-3 py-2.5">{course.courseName}</td>
                            <td className="px-3 py-2.5">
                              <span className="font-bold text-red-600">
                                {course.grade?.toUpperCase()} - {course.credits.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">{course.courseType || 'Core'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* Statistics Cards */}
            <div className="lg:col-span-1 space-y-4">
              {/* Card 1 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-800 px-4 py-2.5">
                  <h3 className="text-xs font-bold text-white uppercase">Core/Elective Course Count (Curriculumwise)</h3>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Course Type</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">No. of Courses</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 bg-pink-100">CORE COURSE</td>
                      <td className="px-3 py-2 text-right bg-pink-100 font-bold">{stats.totalCoreInCurriculum}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 bg-pink-50">PROGRAM ELECTIVE</td>
                      <td className="px-3 py-2 text-right bg-pink-50 font-bold">{stats.totalProgramElectiveInCurriculum}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-800 px-4 py-2.5">
                  <h3 className="text-xs font-bold text-white uppercase">BTP Course Count (Curriculumwise)</h3>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Course Type</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">No. of Courses</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 bg-pink-50">BTP-CORE</td>
                      <td className="px-3 py-2 text-right bg-pink-50 font-bold">{stats.totalBTPInCurriculum}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-800 px-4 py-2.5">
                  <h3 className="text-xs font-bold text-white uppercase">Course Count Completed by Student</h3>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Course Type</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">No. of Courses</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 bg-green-100">CORE</td>
                      <td className="px-3 py-2 text-right bg-green-100 font-bold">{stats.completedCore}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-800 px-4 py-2.5">
                  <h3 className="text-xs font-bold text-white uppercase">Course Count Remaining by Student</h3>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Course Type</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">No. of Courses</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 bg-yellow-100">CORE COURSE</td>
                      <td className="px-3 py-2 text-right bg-yellow-100 font-bold">{stats.remainingCore}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 bg-yellow-50">PROGRAM ELECTIVE</td>
                      <td className="px-3 py-2 text-right bg-yellow-50 font-bold">{stats.remainingProgramElective}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Card 5 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-800 px-4 py-2.5">
                  <h3 className="text-xs font-bold text-white uppercase">BTP Course Count Remaining by Student</h3>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Course Type</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">No. of Courses</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 bg-yellow-50">BTP-CORE</td>
                      <td className="px-3 py-2 text-right bg-yellow-50 font-bold">{stats.remainingBTP}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Card 6 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-800 px-4 py-2.5">
                  <h3 className="text-xs font-bold text-white uppercase">Registered Course Count</h3>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Course Type</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">No. of Courses</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 bg-yellow-50">CORE</td>
                      <td className="px-3 py-2 text-right bg-yellow-50 font-bold">{stats.registeredCore}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 bg-green-50">IMPROVEMENT</td>
                      <td className="px-3 py-2 text-right bg-green-50 font-bold">{stats.registeredImprovement}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 bg-yellow-50">PROGRAM ELECTIVE</td>
                      <td className="px-3 py-2 text-right bg-yellow-50 font-bold">{stats.registeredProgramElective}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
