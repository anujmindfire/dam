import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Type,
  HardDrive,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  History,
  Tag,
  FileText,
  FileImage,
  FileVideo,
} from "lucide-react";
import { assetsService, metadataService, approvalService } from "../../services";
import { useToast } from "../../components/ui/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageSkeleton } from "../../components/ui/Loader";
import { formatBytes } from "../../utils/format";
import type { AssetsProps, MetadataProps, ApprovalHistoryProps } from "../../types";

const AssetsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [asset, setAsset] = useState<AssetsProps | null>(null);
  const [metadata, setMetadata] = useState<MetadataProps | null>(null);
  const [history, setHistory] = useState<ApprovalHistoryProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAssetDetails(id);
  }, [id]);

  const fetchAssetDetails = async (assetsId: string) => {
    setIsLoading(true);
    try {
      const [assetRes, metaRes, historyRes] = await Promise.all([
        assetsService.getById(assetsId),
        metadataService.getByAssets(assetsId),
        approvalService.history(assetsId),
      ]);
      setAsset(assetRes.data.data);
      setMetadata(metaRes.data.data);
      setHistory(historyRes.data.data.result || historyRes.data.data);
    } catch (error) {
      toast("Failed to load asset dossier", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusTransition = async (newStatus: string) => {
    if (!id) return;
    try {
      await assetsService.transitionStatus(id, newStatus);
      toast(`Status updated to ${newStatus}`, "success");
      fetchAssetDetails(id);
    } catch (error) {
      toast("Status transition failed", "error");
    }
  };

  const handleDownload = () => {
    if (!id) return;
    const token = localStorage.getItem("accessToken");
    window.open(`http://localhost:3004/api/v1/assets/${id}/download?token=${token}`, "_blank");
  };

  const getFileIcon = (type?: string) => {
    if (!type) return <FileText size={48} className="text-indigo-500" />;
    if (type.includes("image")) return <FileImage size={48} className="text-indigo-500" />;
    if (type.includes("video")) return <FileVideo size={48} className="text-indigo-500" />;
    return <FileText size={48} className="text-indigo-500" />;
  };

  if (isLoading || !asset) return <PageSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-10 h-10 p-0 rounded-xl"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-tight">Assets</h1>
            <p className="text-slate-500 text-sm font-medium">
              Ref ID: {String(asset.id).slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button className="gap-2" onClick={handleDownload}>
            <Download size={16} /> Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Preview & Status */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-slate-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
              {asset.type?.includes("image") || asset.mimetype?.includes("image") ? (
                <img
                  src={`http://localhost:3004/api/v1/assets/${asset.id}/download?token=${localStorage.getItem("accessToken")}`}
                  alt={asset.filename}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {getFileIcon(asset.type || asset.mimetype)}
                  <h2 className="text-xl font-bold text-[var(--text-color)] text-center px-6">
                    {asset.filename}
                  </h2>
                </div>
              )}
            </div>
            <Card.Body className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <ShieldCheck size={24} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Current Status
                  </p>
                  <p className="text-lg font-bold text-amber-600 uppercase tracking-tight">
                    {asset.status.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => handleStatusTransition("archived")}>
                  Archive
                </Button>
                <Button onClick={() => handleStatusTransition("approved")}>Verify & Approve</Button>
              </div>
            </Card.Body>
          </Card>

          {/* Activity History */}
          <Card>
            <Card.Header className="flex items-center gap-3">
              <History size={18} className="text-[var(--primary)]" />
              <Card.HeaderTitle>Asset History</Card.HeaderTitle>
            </Card.Header>
            <Card.Body className="space-y-6">
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
                    <div className="flex-1 pb-6 border-b border-slate-50 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-[var(--text-color)] capitalize">
                          {item.status}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">
                        {item.comments || "No remarks provided"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400 font-medium">
                  No governance events recorded
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-8">
          <Card>
            <Card.Header className="flex items-center gap-3">
              <Tag size={18} className="text-[var(--primary)]" />
              <Card.HeaderTitle>File Details</Card.HeaderTitle>
            </Card.Header>
            <Card.Body className="space-y-5">
              {[
                { icon: Type, label: "File Type", value: asset.mimetype },
                { icon: HardDrive, label: "File Size", value: formatBytes(asset.size || 0) },
                {
                  icon: Calendar,
                  label: "Upload Date",
                  value: new Date(asset.createdAt).toLocaleDateString(),
                },
                {
                  icon: User,
                  label: "Uploaded By",
                  value: (asset as any).uploader?.name || "Unknown",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-1.5 group p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-slate-400">
                    <item.icon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--text-color)] font-bold">{item.value}</span>
                </div>
              ))}

              {/* Tags Section */}
              {metadata?.tags && metadata.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <Tag size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Smart Tags
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="bg-rose-50 border-rose-100">
            <Card.Body className="flex flex-col items-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 size={28} />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-rose-900">Danger Zone</h4>
                <p className="text-rose-600/80 text-xs font-medium mt-1">
                  Permanently delete this asset from the repository
                </p>
              </div>
              <Button
                variant="danger"
                className="w-full mt-2 shadow-rose-200"
                onClick={() => {
                  if (confirm("Terminate this asset?")) {
                    assetsService.delete(asset.id).then(() => navigate("/assets"));
                  }
                }}
              >
                Terminate Assets
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssetsDetailPage;
