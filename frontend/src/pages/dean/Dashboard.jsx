import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { deanService } from '../../services/deanService';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, TrendingUp, AlertTriangle, GraduationCap, BookOpen, BarChart3 } from 'lucide-react';

export default function DeanDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await deanService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading institution analytics...</p>
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

  const { summary, departmentBreakdown, cgpaDistribution, batchTrend, students } = analytics;

  const statCards = [
    { label: 'Total Students', value: summary.totalStudents, icon: Users, color: 'blue' },
    { label: 'At-Risk Students', value: summary.atRiskCount, icon: AlertTriangle, color: 'red' },
    { label: 'Graduation Eligible', value: summary.eligibleCount, icon: GraduationCap, color: 'green' },
    { label: 'Institution Avg CGPA', value: summary.avgCGPA, icon: TrendingUp, color: 'purple' },
    { label: 'Faculty Advisors', value: summary.totalAdvisors, icon: BookOpen, color: 'orange' },
  ];

  const maxCgpaBucket = Math.max(...cgpaDistribution.map(b => b.count), 1);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dean's Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Institution-wide academic performance overview — Welcome, {user.name}</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`h-10 w-10 bg-${color}-100 rounded-full flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 text-${color}-600`} />
                  </div>
                  <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                  <p className="text-xs text-gray-500 leading-tight">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Breakdown */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center space-x-2 text-base">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Department-wise Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-purple-700 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Dept</th>
                    <th className="px-4 py-2 text-center font-medium">Students</th>
                    <th className="px-4 py-2 text-center font-medium">Avg CGPA</th>
                    <th className="px-4 py-2 text-center font-medium">At-Risk</th>
                    <th className="px-4 py-2 text-center font-medium">Eligible</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentBreakdown.map((dept, i) => (
                    <tr key={dept.department} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-semibold text-gray-900">{dept.department}</td>
                      <td className="px-4 py-3 text-center">{dept.count}</td>
                      <td className={`px-4 py-3 text-center font-bold ${dept.avgCGPA < 6 ? 'text-red-600' : dept.avgCGPA >= 8 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {dept.avgCGPA}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dept.atRisk > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {dept.atRisk}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {dept.eligible}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* CGPA Distribution */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center space-x-2 text-base">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>CGPA Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {cgpaDistribution.map(({ range, count }) => {
                const pct = Math.round((count / maxCgpaBucket) * 100);
                const isLow = range === 'Below 5' || range === '5–6';
                return (
                  <div key={range} className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500 w-16 text-right">{range}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                      <div
                        className={`h-5 rounded-full transition-all ${isLow ? 'bg-red-400' : 'bg-purple-500'}`}
                        style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                      />
                      {count > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {count}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 w-8">{count === 0 ? '—' : ''}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Batch Trend */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-base">Batch-Year Average CGPA Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-end space-x-6 h-32">
              {batchTrend.map(({ batchYear, avgCGPA, count }) => {
                const heightPct = Math.round((avgCGPA / 10) * 100);
                return (
                  <div key={batchYear} className="flex flex-col items-center space-y-1 flex-1">
                    <span className="text-xs font-bold text-purple-700">{avgCGPA}</span>
                    <div className="w-full bg-gray-100 rounded-t" style={{ height: '80px' }}>
                      <div
                        className="w-full bg-purple-500 rounded-t transition-all"
                        style={{ height: `${heightPct}%`, marginTop: `${100 - heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{batchYear}</span>
                    <span className="text-xs text-gray-400">{count} students</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}
