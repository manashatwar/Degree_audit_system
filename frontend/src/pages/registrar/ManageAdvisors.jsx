import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users, UserCheck, UserX, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export default function ManageAdvisors() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, advisorsRes, statsRes] = await Promise.all([
        api.get('/assignments/students'),
        api.get('/assignments/advisors'),
        api.get('/assignments/stats')
      ]);
      
      setStudents(studentsRes.data.data);
      setAdvisors(advisorsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdvisor = async () => {
    if (!selectedStudent || !selectedAdvisor) {
      alert('Please select both a student and an advisor');
      return;
    }

    try {
      setAssigning(true);
      await api.post('/assignments/assign', {
        studentId: selectedStudent.studentId,
        advisorId: selectedAdvisor
      });
      
      alert('Advisor assigned successfully!');
      setSelectedStudent(null);
      setSelectedAdvisor('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign advisor');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (studentId) => {
    if (!confirm('Are you sure you want to remove this advisor assignment?')) {
      return;
    }

    try {
      await api.delete(`/assignments/students/${studentId}/assignment`);
      alert('Advisor assignment removed');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove assignment');
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Advisor Assignments</h1>
            <p className="text-gray-600 mt-1">Assign students to faculty advisors</p>
          </div>
          <Button variant="outline" onClick={loadData} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalStudents}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Advisors</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalAdvisors}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assigned</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.assignedStudents}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unassigned</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{stats.unassignedStudents}</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <UserX className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assignment Form */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle>Assign Advisor to Student</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedStudent?.studentId || ''}
                  onChange={(e) => {
                    const student = students.find(s => s.studentId === e.target.value);
                    setSelectedStudent(student);
                  }}
                >
                  <option value="">-- Select Student --</option>
                  {students.map(student => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.name} ({student.studentId})
                      {student.currentAdvisor && ` - Currently: ${student.currentAdvisor.name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Advisor
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedAdvisor}
                  onChange={(e) => setSelectedAdvisor(e.target.value)}
                >
                  <option value="">-- Select Advisor --</option>
                  {advisors.map(advisor => (
                    <option key={advisor.advisorId} value={advisor.advisorId}>
                      {advisor.name} ({advisor.department}) - {advisor.adviseeCount} students
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleAssignAdvisor}
                  disabled={!selectedStudent || !selectedAdvisor || assigning}
                  className="w-full"
                >
                  {assigning ? 'Assigning...' : 'Assign Advisor'}
                </Button>
              </div>
            </div>

            {selectedStudent && selectedStudent.currentAdvisor && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  This student is currently assigned to <strong>{selectedStudent.currentAdvisor.name}</strong>.
                  Assigning a new advisor will replace the current assignment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student List */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle>All Students</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Complete list of students with their advisor assignments
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Program</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Semester</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Current Advisor</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.studentId}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.program}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.currentSemester}</td>
                      <td className="px-4 py-3">
                        {student.currentAdvisor ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.currentAdvisor.name}</p>
                            <p className="text-xs text-gray-500">{student.currentAdvisor.department}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.currentAdvisor ? (
                          <Badge variant="success">Assigned</Badge>
                        ) : (
                          <Badge variant="warning">Unassigned</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.currentAdvisor ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAssignment(student.studentId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStudent(student)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Assign
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Advisor List */}
        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle>Faculty Advisors</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Advisor workload distribution</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advisors.map(advisor => (
                <div key={advisor.advisorId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{advisor.name}</h3>
                    <Badge variant="outline">{advisor.adviseeCount} students</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{advisor.department}</p>
                  <p className="text-xs text-gray-500 mt-1">{advisor.email}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
