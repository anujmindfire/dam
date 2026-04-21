import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  History,
  FileText,
  FileImage,
  FileVideo,
  Briefcase,
  Scale,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { assetsService, metadataService, approvalService, usageService } from "../../services";
import { useToast } from "../../components/ui/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageSkeleton } from "../../components/ui/Loader";
import type { AssetsDetailProps, MetadataProps, ApprovalHistoryProps } from "../../types";

const AssetsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assets, setAssets] = useState<AssetsDetailProps | null>(null);
  const [metadata, setMetadata] = useState<MetadataProps | null>(null);
  const [history, setHistory] = useState<ApprovalHistoryProps[]>([]);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"versions" | "activity" | "usage">("activity");

  useEffect(() => {
    if (id) fetchAssetDetails(id);
  }, [id]);

  const fetchAssetDetails = async (assetsId: string) => {
    setIsLoading(true);
    try {
      const [assetRes, metaRes, historyRes, usageRes] = await Promise.all([
        assetsService.getById(assetsId),
        metadataService.getByAssets(assetsId),
        approvalService.history(assetsId),
        usageService.getLogs({ assetsId }),
      ]);
      setAssets(assetRes.data.data);
      setMetadata(metaRes.data.data);
      setHistory(historyRes.data.data.result || historyRes.data.data);
      setUsageLogs(usageRes.data.data.result || usageRes.data.data);
    } catch (error) {
      toast("Failed to load assets", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusTransition = async (newStatus: string) => {
    if (!id) return;
    try {
      if (newStatus === "approved") {
        // Try to find a pending approval request first
        const historyRes = await approvalService.history(id);
        const pendingRequest = (historyRes.data.data.result || historyRes.data.data).find(
          (r: any) => r.status === "pending",
        );

        if (pendingRequest) {
          await approvalService.approve(pendingRequest.id);
          toast("Formal review verified and approved", "success");
        } else {
          // Direct transition if no request exists
          await assetsService.transitionStatus(id, newStatus);
          toast(`Status updated to ${newStatus}`, "success");
        }
      } else {
        await assetsService.transitionStatus(id, newStatus);
        toast(`Status updated to ${newStatus}`, "success");
      }
      fetchAssetDetails(id);
    } catch (error) {
      toast("Action failed", "error");
    }
  };

  const handleDownload = () => {
    if (!id) return;
    const token = localStorage.getItem("accessToken");
    window.open(`${import.meta.env.VITE_API_URL}/assets/${id}/download?token=${token}`, "_blank");
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast("Link copied to clipboard", "success");
  };

  const getFileIcon = (type?: string) => {
    if (!type) return <FileText size={48} className="text-indigo-500" />;
    if (type.includes("image")) return <FileImage size={48} className="text-indigo-500" />;
    if (type.includes("video")) return <FileVideo size={48} className="text-indigo-500" />;
    return <FileText size={48} className="text-indigo-500" />;
  };

  if (isLoading || !assets) return <PageSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            size="icon"
            className="rounded-xl border-slate-200 text-slate-600 hover:text-indigo-600"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-tight italic">
              Asset Details
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Ref ID: {String(assets.id).slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleShare}>
            <Share2 size={16} /> Share
          </Button>
          <Button className="gap-2" onClick={handleDownload}>
            <Download size={16} /> Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Preview Area */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-full min-h-[400px] flex flex-col">
            <div className="flex-1 bg-slate-50 flex items-center justify-center relative overflow-hidden group">
              {assets.type?.includes("image") || assets.mimetype?.includes("image") ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/assets/${assets.id}/thumbnail?token=${localStorage.getItem("accessToken")}`}
                  alt={assets.filename}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    (e.target as any).src =
                      `${import.meta.env.VITE_API_URL}/assets/${assets.id}/download?token=${localStorage.getItem("accessToken")}&disposition=inline`;
                  }}
                />
              ) : assets.type?.includes("video") || assets.mimetype?.includes("video") ? (
                <video
                  src={`${import.meta.env.VITE_API_URL}/assets/${assets.id}/download?token=${localStorage.getItem("accessToken")}&disposition=inline`}
                  poster={`${import.meta.env.VITE_API_URL}/assets/${assets.id}/thumbnail?token=${localStorage.getItem("accessToken")}`}
                  controls
                  className="w-full h-full object-contain p-4"
                />
              ) : assets.type?.includes("pdf") || assets.mimetype?.includes("pdf") ? (
                <iframe
                  src={`${import.meta.env.VITE_API_URL}/assets/${assets.id}/download?token=${localStorage.getItem("accessToken")}&disposition=inline#toolbar=0`}
                  className="w-full h-full border-0"
                  title={assets.filename}
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {getFileIcon(assets.type || assets.mimetype)}
                  <h2 className="text-xl font-bold text-[var(--text-color)] text-center px-6">
                    {assets.filename}
                  </h2>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Core Metadata */}
        <div className="space-y-8">
          <Card>
            <Card.Header className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-[var(--primary)]" />
              <Card.HeaderTitle>Metadata & Rights</Card.HeaderTitle>
            </Card.Header>
            <Card.Body className="space-y-6">
              {[
                {
                  icon: User,
                  label: "Owner",
                  value: (assets as any).uploader?.name || assets.owner || "Unknown",
                },
                {
                  icon: Clock,
                  label: "Status",
                  value: assets.status.replace("_", " "),
                  color: assets.status === "approved" ? "text-emerald-600" : "text-amber-600",
                },
                {
                  icon: Scale,
                  label: "Usage Rights",
                  value: assets.usageRights || "Not Specified",
                },
                {
                  icon: Briefcase,
                  label: "Department",
                  value: assets.department || metadata?.department || "Unassigned",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50/50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <item.icon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold capitalize ${item.color || "text-slate-700"}`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                {assets.status !== "approved" && (
                  <Button
                    className="w-full shadow-lg shadow-indigo-100"
                    onClick={() => handleStatusTransition("approved")}
                  >
                    Verify & Approve
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusTransition("archived")}
                >
                  Move to Archive
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="bg-rose-50 border-rose-100">
            <Card.Body className="py-6 px-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <Trash2 size={20} />
                </div>
                <h4 className="font-bold text-rose-900">Danger Zone</h4>
              </div>
              <Button
                variant="danger"
                className="w-full shadow-rose-200"
                onClick={() => {
                  if (confirm("Terminate this assets?")) {
                    assetsService.delete(assets.id).then(() => navigate("/assets"));
                  }
                }}
              >
                Terminate Assets
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Tabs for Versions, Activity, Usage History */}
      <Card>
        <div className="flex border-b border-slate-100 px-8">
          {[
            { id: "activity", label: "Governance Activity", icon: ShieldCheck },
            { id: "versions", label: "Version History", icon: History },
            { id: "usage", label: "Usage History", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-5 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id
                  ? "text-[var(--primary)]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        <Card.Body className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === "activity" && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      {idx !== history.length - 1 && (
                        <div className="absolute left-[17px] top-10 bottom-0 w-0.5 bg-slate-100" />
                      )}
                      <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 z-10">
                        {item.status === "approved" ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <Clock size={16} className="text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-[var(--text-color)] capitalize">
                            {item.status.replace("_", " ")}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium italic">
                          {item.comments || "System-generated transition"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-slate-400 font-medium italic">
                    No governance activity recorded
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "versions" && (
              <motion.div
                key="versions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {assets.versions && assets.versions.length > 0 ? (
                  assets.versions.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-indigo-200 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500 font-bold">
                          v{v.versionNumber}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            Revision {v.versionNumber}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {new Date(v.createdAt).toLocaleString()} · Author: {v.author}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-white rounded-full text-[9px] font-bold uppercase text-slate-400 border border-slate-100 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                        Stable
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-slate-400 font-medium italic">
                    This is the initial version of the asset
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "usage" && (
              <motion.div
                key="usage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {usageLogs.length > 0 ? (
                  usageLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                          <TrendingUp size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 capitalize">
                            {log.action.replace("_", " ")}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {new Date(log.loggedAt).toLocaleString()} · External Access
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 rounded-full text-[9px] font-bold uppercase text-emerald-600 border border-emerald-100">
                        Verified
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-slate-400 font-medium italic">
                    No external usage events tracked yet
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AssetsDetailPage;
