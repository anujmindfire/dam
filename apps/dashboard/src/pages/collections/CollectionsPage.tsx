import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Folders, X, Trash2, Eye, ChevronRight, Home } from "lucide-react";
import { collectionService } from "../../services";
import { useToast } from "../../components/ui/ToastProvider";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AppList } from "../../components/ui/AppList";
import type { Column, CollectionsProps } from "../../types";

const CollectionsPage: React.FC = () => {
  const { id: currentParentId } = useParams();
  const navigate = useNavigate();

  const [collections, setCollections] = useState<CollectionsProps[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [parentOptions, setParentOptions] = useState<CollectionsProps[]>([]);
  const [currentCollection, setCurrentCollection] = useState<CollectionsProps | null>(null);

  const [totalCount, setTotalCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | number>("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchCollections();
    fetchAllCollectionsForParent();
    if (currentParentId) {
      fetchCurrentCollection();
      fetchAssetsForCollection();
    } else {
      setCurrentCollection(null);
      setAssets([]);
    }
  }, [page, limit, search, currentParentId]);

  const fetchAssetsForCollection = async () => {
    if (!currentParentId || !currentCollection?.assets) return;
    setAssets(currentCollection.assets);
    setAssetCount(currentCollection.assets.length);
  };

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const res = await collectionService.list({
        page,
        limit,
        searchKey: search,
        parentId: currentParentId,
      });
      const data = res.data?.data?.result || res.data?.data || [];
      const count = res.data?.totalCount || 0;
      setCollections(data);
      setTotalCount(count);
    } catch (error) {
      toast("Failed to load collections", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentCollection = async () => {
    try {
      const res = await collectionService.getById(currentParentId!);
      const data = res.data?.data;
      setCurrentCollection(data);
      if (data?.assets) {
        setAssets(data.assets);
        setAssetCount(data.assets.length);
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchAllCollectionsForParent = async () => {
    try {
      const res = await collectionService.list({ limit: 100 });
      const data = res.data?.data?.result || res.data?.data || [];
      setParentOptions(data);
    } catch (error) {
      throw error;
    }
  };

  const handleCreate = async () => {
    if (!newName) return;
    try {
      let parentId: string | number | null = selectedParentId || currentParentId || null;
      if (parentId === "root") parentId = null;

      await collectionService.create({
        name: newName,
        parentId,
      });
      toast("Collection created successfully", "success");
      setNewName("");
      setSelectedParentId("");
      setIsModalOpen(false);
      fetchCollections();
      fetchAllCollectionsForParent();
    } catch (error) {
      toast("Failed to create collection", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) return;
    try {
      await collectionService.remove(id);
      toast("Collection deleted successfully", "success");
      fetchCollections();
      fetchAllCollectionsForParent();
    } catch (error: any) {
      toast(error.response?.data?.message, "error");
    }
  };

  const columns: Column[] = [
    { id: "name", label: "Name", width: 40, sortable: true },
    { id: "stats", label: "Assets", width: 20, align: "center" },
    { id: "createdAt", label: "Created Date", width: 20, align: "center" },
    { id: "actions", label: "Actions", width: 20, align: "right" },
  ];

  const renderRow = (collection: CollectionsProps, columnId: string) => {
    switch (columnId) {
      case "name":
        return (
          <div
            className="flex items-center gap-3 cursor-pointer group/item"
            onClick={() => navigate(`/collections/${collection.id}`)}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[var(--primary)] border border-indigo-100 shrink-0 group-hover/item:bg-[var(--primary)] group-hover/item:text-white transition-all">
              <Folders size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[var(--text-color)] truncate group-hover/item:text-[var(--primary)] transition-colors">
                {collection.name}
              </span>
              {collection.parentId && !currentParentId && (
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                  Nested Folder
                </span>
              )}
            </div>
          </div>
        );
      case "stats":
        return (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-slate-600">
              {collection.assetCount || 0} Assets
            </span>
            {(collection.subCollections?.length || 0) > 0 && (
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                {collection.subCollections?.length} Sub-folders
              </span>
            )}
          </div>
        );
      case "createdAt":
        return (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {new Date(collection.createdAt).toLocaleDateString()}
          </span>
        );
      case "actions":
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-[var(--primary)]"
              onClick={() => navigate(`/collections/${collection.id}`)}
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(collection.id)}
              className="text-slate-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const addButton = (
    <Button onClick={() => setIsModalOpen(true)} className="px-6">
      Add
    </Button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-tight italic">
              {currentCollection ? currentCollection.name : "Collections"}
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {currentCollection
                ? "Viewing sub-folders and assets within this vault"
                : "Curated groups of assets for rapid retrieval"}
            </p>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <Link
            to="/collections"
            className="flex items-center gap-1.5 hover:text-[var(--primary)] transition-colors"
          >
            <Home size={14} />
            Root
          </Link>
          {currentCollection && (
            <>
              <ChevronRight size={14} className="opacity-40" />
              <span className="text-[var(--primary)]">{currentCollection.name}</span>
            </>
          )}
        </nav>
      </div>

      <AppList
        columns={columns}
        rows={collections}
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

      {/* Assets Section */}
      {currentParentId && (
        <div className="space-y-4 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--text-color)] flex items-center gap-2">
              <Folders size={20} className="text-indigo-500" />
              Assets
              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-bold">
                {assetCount}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-slate-50 rounded-2xl animate-pulse border border-slate-100"
                />
              ))
            ) : assets.length > 0 ? (
              assets.map((assetsData) => (
                <Card key={assetsData.id} className="hover:border-indigo-200 transition-all group">
                  <Card.Body className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Folders size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--text-color)] truncate text-sm">
                        {assetsData.filename}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {assetsData.mimetype}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/assets/${assetsData.id}`)}
                    >
                      <Eye size={16} />
                    </Button>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 italic text-sm">
                No assets found in this vault.
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md">
            <Card.Header className="flex items-center justify-between">
              <Card.HeaderTitle>Add Collection</Card.HeaderTitle>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="w-8 h-8 p-0">
                <X size={18} />
              </Button>
            </Card.Header>
            <Card.Body className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Select Parent
                </label>
                <select
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none"
                  value={selectedParentId || currentParentId || ""}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                >
                  <option value="">
                    {currentParentId ? "Current Folder" : "Select Parent Collection"}
                  </option>
                  {parentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Name <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marketing Assets 2024..."
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 shadow-lg shadow-indigo-100" onClick={handleCreate}>
                  Create
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
