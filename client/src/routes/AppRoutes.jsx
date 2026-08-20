import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Overview from "../pages/Overview";
import Upload from "../pages/Upload";
import Analysis from "../pages/Analysis";
import ThreatDetails from "../pages/ThreatDetails";
import ThreatIntel from "../pages/ThreatIntel";
import Reports from "../pages/Reports";
import LiveMonitoring from "../pages/LiveMonitoring";
import Login from "../pages/Login";
import Register from "../pages/Register";

import MainLayout from "../layouts/MainLayout";

function AppRoutes() {
  return (
    <Routes>
      {/* MAIN LAYOUT ROUTES */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* AUTH ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/overview"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Overview />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Upload />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Analysis />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/threat-details"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ThreatDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/threat-intel"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ThreatIntel />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring"
        element={
          <ProtectedRoute>
            <MainLayout>
              <LiveMonitoring />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
