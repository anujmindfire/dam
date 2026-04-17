import React, { useState, useEffect } from "react";
import { Folders, Plus, Trash2, ExternalLink } from "lucide-react";
import { collectionService } from "../../api";
import { useToast } from "../../components/Providers/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { PageSkeleton } from "../../components/ui/Loader";
import type { CollectionsProps } from "../../types";

const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<CollectionsProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const res = await collectionService.list();
      setCollections(res.data.data.result || []);
    } catch (error) {
      toast("Failed to synchronize collections", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCollectionName.trim()) return;
    try {
      await collectionService.create({ name: newCollectionName });
      toast("Collection spawned successfully", "success");
      setNewCollectionName("");
      setIsModalOpen(false);
      fetchCollections();
    } catch (error) {
      toast("Failed to spawn collection", "error");
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Collections</h1>
          <p className="text-slate-400 mt-1">Logical grouping and hierarchical organization</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 px-6 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> New Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collections.map((collection) => (
          <Card
            key={collection.id}
            className="group hover:bg-white/[0.05] transition-all border-white/5 bg-slate-900/40"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Folders size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-white"
                  >
                    <ExternalLink size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{collection.name}</h3>
              <p className="text-slate-500 text-xs mb-4">
                {collection.description || "No description provided"}
              </p>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {collection.assetCount || 0} Assets
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {new Date(collection.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {collections.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center text-slate-700 mb-4 border border-white/5">
              <Folders size={32} />
            </div>
            <h3 className="text-white font-bold">No Collections Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Start organizing your repository by creating your first collection hub.
            </p>
          </div>
        )}
      </div>

      {/* Simplified Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <Card className="w-full max-w-md border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle>Create Collection</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <input
                autoFocus
                className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Collection Name..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div className="flex gap-3 mt-4">
                <Button className="flex-1" onClick={handleCreate}>
                  Confirm
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
