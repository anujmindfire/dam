import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import AssetListPage from "./pages/Assets/AssetListPage";
import AssetDetailPage from "./pages/Assets/AssetDetailPage";
import AdminJobsPage from "./pages/Admin/AdminJobsPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import CompliancePage from "./pages/Compliance/CompliancePage";
import SettingsPage from "./pages/Settings/SettingsPage";
import LoginPage from "./pages/Auth/LoginPage";

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/assets" element={<AssetListPage />} />
          <Route path="/assets/:id" element={<AssetDetailPage />} />
          <Route path="/intelligence" element={<ReportsPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/jobs" element={<AdminJobsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
