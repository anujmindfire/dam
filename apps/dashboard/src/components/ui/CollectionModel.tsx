import React, { useState, useEffect } from "react";
import { Folders, X, Check } from "lucide-react";
import { collectionService } from "../../services";
import { useToast } from "./ToastProvider";
import { Button } from "./Button";
import { Card } from "./Card";
import type { CollectionsProps, AddToCollectionModalProps } from "../../types";

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  assetsId,
  isOpen,
  onClose,
}) => {
  const [collections, setCollections] = useState<CollectionsProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const res = await collectionService.list();
      setCollections(res.data?.data?.result || res.data?.data || []);
    } catch (error) {
      toast("Failed to load collection list", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (collectionId: string) => {
    try {
      await collectionService.addAsset(collectionId, assetsId);
      toast("Assets linked to collection", "success");
      onClose();
    } catch (error) {
      toast("Failed to link assets. Already linked?", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden border-white/5">
        <Card.Header className="flex flex-row items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[var(--primary)] border border-indigo-100">
              <Folders size={18} />
            </div>
            <Card.HeaderTitle>Organize Assets</Card.HeaderTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </Card.Header>
        <div className="flex flex-col max-h-[400px] overflow-y-auto bg-white">
          {collections.length > 0 ? (
            collections.map((col, i) => (
              <button
                key={col.id}
                onClick={() => handleAdd(col.id)}
                className={`px-8 py-5 flex items-center justify-between group hover:bg-indigo-600 transition-all text-left ${i < collections.length - 1 ? "border-b border-slate-50" : ""}`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-[var(--text-color)] group-hover:text-white transition-colors">
                    {col.name}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-indigo-100 font-bold uppercase tracking-widest transition-colors">
                    {col.assetCount || 0} Assets
                  </span>
                </div>
                <Check
                  size={18}
                  className="text-[var(--primary)] opacity-0 group-hover:opacity-100 group-hover:text-white transition-all transform scale-50 group-hover:scale-100"
                />
              </button>
            ))
          ) : (
            <div className="p-16 text-center text-slate-400 text-sm font-medium italic">
              {isLoading ? "Synchronizing collection hubs..." : "No collection hubs found."}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="px-6 font-bold uppercase text-[10px] tracking-widest"
          >
            Dismiss
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AddToCollectionModal;
