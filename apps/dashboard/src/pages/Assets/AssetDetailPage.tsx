import React from "react";
import {
  ArrowLeft,
  Download,
  History,
  Share2,
  ShieldAlert,
  Edit3,
  Trash2,
  FileVideo,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { constant } from "@dam/shared";

const { ui } = constant;

const AssetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const asset = {
    id: id || "2",
    name: "ProductLaunch_Walkthrough.mp4",
    type: "Video",
    status: "Pending Review",
    owner: "PR Team (Alex)",
    department: "Corporate Communications",
    size: "156.4 MB",
    dimensions: "1920x1080",
    duration: "02:45",
    uploaded: "Today, 10:21 AM",
    rights: "Internal Use Only",
    expiry: "2027-12-31",
    versions: [
      { id: "v3", date: "Today, 10:21 AM", note: "Final color grading", user: "Alex" },
      { id: "v2", date: "Yesterday, 04:30 PM", note: "Added transitions", user: "Alex" },
      { id: "v1", date: "2 days ago", note: "Initial upload", user: "Sarah" },
    ],
  };

  const handleBack = () => navigate("/assets");

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-sm hover:text-[var(--color-text-main)]"
          style={{ color: "var(--color-text-muted)" }}
          onClick={handleBack}
        >
          <ArrowLeft size={20} /> Back to Assets
        </button>
        <div className="flex gap-3">
          <button className="glass p-2 rounded-[10px]" style={{ color: "var(--color-text-muted)" }}>
            <Share2 size={18} />
          </button>
          <button className="glass p-2 rounded-[10px]" style={{ color: "var(--color-text-muted)" }}>
            <Download size={18} />
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Edit3 size={18} /> Edit Metadata
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-[1fr_340px] gap-6 items-start max-lg:grid-cols-1">
        <div className="flex flex-col gap-6">
          {/* Preview */}
          <div className="glass w-full aspect-video flex items-center justify-center relative overflow-hidden">
            <div
              className="flex flex-col items-center gap-4"
              style={{ color: "var(--color-text-dim)" }}
            >
              <span
                className="absolute top-5 left-5 text-xs font-semibold py-1 px-3 rounded-md text-white"
                style={{ background: "var(--color-primary)" }}
              >
                {asset.type}
              </span>
              <div>
                <FileVideo size={64} style={{ color: "var(--color-primary)", opacity: 0.5 }} />
              </div>
              <h3>{asset.name}</h3>
              <p>Preview rendering in progress...</p>
            </div>
          </div>

          {/* Detail Sections */}
          <div className="grid grid-cols-[1.2fr_1fr] gap-6 max-lg:grid-cols-1">
            {/* Version History */}
            <div className="glass p-6 flex flex-col gap-5">
              <div
                className="flex items-center justify-between"
                style={{ color: "var(--color-text-main)" }}
              >
                <h3>Version History</h3>
                <History size={18} />
              </div>
              <div className="flex flex-col gap-4">
                {asset.versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-4 p-3 rounded-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--color-glass-border)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{
                        background: "var(--color-glass-bg)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {v.id}
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-main)" }}
                      >
                        {v.note}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                        by {v.user} • {v.date}
                      </span>
                    </div>
                    <button
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div className="glass p-6 flex flex-col gap-5">
              <div
                className="flex items-center justify-between"
                style={{ color: "var(--color-text-main)" }}
              >
                <h3>Usage & Compliance</h3>
                <ShieldAlert size={18} />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                    Usage Rights
                  </span>
                  <span className="text-[15px]" style={{ color: "var(--color-text-main)" }}>
                    {asset.rights}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                    Expiry Date
                  </span>
                  <span
                    className="text-[15px] font-semibold"
                    style={{ color: "var(--color-accent-purple)" }}
                  >
                    {asset.expiry}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className="glass p-6 flex flex-col gap-8 sticky"
          style={{ top: "calc(var(--header-height) + 40px)" }}
        >
          <div>
            <h3 className="text-base mb-5" style={{ color: "var(--color-text-main)" }}>
              Lifecycle State
            </h3>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5 text-[15px] font-medium">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: "var(--color-secondary)",
                    boxShadow: "0 0 10px var(--color-secondary-glow)",
                  }}
                />
                <span>{asset.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="py-2.5 rounded-lg text-[13px] font-semibold"
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    border: "1px solid var(--color-glass-border)",
                  }}
                >
                  {ui.approve}
                </button>
                <button
                  className="py-2.5 rounded-lg text-[13px] font-semibold"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "1px solid var(--color-glass-border)",
                  }}
                >
                  {ui.reject}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base mb-5" style={{ color: "var(--color-text-main)" }}>
              Metadata
            </h3>
            <div className="flex flex-col gap-3">
              {[
                ["ID", asset.id],
                ["Owner", asset.owner],
                ["Dept", asset.department],
                ["Created", asset.uploaded],
                ["File Size", asset.size],
                ["Resolution", asset.dimensions],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between pb-3"
                  style={{ borderBottom: "1px solid var(--color-glass-border)" }}
                >
                  <span className="text-[13px]" style={{ color: "var(--color-text-dim)" }}>
                    {label}
                  </span>
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <button
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-[10px]"
              style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.05)" }}
            >
              <Trash2 size={16} /> {ui.delete} Asset
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AssetDetailPage;
