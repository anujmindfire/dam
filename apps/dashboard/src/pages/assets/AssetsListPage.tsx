import React, { useState, useEffect } from "react";
import { Eye, Download, Trash2, FolderPlus, FileText, FileImage, FileVideo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/ToastProvider";
import { Button } from "../../components/ui/Button";
import type { AssetsProps } from "../../types/index";
import { assetsService } from "../../services";
import { AppList } from "../../components/ui/AppList";
import type { Column } from "../../types";
import AddToCollectionModal from "../../components/ui/CollectionModel";
import UploadModal from "../../components/ui/UploadModal";

const AssetsListPage: React.FC = () => {
  const navigate = useNavigate();

  const [assets, setAssets] = useState<AssetsProps[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedAssetsId, setSelectedAssetsId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchAssets();
  }, [page, limit, search]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const response = await assetsService.list({
        page,
        limit,
        searchKey: search,
      });
      const data = response.data?.data?.result || response.data?.data || [];
      const count = response.data?.totalCount || 0;
      setAssets(data);
      setTotalCount(count);
    } catch (error) {
      toast("Failed to retrieve assets repository", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this assets?")) return;
    try {
      await assetsService.delete(id);
      toast("Assets deleted successfully", "success");
      fetchAssets();
    } catch (error) {
      toast("Failed to delete assets", "error");
    }
  };

  const handleDownload = (id: string) => {
    const token = localStorage.getItem("accessToken");
    window.open(`${import.meta.env.VITE_API_URL}/assets/${id}/download?token=${token}`, "_blank");
  };

  const columns: Column[] = [
    { id: "filename", label: "Name", width: 30, sortable: true },
    { id: "type", label: "Type", width: 10 },
    { id: "status", label: "Status", width: 15, align: "center" },
    { id: "owner", label: "Owner", width: 15, align: "center" },
    { id: "createdAt", label: "Last Updated", width: 15, align: "center" },
    { id: "actions", label: "Actions", width: 15, align: "right" },
  ];

  const getIcon = (type: string | undefined) => {
    if (!type) return <FileText size={18} className="text-indigo-500" />;
    const t = type.toLowerCase();
    if (t.includes("image")) return <FileImage size={18} className="text-indigo-500" />;
    if (t.includes("video")) return <FileVideo size={18} className="text-indigo-500" />;
    return <FileText size={18} className="text-indigo-500" />;
  };

  const renderRow = (assets: AssetsProps, columnId: string) => {
    switch (columnId) {
      case "filename": {
        const isPreviewable =
          assets.mimetype?.includes("image") || assets.mimetype?.includes("video");
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0 overflow-hidden">
              {isPreviewable ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/assets/${assets.id}/thumbnail?token=${localStorage.getItem("accessToken")}`}
                  alt={assets.filename}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as any).style.display = "none";
                    (e.target as any).parentElement.innerHTML =
                      '<div class="text-indigo-500 font-bold text-[10px]">FILE</div>';
                  }}
                />
              ) : (
                getIcon(assets.mimetype || assets.type)
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[var(--text-color)] truncate text-sm">
                {assets.filename}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                ID: {String(assets.id).slice(0, 8)}
              </span>
            </div>
          </div>
        );
      }
      case "type":
        return (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {assets.mimetype.split("/")[1]}
          </span>
        );
      case "status": {
        const s = assets.status.toLowerCase();
        let statusStyle = "bg-slate-50 text-slate-500 border-slate-200";
        if (s === "approved") statusStyle = "bg-emerald-50 text-emerald-600 border-emerald-100";
        if (s.includes("pending")) statusStyle = "bg-amber-50 text-amber-600 border-amber-100";

        return (
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusStyle}`}
          >
            {assets.status.replace("_", " ")}
          </span>
        );
      }
      case "owner":
        return (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {(assets as any).uploader?.name || assets.owner || "System"}
          </span>
        );
      case "createdAt":
        return (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {new Date(assets.createdAt).toLocaleDateString()}
          </span>
        );
      case "actions": {
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/assets/${assets.id}`)}
              className="text-slate-400 hover:text-[var(--primary)]"
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedAssetsId(assets.id)}
              className="text-slate-400 hover:text-[var(--primary)]"
            >
              <FolderPlus size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(assets.id)}
              className="text-slate-400 hover:text-[var(--primary)]"
            >
              <Download size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(assets.id)}
              className="text-slate-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const addButton = (
    <Button onClick={() => setIsUploadModalOpen(true)} className="px-6">
      Upload
    </Button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-tight italic">
            Assets
          </h1>
        </div>
      </div>

      <AppList
        columns={columns}
        rows={assets}
        count={totalCount}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        loading={isLoading}
        onSearch={setSearch}
        addButton={addButton}
        renderRow={renderRow}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchAssets}
      />

      <AddToCollectionModal
        isOpen={!!selectedAssetsId}
        assetsId={selectedAssetsId || ""}
        onClose={() => setSelectedAssetsId(null)}
      />
    </div>
  );
};

export default AssetsListPage;
