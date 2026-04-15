import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Eye,
  Trash2,
  Download,
  FileText,
  Calendar,
  User,
  CheckSquare,
  Square,
} from "lucide-react";
import { constant } from "@dam/shared";

const { ui } = constant;

interface ComplianceIssue {
  id: string;
  asset: string;
  owner: string;
  type: "expired" | "missing_rights" | "duplicate" | "risky";
  severity: "critical" | "warning" | "info";
  description: string;
  action: string;
  date: string;
}

const CompliancePage: React.FC = () => {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "expired" | "rights" | "duplicates" | "risk">(
    "all",
  );

  const complianceIssues: ComplianceIssue[] = [
    {
      id: "1",
      asset: "old-campaign-2024.jpg",
      owner: "Marketing Team",
      type: "expired",
      severity: "critical",
      description: "Asset expired on 2025-06-30",
      action: "Archive or update expiry",
      date: "Expired 6 months ago",
    },
    {
      id: "2",
      asset: "product-photo.png",
      owner: "Design Team",
      type: "missing_rights",
      severity: "warning",
      description: "Usage rights not specified",
      action: "Set usage rights",
      date: "Uploaded 2 months ago",
    },
    {
      id: "3",
      asset: "brand-logo-v1.eps",
      owner: "Brand Manager",
      type: "duplicate",
      severity: "warning",
      description: "Similar to brand-logo-final.eps (98% match)",
      action: "Merge or delete duplicate",
      date: "Detected today",
    },
    {
      id: "4",
      asset: "external-vendor-art.jpg",
      owner: "Procurement",
      type: "risky",
      severity: "info",
      description: "External source - requires approval before publishing",
      action: "Review and approve",
      date: "Flagged 1 day ago",
    },
  ];

  const toggleIssueSelection = (id: string) => {
    setSelectedIssues((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleAllIssues = () => {
    if (selectedIssues.length === complianceIssues.length) {
      setSelectedIssues([]);
    } else {
      setSelectedIssues(complianceIssues.map((i) => i.id));
    }
  };

  const filterIssues = () => {
    if (activeTab === "all") return complianceIssues;
    return complianceIssues.filter((i) =>
      i.type.startsWith(activeTab === "rights" ? "missing" : activeTab),
    );
  };

  const filteredIssues = filterIssues();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "expired":
        return <Calendar size={18} />;
      case "missing_rights":
        return <Shield size={18} />;
      case "duplicate":
        return <CheckCircle2 size={18} />;
      case "risky":
        return <AlertTriangle size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.3s_ease-in]">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="page-title">{ui.complianceTitle}</h1>
          <p className="page-subtitle">{ui.complianceSubtitle}</p>
        </div>
        <div className="flex gap-4">
          <div
            className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
          >
            <AlertTriangle size={20} />
            <span>{complianceIssues.filter((i) => i.severity === "critical").length}</span>
          </div>
          <div
            className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold"
            style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}
          >
            <Clock size={20} />
            <span>{complianceIssues.filter((i) => i.severity === "warning").length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass flex gap-2 p-2 rounded-xl">
        {["all", "expired", "rights", "duplicates", "risk"].map((tab) => (
          <button
            key={tab}
            className={`py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === tab ? "text-white" : "hover:bg-white/5"}`}
            style={{
              background: activeTab === tab ? "var(--color-primary)" : "transparent",
              color: activeTab === tab ? "white" : "var(--color-text-muted)",
            }}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab === "all" && `All (${complianceIssues.length})`}
            {tab === "expired" && "Expired"}
            {tab === "rights" && "Missing Rights"}
            {tab === "duplicates" && "Duplicates"}
            {tab === "risk" && "Risk Flags"}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedIssues.length > 0 && (
        <div className="glass flex justify-between items-center p-4 rounded-xl">
          <span className="font-semibold">{selectedIssues.length} selected</span>
          <div className="flex gap-3">
            <button className="btn-outline">Approve All</button>
            <button className="btn-outline">Archive All</button>
            <button className="btn-outline">Notify Owners</button>
            <button className="btn-danger">Delete</button>
          </div>
        </div>
      )}

      {/* Issues Table */}
      <div className="glass overflow-hidden rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "rgba(255, 255, 255, 0.05)" }}>
              <th
                className="p-4 text-left"
                style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
              >
                <button onClick={toggleAllIssues} style={{ color: "var(--color-text-muted)" }}>
                  {selectedIssues.length === filteredIssues.length && filteredIssues.length > 0 ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
              {["Asset", "Type", "Issue", "Action Required", "Date", "Actions"].map((h) => (
                <th
                  key={h}
                  className="p-4 text-left text-sm font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--color-text-muted)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <tr
                  key={issue.id}
                  className="hover:bg-white/[0.02] transition-colors"
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    borderLeft: `4px solid ${getSeverityColor(issue.severity)}`,
                  }}
                >
                  <td className="p-4">
                    <button
                      onClick={() => toggleIssueSelection(issue.id)}
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {selectedIssues.includes(issue.id) ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold">{issue.asset}</span>
                      <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        by {issue.owner}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div
                      className="flex items-center gap-2 py-2 px-3 rounded-lg w-fit text-sm font-medium capitalize"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        color: getSeverityColor(issue.severity),
                      }}
                    >
                      {getTypeIcon(issue.type)}
                      <span>{issue.type.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {issue.description}
                  </td>
                  <td className="p-4">
                    <span
                      className="text-sm py-1 px-2 rounded"
                      style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}
                    >
                      {issue.action}
                    </span>
                  </td>
                  <td className="p-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {issue.date}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        className="p-1 rounded hover:bg-white/10"
                        title="Review"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-white/10"
                        title="Export"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-white/10"
                        title="Delete"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center p-8"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  No compliance issues found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 mt-8">
        {[
          {
            icon: <Shield size={24} />,
            title: "Compliance Score",
            value: "94.2%",
            text: "Excellent compliance status",
          },
          {
            icon: <Clock size={24} />,
            title: "At Risk",
            value: String(complianceIssues.length),
            text: "Assets requiring attention",
          },
          {
            icon: <CheckCircle2 size={24} />,
            title: "Last Check",
            value: "Today",
            text: "Compliance check completed",
          },
          {
            icon: <User size={24} />,
            title: "Team Status",
            value: "8/10",
            text: "Departments compliant",
          },
        ].map((card) => (
          <div key={card.title} className="glass p-6 flex flex-col gap-4">
            <div className="flex gap-4 items-start">
              <div style={{ color: "var(--color-primary)" }}>{card.icon}</div>
              <h3 className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {card.title}
              </h3>
            </div>
            <div className="text-3xl font-bold">{card.value}</div>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {card.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompliancePage;
