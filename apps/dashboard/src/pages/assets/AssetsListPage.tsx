import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Grid,
  List,
  FileImage,
  FileVideo,
  FileText,
  Eye,
  Download,
  Upload,
  X,
  Plus,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Providers/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageSkeleton } from "../../components/ui/Loader";
import type { AssetsProps } from "../../types/index";
import { assetsService } from "../../api";
import AddToCollectionModal from "../../components/modals/AddToCollectionModal";

const AssetsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [assets, setAssets] = useState<AssetsProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const { toast } = useToast();

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchAssets();
  }, [filterStatus, filterType]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const response = await assetsService.list({
        status: filterStatus === "all" ? undefined : filterStatus,
        type: filterType === "all" ? undefined : filterType,
      });
      setAssets(response.data.data.result);
    } catch (error) {
      toast("Failed to retrieve assets repository", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      await assetsService.upload(formData);
      toast("Assets uploaded successfully", "success");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      fetchAssets();
    } catch (error) {
      toast("Assets upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to terminate this asset hub?")) return;
    try {
      await assetsService.delete(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast("Asset terminated successfully", "success");
    } catch (error) {
      toast("Failed to terminate asset", "error");
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) =>
      asset.filename.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [assets, debouncedSearch]);

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("image")) return <FileImage className="text-blue-400" />;
    if (t.includes("video")) return <FileVideo className="text-purple-400" />;
    if (t.includes("pdf") || t.includes("doc")) return <FileText className="text-emerald-400" />;
    return <FileText className="text-slate-400" />;
  };

  if (isLoading) return <PageSkeleton />;

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (s === "pending" || s === "pending_approval")
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (s === "under review" || s === "reviewed")
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Assets</h1>
          <p className="text-slate-400 mt-1">Filter | Search | Upload</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="w-full sm:w-auto gap-2">
          <Plus size={20} /> Upload Assets
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border-none shadow-none bg-white/5">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:max-w-md group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <select
              className="bg-slate-900/50 border border-white/5 text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[140px]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="archived">Archived</option>
            </select>

            <select
              className="bg-slate-900/50 border border-white/5 text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[140px]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>

            <div className="flex bg-slate-900/50 border border-white/5 rounded-xl p-1 shrink-0">
              <button
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid size={18} />
              </button>
              <button
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
                onClick={() => setViewMode("list")}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Display */}
      {filteredAssets.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
              : "flex flex-col gap-3"
          }
        >
          {viewMode === "list" && (
            <div className="hidden lg:grid grid-cols-6 px-6 py-3 bg-white/5 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <div className="col-span-2">Name</div>
              <div>Type</div>
              <div>Status</div>
              <div>Owner</div>
              <div className="text-right">Last Updated</div>
            </div>
          )}
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className={`group hover:bg-white/[0.05] transition-all duration-300 ${viewMode === "list" ? "p-0 overflow-hidden" : ""}`}
            >
              <CardContent
                className={
                  viewMode === "grid" ? "p-4" : "p-4 grid lg:grid-cols-6 items-center gap-6"
                }
              >
                {/* Preview/Thumbnail */}
                <div
                  className={`${viewMode === "grid" ? "h-48 w-full mb-4" : "h-12 w-12 col-span-1 lg:col-span-1"} bg-slate-900/80 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors overflow-hidden relative`}
                >
                  <div className="text-slate-500 transform group-hover:scale-110 transition-transform duration-500">
                    {getIcon(asset.type)}
                  </div>
                  {viewMode === "grid" && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => navigate(`/assets/${asset.id}`)}
                      >
                        <Eye size={18} />
                      </Button>
                      <Button
                        size="icon"
                        variant="danger"
                        className="rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white border-rose-500/20"
                        onClick={() => handleDelete(asset.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => setSelectedAssetId(asset.id)}
                      >
                        <FolderPlus size={18} />
                      </Button>
                      <Button size="icon" variant="secondary" className="rounded-full">
                        <Download size={18} />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div
                  className={`${viewMode === "grid" ? "flex flex-col gap-3" : "lg:col-span-5 grid lg:grid-cols-5 items-center gap-4"}`}
                >
                  <div className={`${viewMode === "grid" ? "" : "lg:col-span-1 min-w-0"}`}>
                    <h3 className="text-white font-semibold truncate" title={asset.filename}>
                      {asset.filename}
                    </h3>
                    {viewMode === "grid" && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{asset.mimetype}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-xs text-slate-500">{asset.size}</span>
                      </div>
                    )}
                  </div>

                  {viewMode === "list" && (
                    <>
                      <div className="text-sm text-slate-400 capitalize">
                        {asset.type.split("/")[0]}
                      </div>
                      <div>
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(asset.status)}`}
                        >
                          {asset.status}
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">{asset.owner || "Mkt"}</div>
                      <div className="text-sm text-slate-500 text-right">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </div>
                    </>
                  )}

                  {viewMode === "grid" && (
                    <div className="flex items-center justify-between lg:justify-end gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-400"
                        onClick={() => setSelectedAssetId(asset.id)}
                      >
                        <FolderPlus size={16} />
                      </Button>
                      <div
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(asset.status)}`}
                      >
                        {asset.status}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 mb-2">
            <Search size={32} />
          </div>
          <h3 className="text-white text-lg font-semibold">No assets found</h3>
          <p className="text-slate-500 max-w-xs">
            Try adjusting your search query or filters to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("all");
              setFilterType("all");
            }}
            className="mt-4"
          >
            Clear all filters
          </Button>
        </Card>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <Card className="w-full max-w-lg border-white/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
              <div>
                <CardTitle>Upload New Assets</CardTitle>
                <p className="text-slate-500 text-sm mt-1">Store assets securely in your vault</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsUploadModalOpen(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              {!uploadFile ? (
                <div
                  className="group border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer relative"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) setUploadFile(e.dataTransfer.files[0]);
                  }}
                >
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => e.target.files?.[0] && setUploadFile(e.target.files[0])}
                  />
                  <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Upload size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium">Click to upload or drag and drop</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Images, Videos, Documents (Max 512MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-2xl p-6 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{uploadFile.name}</p>
                      <p className="text-slate-500 text-xs">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setUploadFile(null)}>
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button className="w-full" isLoading={isUploading} onClick={handleUpload}>
                      Confirm Upload
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setUploadFile(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add To Collection Modal */}
      <AddToCollectionModal
        isOpen={!!selectedAssetId}
        assetId={selectedAssetId || ""}
        onClose={() => setSelectedAssetId(null)}
      />
    </div>
  );
};

export default AssetsListPage;
