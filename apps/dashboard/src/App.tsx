import Layout from "./components/layout/Layout";
import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { PageLoader } from "./components/ui/Loader";
import { useAuth } from "./components/AuthContext";

// Lazy-loaded pages
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const AssetsListPage = lazy(() => import("./pages/assets/AssetsListPage"));
const AssetsDetailPage = lazy(() => import("./pages/assets/AssetsDetailPage"));
const AdminJobsPage = lazy(() => import("./pages/admin/AdminJobsPage"));
const ReportsPage = lazy(() => import("./pages/reports/ReportsPage"));
const CompliancePage = lazy(() => import("./pages/compliance/CompliancePage"));
const CollectionsPage = lazy(() => import("./pages/collections/CollectionsPage"));
const ApprovalsPage = lazy(() => import("./pages/approvals/ApprovalsPage"));
const UsersPage = lazy(() => import("./pages/users/UsersPage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/assets" element={<AssetsListPage />} />
                    <Route path="/assets/:id" element={<AssetsDetailPage />} />
                    <Route path="/intelligence" element={<ReportsPage />} />
                    <Route path="/compliance" element={<CompliancePage />} />
                    <Route path="/collections" element={<CollectionsPage />} />
                    <Route path="/approvals" element={<ApprovalsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/jobs" element={<AdminJobsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
