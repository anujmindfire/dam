import React, { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Copy,
  Download,
  Calendar,
  Users,
  FileType,
  MoreVertical,
} from "lucide-react";
import { constant } from "@dam/shared";

const { ui } = constant;

const ReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [department, setDepartment] = useState("all");
  const [assetType, setAssetType] = useState("all");

  const reportCards = [
    {
      id: 1,
      title: "Usage Trends",
      icon: TrendingUp,
      value: "2,847",
      subtitle: "Assets viewed this week",
      trend: "+12%",
      color: "var(--color-primary)",
    },
    {
      id: 2,
      title: "Compliance Status",
      icon: AlertTriangle,
      value: "94%",
      subtitle: "Assets compliant",
      trend: "+2%",
      color: "#10b981",
    },
    {
      id: 3,
      title: "Duplicate Detection",
      icon: Copy,
      value: "847",
      subtitle: "Similar assets found",
      trend: "-5%",
      color: "var(--color-secondary)",
    },
    {
      id: 4,
      title: "Asset Health",
      icon: BarChart3,
      value: "3,204",
      subtitle: "Total assets",
      trend: "+8%",
      color: "var(--color-accent-purple)",
    },
  ];

  const usageData = [
    { department: "Marketing", views: 1240, downloads: 890, shares: 345 },
    { department: "Design", views: 856, downloads: 672, shares: 234 },
    { department: "PR", views: 432, downloads: 298, shares: 156 },
    { department: "Finance", views: 234, downloads: 189, shares: 98 },
  ];

  const complianceIssues = [
    {
      id: 1,
      asset: "Campaign_2026_Hero.jpg",
      issue: "Missing copyright info",
      severity: "high",
      department: "Marketing",
    },
    {
      id: 2,
      asset: "FinancialReport_Q1.pdf",
      issue: "Classified data exposure",
      severity: "critical",
      department: "Finance",
    },
    {
      id: 3,
      asset: "Internal_Memo_Draft.docx",
      issue: "No expiration date",
      severity: "medium",
      department: "HR",
    },
    {
      id: 4,
      asset: "Brand_Guidelines_v3.pdf",
      issue: "Outdated version detected",
      severity: "medium",
      department: "Design",
    },
  ];

  const duplicateGroups = [
    {
      group: "Brand Logo Variations",
      count: 23,
      storage: "156 MB",
      similarityScore: 92,
      samples: ["logo_main.svg", "logo_alt.svg", "logo_white.svg"],
    },
    {
      group: "Product Photography",
      count: 47,
      storage: "2.3 GB",
      similarityScore: 88,
      samples: ["product_01.jpg", "product_01_v2.jpg", "product_01_edited.jpg"],
    },
    {
      group: "Social Media Templates",
      count: 34,
      storage: "564 MB",
      similarityScore: 85,
      samples: ["template_insta_1.psd", "template_insta_2.psd", "template_insta_3.psd"],
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#dc2626";
      case "high":
        return "#ea580c";
      case "medium":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.3s_ease-in]">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <h1 className="page-title">{ui.reportsTitle}</h1>
          <p className="page-subtitle">{ui.reportsSubtitle}</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download size={18} /> {ui.export}
        </button>
      </div>

      {/* Filters */}
      <div className="glass flex gap-4 p-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={18} style={{ color: "var(--color-text-muted)" }} />
          <select
            className="filter-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Users size={18} style={{ color: "var(--color-text-muted)" }} />
          <select
            className="filter-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="marketing">Marketing</option>
            <option value="design">Design</option>
            <option value="pr">PR</option>
            <option value="finance">Finance</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <FileType size={18} style={{ color: "var(--color-text-muted)" }} />
          <select
            className="filter-select"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="image">{ui.image}</option>
            <option value="video">{ui.video}</option>
            <option value="document">{ui.document}</option>
            <option value="audio">{ui.audio}</option>
          </select>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
        {reportCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.id} className="glass glass-hover p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <IconComponent size={28} style={{ color: card.color }} />
                <span className="text-sm font-semibold" style={{ color: card.color }}>
                  {card.trend}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <div className="text-3xl font-bold" style={{ color: card.color }}>
                {card.value}
              </div>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Usage Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Usage by Department</h2>
        <div className="glass overflow-hidden rounded-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                {["Department", "Views", "Downloads", "Shares"].map((h) => (
                  <th
                    key={h}
                    className="text-left p-4 text-sm font-semibold uppercase tracking-wider"
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
              {usageData.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
                >
                  <td className="p-4 font-medium">{row.department}</td>
                  <td className="p-4" style={{ color: "var(--color-text-muted)" }}>
                    {row.views}
                  </td>
                  <td className="p-4" style={{ color: "var(--color-text-muted)" }}>
                    {row.downloads}
                  </td>
                  <td className="p-4" style={{ color: "var(--color-text-muted)" }}>
                    {row.shares}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Issues */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Compliance Issues</h2>
        <div className="glass overflow-hidden rounded-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                {["Asset", "Issue", "Severity", "Department", ui.actions].map((h) => (
                  <th
                    key={h}
                    className="text-left p-4 text-sm font-semibold uppercase tracking-wider"
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
              {complianceIssues.map((issue) => (
                <tr
                  key={issue.id}
                  className="hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
                >
                  <td className="p-4 font-semibold">{issue.asset}</td>
                  <td className="p-4" style={{ color: "var(--color-text-muted)" }}>
                    {issue.issue}
                  </td>
                  <td className="p-4">
                    <span
                      className="py-1 px-2.5 rounded-full text-xs font-semibold uppercase"
                      style={{
                        color: getSeverityColor(issue.severity),
                        backgroundColor: `${getSeverityColor(issue.severity)}15`,
                      }}
                    >
                      {issue.severity}
                    </span>
                  </td>
                  <td className="p-4" style={{ color: "var(--color-text-muted)" }}>
                    {issue.department}
                  </td>
                  <td className="p-4">
                    <button style={{ color: "var(--color-text-muted)" }}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Duplicate Groups */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Duplicate Detection Results</h2>
        <div className="flex flex-col gap-4">
          {duplicateGroups.map((group, idx) => (
            <div key={idx} className="glass glass-hover p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{group.group}</h3>
                  <span
                    className="text-xs py-0.5 px-2 rounded-full"
                    style={{
                      background: "var(--color-primary-glow)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {group.count} similar
                  </span>
                  <span className="text-sm" style={{ color: "var(--color-text-dim)" }}>
                    {group.storage} total
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                    {group.similarityScore}%
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                    similarity
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {group.samples.map((sample, i) => (
                  <span
                    key={i}
                    className="text-xs py-1 px-2.5 rounded-md"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {sample}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
