import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  History,
  ShieldAlert,
  Edit3,
  FileVideo,
  FileImage,
  FileText,
  Lock,
  User,
  ExternalLink,
  Clock,
  Music,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../components/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/Providers/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { PageSkeleton } from "../../components/ui/Loader";
import type { AssetsDetailProps, ActivityLogsProps } from "../../types";
import { approvalService, assetsService, metadataService, usageService } from "../../api";

const AssetsDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [asset, setAsset] = useState<AssetsDetailProps | null>(null);
  const [logs, setLogs] = useState<ActivityLogsProps[]>([]);
  const [detailedMeta, setDetailedMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      setIsLoading(true);
      try {
        const [assetRes, metaRes, logsRes] = await Promise.all([
          assetsService.getById(id!),
          metadataService.getByAssets(id!),
          usageService.getLogs({ assetId: id, limit: 10 }),
        ]);

        setAsset(assetRes.data.data);
        setDetailedMeta(metaRes.data.data);
        setLogs(
          logsRes.data.data.map((l: any) => ({
            id: l.id,
            action: l.action.replace("_", " "),
            target: l.assetId ? `Assets ID: ${l.assetId}` : "System",
            timestamp: new Date(l.loggedAt).toLocaleString(),
          })),
        );
      } catch (error) {
        toast("Failed to load assets intelligence", "error");
        navigate("/assets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssetDetails();
  }, [id, navigate]);

  const metadataItems = useMemo(
    () => [
      { label: "Custodian", value: asset?.owner || "Unassigned", icon: User },
      { label: "Status", value: asset?.status || "Pending", icon: ShieldAlert },
      { label: "Usage Rights", value: asset?.usageRights || "Standard", icon: Lock },
      { label: "Business Unit", value: asset?.department || "General", icon: FileText },
      { label: "Resource Size", value: asset?.size || "Unknown", icon: ExternalLink },
      {
        label: "Chronology",
        value: asset ? new Date(asset.createdAt).toLocaleDateString() : "",
        icon: Clock,
      },
    ],
    [asset],
  );

  const handleUpdate = async () => {
    if (!asset) return;
    try {
      await assetsService.update(id!, {
        filename: asset.filename,
        status: asset.status,
      });
      toast("Asset hub synchronized", "success");
      setIsEditing(false);
    } catch (error) {
      toast("Failed to update asset integrity", "error");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await assetsService.transitionStatus(id!, newStatus);
      toast(`Asset transitioned to ${newStatus}`, "success");
      setAsset((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error) {
      toast("Status transition failed", "error");
    }
  };

  const handleRequestApproval = async () => {
    try {
      await approvalService.request({ assetId: id! });
      toast("Approval request dispatched", "success");
      handleStatusChange("under_review");
    } catch (error) {
      toast("Failed to dispatch approval request", "error");
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (!asset) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Assets Details</h1>
          <p className="text-slate-400 mt-1">Preview Area | Metadata</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/assets")}
            className="gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} /> Library
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl">
            <Download size={18} />
          </Button>
          <Button
            className={`gap-2 px-6 rounded-xl shadow-lg transition-all ${isEditing ? "bg-emerald-600 shadow-emerald-600/20" : "bg-blue-600 shadow-blue-600/20"}`}
            onClick={isEditing ? handleUpdate : () => setIsEditing(true)}
          >
            <Edit3 size={18} /> {isEditing ? "Save Hub" : "Edit Hub"}
          </Button>
        </div>
      </div>

      {/* Top Section: Preview & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview Area */}
        <Card className="lg:col-span-2 overflow-hidden border-white/5 bg-slate-900/40 shadow-2xl flex flex-col">
          <div className="aspect-video flex items-center justify-center relative bg-gradient-to-br from-slate-900 to-black p-12">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-2xl">
                {asset.mimetype.toLowerCase().includes("video") ? (
                  <FileVideo size={48} />
                ) : asset.mimetype.toLowerCase().includes("image") ? (
                  <FileImage size={48} />
                ) : asset.mimetype.toLowerCase().includes("audio") ? (
                  <Music size={48} />
                ) : asset.mimetype.toLowerCase().includes("sheet") ||
                  asset.mimetype.toLowerCase().includes("csv") ? (
                  <FileSpreadsheet size={48} />
                ) : (
                  <FileText size={48} />
                )}
              </div>
              {isEditing ? (
                <div className="flex flex-col gap-4 w-full max-w-sm">
                  <input
                    className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-white text-center font-bold outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={asset.filename}
                    onChange={(e) => setAsset({ ...asset, filename: e.target.value })}
                  />
                </div>
              ) : (
                <h2 className="text-xl font-bold text-white text-center px-6">{asset.filename}</h2>
              )}
            </div>
          </div>

          <div className="p-6 bg-white/[0.02] border-t border-white/5 flex flex-wrap items-center gap-4">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mr-2">
              Lifecycle Actions
            </p>
            {asset.status === "pending" && (
              <Button
                size="sm"
                onClick={handleRequestApproval}
                className="bg-amber-600/20 hover:bg-amber-600 text-amber-500 hover:text-white border-none h-8 px-4 rounded-lg text-[10px] uppercase font-bold tracking-widest"
              >
                Request Review
              </Button>
            )}
            {user?.roleId === 1 &&
              ["pending", "under_review", "reviewed"].includes(asset.status) && (
                <div className="flex gap-2 ml-4 pl-4 border-l border-white/10">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("approved")}
                    className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white border-none h-8 px-4 rounded-lg text-[10px] uppercase font-bold tracking-widest"
                  >
                    Quick Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("rejected")}
                    variant="danger"
                    className="h-8 px-4 rounded-lg text-[10px] uppercase font-bold tracking-widest"
                  >
                    Reject
                  </Button>
                </div>
              )}
            {["pending", "approved"].includes(asset.status) && (
              <Button
                size="sm"
                onClick={() => handleStatusChange("archived")}
                variant="ghost"
                className="h-8 px-4 rounded-lg text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-white"
              >
                Archive Hub
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <input
                type="file"
                id="version-upload"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const fd = new FormData();
                    fd.append("file", file);
                    try {
                      await assetsService.uploadVersion(id!, fd);
                      toast("New version synchronized", "success");
                      window.location.reload();
                    } catch (err) {
                      toast("Version synchronization failed", "error");
                    }
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => document.getElementById("version-upload")?.click()}
                variant="outline"
                className="h-8 px-4 rounded-lg text-[10px] uppercase font-bold tracking-widest border-white/10 text-slate-400"
              >
                Spawn New Version
              </Button>
            </div>
          </div>
        </Card>

        {/* Metadata Sidebar */}
        <Card className="border-white/5 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {metadataItems.map((item, i) => (
                <div
                  key={i}
                  className={`px-6 py-4 flex items-center justify-between group hover:bg-white/[0.02] ${i < metadataItems.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-400">
                    <item.icon size={16} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-sm text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
            {detailedMeta?.tags && detailedMeta.tags.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">
                  System Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {detailedMeta.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Versions | Activity | Usage History */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Versions */}
        <Card className="border-white/5 bg-slate-900/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Assets Versions</CardTitle>
            <History className="text-slate-500" size={18} />
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {asset.versions.map((v, i) => (
                <div
                  key={v.id}
                  className={`p-4 flex items-center gap-4 hover:bg-white/[0.03] ${i < asset.versions.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    V{v.versionNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">
                      {v.note || "No comments"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {v.author} • {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-400 text-xs">
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity & Usage History */}
        <Card className="border-white/5 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Activity & Usage History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div
                    key={log.id}
                    className={`p-4 flex items-center justify-between group hover:bg-white/[0.02] ${i < logs.length - 1 ? "border-b border-white/5" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-200 capitalize">{log.action}</p>
                        <p className="text-[11px] text-slate-500">{log.target}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      {log.timestamp}
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-48 flex items-center justify-center p-6 text-center">
                  <p className="text-slate-500 text-sm italic">
                    No recent activity detected for this asset hub.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetsDetailPage;
