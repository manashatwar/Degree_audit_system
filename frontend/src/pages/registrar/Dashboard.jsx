import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Upload, FileSpreadsheet, Users, Database } from 'lucide-react';

export default function RegistrarDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { name: 'Total Students', value: '8', icon: Users, color: 'blue' },
    { name: 'Total Courses', value: '39', icon: Database, color: 'green' },
    { name: 'Transcript Records', value: '46+', icon: FileSpreadsheet, color: 'purple' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <Icon className={`h-10 w-10 text-${stat.color}-600`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate('/registrar/import')}
                className="h-32 flex flex-col items-center justify-center space-y-3 bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-12 w-12" />
                <div className="text-center">
                  <p className="font-semibold text-lg">Import Transcripts</p>
                  <p className="text-sm text-blue-100">Upload CSV file with student grades</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center space-y-3"
                disabled
              >
                <FileSpreadsheet className="h-12 w-12 text-gray-400" />
                <div className="text-center">
                  <p className="font-semibold text-lg text-gray-600">View Import History</p>
                  <p className="text-sm text-gray-400">Coming soon</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">CSV Format Requirements</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• File must be in CSV format with headers</li>
                <li>• Required columns: studentId, courseCode, semester, grade, credits</li>
                <li>• Student IDs must exist in the system</li>
                <li>• Course codes must match catalog entries</li>
                <li>• Grades must be letter grades (A, AB, B, BC, C, CD, D, F)</li>
                <li>• Credits must be positive integers</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Important Notes</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Degree audits are automatically recalculated after import</li>
                <li>• Invalid records will be flagged during preview</li>
                <li>• Only valid records will be imported</li>
                <li>• Import operations cannot be undone</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
