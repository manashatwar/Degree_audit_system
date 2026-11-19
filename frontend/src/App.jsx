import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import StudentAudit from './pages/student/Audit';
import StudentExceptions from './pages/student/Exceptions';
import AdvisorAtRisk from './pages/advisor/AtRisk';
import RegistrarDashboard from './pages/registrar/Dashboard';
import RegistrarImport from './pages/registrar/Import';
import RegistrarManageAdvisors from './pages/registrar/ManageAdvisors';
import DeanDashboard from './pages/dean/Dashboard';
import DeanExceptions from './pages/dean/Exceptions';
import CatalogManagement from './pages/registrar/CatalogManagement';
import CatalogYearAssignment from './pages/registrar/CatalogYearAssignment';
import AdmissionDashboard from './pages/admission/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import AdminLogs from './pages/admin/Logs';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute allowedRoles={['Student']}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/student/audit"
            element={
              <PrivateRoute allowedRoles={['Student']}>
                <StudentAudit />
              </PrivateRoute>
            }
          />

          <Route
            path="/student/exceptions"
            element={
              <PrivateRoute allowedRoles={['Student']}>
                <StudentExceptions />
              </PrivateRoute>
            }
          />

          <Route
            path="/advisor/at-risk"
            element={
              <PrivateRoute allowedRoles={['FacultyAdvisor']}>
                <AdvisorAtRisk />
              </PrivateRoute>
            }
          />

          <Route
            path="/registrar/dashboard"
            element={
              <PrivateRoute allowedRoles={['RegistrarStaff']}>
                <RegistrarDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/registrar/import"
            element={
              <PrivateRoute allowedRoles={['RegistrarStaff']}>
                <RegistrarImport />
              </PrivateRoute>
            }
          />

          <Route
            path="/registrar/advisors"
            element={
              <PrivateRoute allowedRoles={['RegistrarStaff']}>
                <RegistrarManageAdvisors />
              </PrivateRoute>
            }
          />

          <Route
            path="/registrar/catalogs"
            element={
              <PrivateRoute allowedRoles={['RegistrarStaff']}>
                <CatalogManagement />
              </PrivateRoute>
            }
          />

          <Route
            path="/registrar/catalog-year"
            element={
              <PrivateRoute allowedRoles={['RegistrarStaff']}>
                <CatalogYearAssignment />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Dean Routes */}
          <Route
            path="/dean/dashboard"
            element={
              <PrivateRoute allowedRoles={['Dean']}>
                <DeanDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dean/exceptions"
            element={
              <PrivateRoute allowedRoles={['Dean']}>
                <DeanExceptions />
              </PrivateRoute>
            }
          />

          {/* Admission Cell Routes */}
          <Route
            path="/admission/credits"
            element={
              <PrivateRoute allowedRoles={['AdmissionCell']}>
                <AdmissionDashboard />
              </PrivateRoute>
            }
          />

          {/* System Administrator Routes (SRS §11.7, §13.9) */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
                <AdminSettings />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
                <AdminLogs />
              </PrivateRoute>
            }
          />

          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
                  <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
