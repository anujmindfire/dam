import React, { useState, useEffect } from "react";
import { Folders, X, Check } from "lucide-react";
import { collectionService } from "../../api";
import { useToast } from "../../components/Providers/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import type { CollectionsProps } from "../../types";

interface AddToCollectionModalProps {
  assetId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  assetId,
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
      setCollections(res.data.data.result || []);
    } catch (error) {
      toast("Failed to load collection list", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (collectionId: string) => {
    try {
      await collectionService.addAsset(collectionId, assetId);
      toast("Asset linked to collection", "success");
      onClose();
    } catch (error) {
      toast("Failed to link asset. Already linked?", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Folders size={18} />
            </div>
            <CardTitle className="text-lg">Organize Asset</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col max-h-[400px] overflow-y-auto">
            {collections.length > 0 ? (
              collections.map((col, i) => (
                <button
                  key={col.id}
                  onClick={() => handleAdd(col.id)}
                  className={`px-6 py-4 flex items-center justify-between group hover:bg-blue-600 transition-all text-left ${i < collections.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-white">
                      {col.name}
                    </span>
                    <span className="text-[10px] text-slate-500 group-hover:text-blue-100 uppercase tracking-widest">
                      {col.assetCount || 0} Assets
                    </span>
                  </div>
                  <Check
                    size={16}
                    className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:text-white transition-all transform scale-0 group-hover:scale-100"
                  />
                </button>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm italic">
                {isLoading ? "Synchronizing collection hubs..." : "No collection hubs found."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddToCollectionModal;
