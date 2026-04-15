import React, { useState } from "react";
import {
  Zap,
  Search,
  Pause,
  RotateCcw,
  SearchCode,
  ShieldCheck,
  BarChart2,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { constant } from "@dam/shared";

const { ui } = constant;

const AdminJobsPage: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const jobs = [
    {
      id: "JOB-102",
      type: "Metadata Extraction",
      asset: "vid_launch_01.mp4",
      status: "Running",
      started: "10:21 AM",
      duration: "2m 14s",
      progress: 65,
      details: "Processing video metadata...",
    },
    {
      id: "JOB-101",
      type: "Duplicate Detection",
      asset: "All Library",
      status: "Completed",
      started: "09:00 AM",
      duration: "15m 30s",
      progress: 100,
      details: "3,847 duplicates found",
    },
    {
      id: "JOB-100",
      type: "Similarity Analysis",
      asset: "img_banner_v2.png",
      status: "Pending",
      started: "Queued",
      duration: "--",
      progress: 0,
      details: "Waiting in queue",
    },
    {
      id: "JOB-099",
      type: "Compliance Scan",
      asset: "Department: Mkt",
      status: "Failed",
      started: "08:45 AM",
      duration: "1m 12s",
      progress: 12,
      details: "Error: Invalid metadata format",
    },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.asset.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running":
        return "var(--color-secondary)";
      case "Completed":
        return "#10b981";
      case "Failed":
        return "#ef4444";
      case "Pending":
        return "#94a3b8";
      default:
        return "var(--color-text-dim)";
    }
  };

  const getJobIcon = (type: string) => {
    if (type.includes("Metadata")) return <SearchCode size={18} />;
    if (type.includes("Compliance")) return <ShieldCheck size={18} />;
    if (type.includes("Similarity")) return <BarChart2 size={18} />;
    return <Zap size={18} />;
  };

  const getStatusIcon = (status: string) => {
    if (status === "Running") return <RefreshCw size={14} className="spin" />;
    if (status === "Completed") return <CheckCircle2 size={14} />;
    if (status === "Failed") return <AlertCircle size={14} />;
    return <Clock size={14} />;
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{ui.jobsTitle}</h1>
          <p className="page-subtitle">{ui.jobsSubtitle}</p>
        </div>
        <div className="flex gap-4">
          {[
            { label: "Active Jobs", value: "2" },
            { label: "Completed", value: "142" },
            { label: ui.failed, value: "8" },
          ].map((stat) => (
            <div key={stat.label} className="glass p-4 flex flex-col gap-1">
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {stat.label}
              </span>
              <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="glass flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 max-w-[400px]">
          <Search size={18} style={{ color: "var(--color-text-dim)" }} />
          <input
            type="text"
            placeholder={ui.searchJobId}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-sm w-full outline-none"
            style={{ color: "var(--color-text-main)" }}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All {ui.status}</option>
            <option value="running">{ui.running}</option>
            <option value="completed">{ui.completed}</option>
            <option value="pending">Pending</option>
            <option value="failed">{ui.failed}</option>
          </select>
          <button className="btn-outline flex items-center gap-2">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="flex flex-col gap-3">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="glass glass-hover p-0 overflow-hidden">
              {/* Job Header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer"
                onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      background: "var(--color-glass-bg)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {getJobIcon(job.type)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="font-mono text-[13px]"
                        style={{ color: "var(--color-primary)" }}
                      >
                        {job.id}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-main)" }}
                      >
                        {job.type}
                      </span>
                    </div>
                    <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {job.asset}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div
                    className="flex items-center gap-2 text-[13px] font-semibold"
                    style={{ color: getStatusColor(job.status) }}
                  >
                    {getStatusIcon(job.status)}
                    <span>{job.status}</span>
                  </div>
                  <div
                    className="flex items-center gap-2 text-[13px]"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    <Clock size={14} />
                    <span>{job.duration}</span>
                  </div>
                  <button style={{ color: "var(--color-text-muted)" }}>
                    {selectedJob === job.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {job.progress > 0 && (
                <div className="progress-bar mx-5">
                  <div className="progress-fill" style={{ width: `${job.progress}%` }} />
                </div>
              )}

              {/* Expanded Details */}
              {selectedJob === job.id && (
                <div
                  className="p-5 flex flex-col gap-3"
                  style={{ borderTop: "1px solid var(--color-glass-border)" }}
                >
                  {[
                    [ui.status, job.status],
                    ["Started", job.started],
                    ["Duration", job.duration],
                    ["Progress", `${job.progress}%`],
                    ["Details", job.details],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-4">
                      <span
                        className="text-sm font-medium min-w-[80px]"
                        style={{ color: "var(--color-text-dim)" }}
                      >
                        {label}:
                      </span>
                      <span className="text-sm" style={{ color: "var(--color-text-main)" }}>
                        {value}
                      </span>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-3">
                    {job.status === "Running" && (
                      <>
                        <button className="btn-outline btn-small flex items-center gap-2">
                          <Pause size={16} /> {ui.pause}
                        </button>
                        <button className="btn-outline btn-small flex items-center gap-2">
                          <RotateCcw size={16} /> {ui.cancel}
                        </button>
                      </>
                    )}
                    {job.status === "Failed" && (
                      <button className="btn-primary btn-small flex items-center gap-2">
                        <RefreshCw size={16} /> {ui.retry}
                      </button>
                    )}
                    {job.status === "Pending" && (
                      <button className="btn-primary btn-small flex items-center gap-2">
                        <Zap size={16} /> Start Now
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-4 py-16"
            style={{ color: "var(--color-text-dim)" }}
          >
            <FileText size={48} />
            <h3>{ui.noJobsFound}</h3>
            <p>{ui.tryAdjustingFilters}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobsPage;
