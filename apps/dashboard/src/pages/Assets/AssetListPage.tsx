import React, { useState } from "react";
import {
  Search,
  Grid,
  List,
  FileImage,
  FileVideo,
  FileText,
  Clock,
  CheckCircle2,
  Eye,
  Edit3,
  Download,
  Share2,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { constant } from "@dam/shared";

const { ui } = constant;

const AssetListPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const assets = [
    {
      id: "1",
      name: "SummerCampaign_Hero.jpg",
      type: "Image",
      status: "Approved",
      owner: "Mkt",
      date: "2 days ago",
      size: "2.4 MB",
    },
    {
      id: "2",
      name: "ProductLaunch_Walkthrough.mp4",
      type: "Video",
      status: "Pending",
      owner: "PR",
      date: "5 hours ago",
      size: "156 MB",
    },
    {
      id: "3",
      name: "BrandGuidelines_2026.pdf",
      type: "Document",
      status: "Approved",
      owner: "Design",
      date: "1 week ago",
      size: "12.8 MB",
    },
    {
      id: "4",
      name: "RadioSpot_v1.mp3",
      type: "Audio",
      status: "Under Review",
      owner: "Mkt",
      date: "Yesterday",
      size: "4.2 MB",
    },
    {
      id: "5",
      name: "Q1_Results.pptx",
      type: "Document",
      status: "Approved",
      owner: "Finance",
      date: "3 days ago",
      size: "5.6 MB",
    },
    {
      id: "6",
      name: "Promo_Video_30sec.mp4",
      type: "Video",
      status: "Pending",
      owner: "Marketing",
      date: "Today",
      size: "45 MB",
    },
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || asset.status.toLowerCase().includes(filterStatus);
    const matchesType = filterType === "all" || asset.type.toLowerCase().includes(filterType);
    return matchesSearch && matchesStatus && matchesType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "Image":
        return <FileImage size={24} />;
      case "Video":
        return <FileVideo size={24} />;
      case "Document":
        return <FileText size={24} />;
      default:
        return <FileText size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "#10b981";
      case "Pending":
        return "var(--color-secondary)";
      case "Under Review":
        return "var(--color-accent-purple)";
      default:
        return "var(--color-text-dim)";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="page-title">{ui.assetListTitle}</h1>
          <div className="text-sm" style={{ color: "var(--color-text-dim)" }}>
            {filteredAssets.length} items
          </div>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload size={20} /> {ui.uploadAsset}
        </button>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-5"
          style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="glass w-full max-w-[540px] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-6 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--color-glass-border)" }}
            >
              <h2>{ui.uploadAsset}</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                style={{ color: "var(--color-text-dim)" }}
              >
                <X size={24} />
              </button>
            </div>
            <div
              className="p-6 flex flex-col items-center gap-4 min-h-[180px] rounded-2xl mx-6 mt-6 cursor-pointer"
              style={{ border: "2px dashed var(--color-glass-border)" }}
            >
              <Upload size={40} style={{ color: "var(--color-primary)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Drag and drop files here or click to browse
              </p>
              <small style={{ color: "var(--color-text-dim)" }}>Max 500MB per file</small>
            </div>
            <div
              className="p-6 flex gap-3 justify-end"
              style={{ borderTop: "1px solid var(--color-glass-border)" }}
            >
              <button className="btn-outline" onClick={() => setIsUploadModalOpen(false)}>
                {ui.cancel}
              </button>
              <button className="btn-primary">{ui.uploadAsset}</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3 flex-1 max-w-[400px]">
          <Search size={18} style={{ color: "var(--color-text-dim)" }} />
          <input
            type="text"
            placeholder={ui.filterByName}
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
            <option value="approved">{ui.approved}</option>
            <option value="pending">{ui.pending}</option>
            <option value="review">{ui.underReview}</option>
          </select>
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="image">{ui.image}s</option>
            <option value="video">{ui.video}s</option>
            <option value="document">{ui.document}s</option>
            <option value="audio">{ui.audio}</option>
          </select>
          <div className="glass flex p-1 gap-1">
            <button
              className={`p-1.5 rounded-lg ${viewMode === "grid" ? "text-[var(--color-primary)]" : ""}`}
              style={{
                color: viewMode === "grid" ? "var(--color-primary)" : "var(--color-text-muted)",
                background: viewMode === "grid" ? "var(--color-primary-glow)" : undefined,
              }}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              className={`p-1.5 rounded-lg ${viewMode === "list" ? "text-[var(--color-primary)]" : ""}`}
              style={{
                color: viewMode === "list" ? "var(--color-primary)" : "var(--color-text-muted)",
                background: viewMode === "list" ? "var(--color-primary-glow)" : undefined,
              }}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Assets Grid/List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5"
            : "flex flex-col gap-3"
        }
      >
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={
                viewMode === "grid"
                  ? "glass glass-hover p-4 flex flex-col gap-4"
                  : "glass glass-hover grid grid-cols-[80px_1.5fr_1fr_1fr_1fr_40px] items-center py-3 px-4 relative"
              }
            >
              {/* Preview */}
              <div
                className={`flex items-center justify-center rounded-xl ${viewMode === "grid" ? "h-40" : "h-12 w-12"}`}
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  border: "1px solid var(--color-glass-border)",
                }}
              >
                <div
                  className={`rounded-full flex items-center justify-center ${viewMode === "grid" ? "w-12 h-12" : "w-8 h-8"}`}
                  style={{ background: "var(--color-glass-bg)", color: "var(--color-text-muted)" }}
                >
                  {getIcon(asset.type)}
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-col gap-1">
                <span
                  className="font-semibold text-[15px] truncate"
                  style={{ color: "var(--color-text-main)" }}
                >
                  {asset.name}
                </span>
                <div
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  <span>{asset.type}</span>
                  <span className="opacity-50">•</span>
                  <span>{asset.owner}</span>
                </div>
              </div>

              {/* List-specific info */}
              {viewMode === "list" && (
                <>
                  <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {asset.size}
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {asset.date}
                  </div>
                </>
              )}

              {/* Status */}
              <div className="flex items-center">
                <div
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                  style={{
                    color: getStatusColor(asset.status),
                    backgroundColor: `${getStatusColor(asset.status)}15`,
                  }}
                >
                  {asset.status === "Approved" && <CheckCircle2 size={14} />}
                  {asset.status === "Pending" && <Clock size={14} />}
                  <span>{asset.status}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  className="p-1 rounded"
                  title={ui.view}
                  onClick={() => navigate(`/assets/${asset.id}`)}
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Eye size={18} />
                </button>
                <button
                  className="p-1 rounded"
                  title={ui.edit}
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Edit3 size={18} />
                </button>
                <button
                  className="p-1 rounded"
                  title={ui.download}
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Download size={18} />
                </button>
                <button
                  className="p-1 rounded"
                  title={ui.share}
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-4 py-16"
            style={{ color: "var(--color-text-dim)" }}
          >
            <FileText size={48} />
            <h3>{ui.noAssetsFound}</h3>
            <p>{ui.tryAdjustingFilters}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetListPage;
