import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { GraduationCap, BookOpen, TrendingUp, CheckCircle, AlertCircle, XCircle, Award } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [improvementSemester, setImprovementSemester] = useState('all');
  const [compulsorySemester, setCompulsorySemester] = useState('all');
  const [activeTab, setActiveTab] = useState('registered');

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    try {
      setLoading(true);
      const auditData = await studentService.getAudit(user.studentId);
      setAudit(auditData);
      if (auditData.completedCourses.length > 0) {
        const semesters = [...new Set(auditData.completedCourses.map(c => c.semester))];
        setSelectedSemester(semesters[semesters.length - 1] || 'all');
      }
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

  const canRepeat = (grade) => {
    const upperGrade = grade?.toString().toUpperCase();
    return upperGrade === 'CD' || upperGrade === 'F';
  };

  const mustRepeat = (grade) => grade?.toString().toUpperCase() === 'F';

  const getCreditStatus = (course) => {
    if (isPassed(course.grade)) {
      return { status: 'Done', color: 'text-green-600 bg-green-50' };
    } else {
      return { status: 'Not Done', color: 'text-red-600 bg-red-50' };
    }
  };

  const getAllSemesters = () => {
    if (!audit) return [];
    const semesters = [...new Set(audit.completedCourses.map(c => c.semester))];
    return semesters.sort();
  };

  const getFilteredCourses = () => {
    if (!audit) return [];
    if (selectedSemester === 'all') return audit.completedCourses;
    return audit.completedCourses.filter(c => c.semester === selectedSemester);
  };

  const calculateSemesterPerformance = (courses) => {
    let totalCredits = 0;
    let totalGradePoints = 0;

    courses.forEach(course => {
      const credits = course.credits || 0;
      const gradePoint = getGradePoint(course.grade);
      totalCredits += credits;
      totalGradePoints += credits * gradePoint;
    });

    const spi = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
    return { totalCredits, totalGradePoints: totalGradePoints.toFixed(2), spi };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student information...</p>
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

  const semesters = getAllSemesters();
  const filteredCourses = getFilteredCourses();
  const semesterPerf = calculateSemesterPerformance(filteredCourses);

  const failedCourses = audit.completedCourses.filter(c => mustRepeat(c.grade));
  const improvementCourses = audit.completedCourses.filter(c => {
    const grade = c.grade?.toString().toUpperCase();
    return grade === 'CD' || grade === 'D';
  });
  const compulsoryCourses = audit.completedCourses.filter(c =>
    (c.courseType === 'Core' || c.courseType === 'PC') && !isPassed(c.grade)
  );

  // Filtered lists based on semester selection
  const filteredImprovementCourses = improvementSemester === 'all'
    ? improvementCourses
    : improvementCourses.filter(c => c.semester === improvementSemester);

  const filteredCompulsoryCourses = compulsorySemester === 'all'
    ? failedCourses
    : failedCourses.filter(c => c.semester === compulsorySemester);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Information</h1>
              <p className="text-sm text-gray-600 mt-1">
                {audit.studentName} • {audit.studentId} • {audit.program} • {audit.department}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Batch Year</p>
              <p className="text-lg font-semibold text-gray-900">{audit.batchYear}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">CGPA</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{audit.CGPA}</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Total Credits</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{audit.totalCreditsEarned}</p>
                  <p className="text-xs text-gray-500">of {audit.totalCreditsRequired}</p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Courses Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{audit.completedCourses.length}</p>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Pending Repeats</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{failedCourses.length}</p>
                  <p className="text-xs text-gray-500">Compulsory</p>
                </div>
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Card>
          <CardHeader className="border-b bg-gray-50 p-0">
            <div className="flex space-x-0">
              <button
                onClick={() => setActiveTab('registered')}
                className={`flex-1 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'registered'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>All Registered Courses</span>
                  <Badge variant="outline" className="ml-2">
                    {audit.completedCourses.length}
                  </Badge>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('improvement')}
                className={`flex-1 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'improvement'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>Courses for Re-examination</span>
                  {improvementCourses.length > 0 && (
                    <Badge variant="outline" className="bg-orange-100">
                      {improvementCourses.length}
                    </Badge>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('compulsory')}
                className={`flex-1 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'compulsory'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>Compulsory Repeats</span>
                  {failedCourses.length > 0 && (
                    <Badge variant="destructive">
                      {failedCourses.length}
                    </Badge>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('progress')}
                className={`flex-1 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'progress'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                Degree Progress
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* TAB 1: All Registered Courses */}
            {activeTab === 'registered' && (
              <div>
                <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Registered Courses List for: {selectedSemester === 'all' ? 'All Semesters' : selectedSemester}
                  </h3>
                  <div className="w-48">
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                      <SelectTrigger className="bg-white text-gray-900">
                        <SelectValue placeholder="Select Semester" value={selectedSemester} />
                      </SelectTrigger>
                      <SelectContent value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {semesters.map(sem => (
                          <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-900">Course Code</TableHead>
                        <TableHead className="font-semibold text-gray-900">Course Title</TableHead>
                        <TableHead className="font-semibold text-gray-900">Course Type</TableHead>
                        <TableHead className="font-semibold text-gray-900 text-center">Credits</TableHead>
                        <TableHead className="font-semibold text-gray-900 text-center">Credit Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No courses found for this semester
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCourses.map((course, index) => {
                          const creditStatus = getCreditStatus(course);
                          const passed = isPassed(course.grade);
                          return (
                            <TableRow key={index} className={!passed ? 'bg-red-50' : ''}>
                              <TableCell className="font-mono font-medium text-sm">
                                {course.courseCode}
                              </TableCell>
                              <TableCell className="max-w-md">
                                <div className="font-medium text-gray-900">{course.courseName}</div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={course.courseType === 'Core' || course.courseType === 'PC' ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {course.courseType || 'CORE'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {course.credits.toFixed(1)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={passed ? 'default' : 'destructive'}
                                  className={`font-semibold ${creditStatus.color}`}
                                >
                                  {creditStatus.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* TAB 2: Courses for Re-examination */}
            {activeTab === 'improvement' && (
              <div>
                <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Courses Available for Re-examination to Improve Grade ({filteredImprovementCourses.length})
                  </h3>
                  <div className="w-48">
                    <Select value={improvementSemester} onValueChange={setImprovementSemester}>
                      <SelectTrigger className="bg-white text-gray-900">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {semesters.map(sem => (
                          <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredImprovementCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto mb-3 text-green-500" />
                    <p className="text-lg font-medium text-gray-900">No courses available for improvement</p>
                    <p className="text-sm text-gray-600">
                      {improvementSemester === 'all'
                        ? 'All your grades are excellent!'
                        : `No courses to improve in ${improvementSemester}`}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-100">
                          <TableRow>
                            <TableHead className="font-semibold text-gray-900">Course Code</TableHead>
                            <TableHead className="font-semibold text-gray-900">Course Title</TableHead>
                            <TableHead className="font-semibold text-gray-900">Type</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center">Credits</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center">Current Grade</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredImprovementCourses.map((course, index) => {
                            const gradePoint = getGradePoint(course.grade);
                            const currentGrade = course.grade?.toString().toUpperCase();
                            const creditStatus = getCreditStatus(course);
                            return (
                              <TableRow key={index} className="hover:bg-gray-50">
                                <TableCell className="font-mono font-bold text-gray-800">
                                  {course.courseCode}
                                </TableCell>
                                <TableCell className="max-w-md">
                                  <div className="font-medium text-gray-900">{course.courseName}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={course.courseType === 'Core' || course.courseType === 'PC' ? 'default' : 'outline'}
                                    className="text-xs"
                                  >
                                    {course.courseType || 'Core'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center font-medium">
                                  <div>{course.credits.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">({creditStatus.status})</div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex flex-col items-center space-y-1">
                                    <Badge
                                      variant={currentGrade === 'CD' ? 'destructive' : 'outline'}
                                      className="text-sm font-bold"
                                    >
                                      {currentGrade}
                                    </Badge>
                                    <span className="text-xs text-gray-600">
                                      {gradePoint}/10
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className="bg-orange-600 hover:bg-orange-700 font-semibold">
                                    CAN IMPROVE
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="p-4 bg-blue-100 border-t-2 border-blue-300">
                      <p className="text-sm text-blue-900">
                        💡 <strong>Note:</strong> Only courses with CD or D grades can be repeated for grade improvement. F grade courses must be compulsorily repeated.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 3: Compulsory Repeats */}
            {activeTab === 'compulsory' && (
              <div>
                <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Compulsory Course Repeat - Pending for Credit Completion ({filteredCompulsoryCourses.length})
                    </h3>
                    <p className="text-sm mt-1 font-medium">
                      F Grade - Must be repeated to earn credits
                    </p>
                  </div>
                  <div className="w-48">
                    <Select value={compulsorySemester} onValueChange={setCompulsorySemester}>
                      <SelectTrigger className="bg-white text-gray-900">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {semesters.map(sem => (
                          <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredCompulsoryCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto mb-3 text-green-500" />
                    <p className="text-lg font-medium text-green-700">No compulsory repeats required</p>
                    <p className="text-sm text-gray-600">
                      {compulsorySemester === 'all'
                        ? 'You have passed all your courses!'
                        : `No compulsory repeats in ${compulsorySemester}`}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-100">
                          <TableRow>
                            <TableHead className="font-semibold text-gray-900">Course Code</TableHead>
                            <TableHead className="font-semibold text-gray-900">Course Title</TableHead>
                            <TableHead className="font-semibold text-gray-900">Type</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center">Credits</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center">Semester</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center">Grade</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCompulsoryCourses.map((course, index) => (
                            <TableRow key={index} className="bg-red-50 hover:bg-red-100">
                              <TableCell className="font-mono font-bold text-red-700">
                                {course.courseCode}
                              </TableCell>
                              <TableCell className="max-w-md">
                                <div className="font-medium text-gray-900">{course.courseName}</div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={course.courseType === 'Core' || course.courseType === 'PC' ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {course.courseType || 'Core'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                <div>{course.credits.toFixed(1)}</div>
                                <div className="text-xs text-red-600">(Not Done)</div>
                              </TableCell>
                              <TableCell className="text-center text-gray-700 font-medium">
                                {course.semester}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="destructive" className="text-base font-bold">
                                  F
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-red-600 hover:bg-red-700 font-semibold">
                                  COMPULSORY REPEAT
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="p-4 bg-red-100 border-t-2 border-red-300">
                      <p className="text-sm text-red-900 font-semibold">
                        ⚠️ <strong>IMPORTANT:</strong> These courses must be repeated and passed to complete your degree. Registration is mandatory.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 4: Degree Progress */}
            {activeTab === 'progress' && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <GraduationCap className="h-6 w-6 mr-2 text-blue-600" />
                    Degree Completion Progress
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Track your overall progress towards degree completion
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex justify-between mb-3">
                      <span className="text-lg font-semibold text-gray-900">Overall Progress</span>
                      <span className="text-lg font-bold text-blue-600">
                        {audit.totalCreditsEarned} / {audit.totalCreditsRequired} credits ({Math.round((audit.totalCreditsEarned / audit.totalCreditsRequired) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all"
                        style={{ width: `${Math.min((audit.totalCreditsEarned / audit.totalCreditsRequired) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {audit.categoryProgress.map((category, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">{category.category}</h5>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">{category.creditsEarned} / {category.creditsRequired} credits</span>
                          <span className="font-semibold">{category.percentComplete}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full ${category.status === 'Satisfied' ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${category.percentComplete}%` }}
                          ></div>
                        </div>
                        <Badge variant={category.status === 'Satisfied' ? 'default' : 'outline'} className="text-xs">
                          {category.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
