import React, { useRef, useState } from "react";
import { X, Upload, File, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UploadModalProps } from "../../types";
import { assetsService } from "../../services";
import { useToast } from "./ToastProvider";
import { Card } from "./Card";
import { Button } from "./Button";

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // New state for metadata
  const [department, setDepartment] = useState("Marketing");
  const [usageRights, setUsageRights] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleRemoveFile = () => setSelectedFile(null);

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    if (!department || !usageRights) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("department", department);
    formData.append("usageRights", usageRights);
    formData.append("expiryDate", expiryDate);

    try {
      await assetsService.upload(formData, (percent) => {
        setUploadProgress(percent);
      });
      toast("Assets uploaded successfully", "success");
      setSelectedFile(null);
      setUsageRights("");
      setExpiryDate("");
      setUploadProgress(0);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast("Upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg"
          >
            <Card className="shadow-2xl">
              <Card.Header className="flex items-center justify-between border-b border-slate-100 pb-4">
                <Card.HeaderTitle className="flex items-center gap-2">
                  <Upload size={18} className="text-[var(--primary)]" />
                  Upload Digital Assets
                </Card.HeaderTitle>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-8 h-8 p-0"
                  disabled={isUploading}
                >
                  <X size={18} />
                </Button>
              </Card.Header>

              <Card.Body className="space-y-6 pt-6">
                {!selectedFile ? (
                  <div
                    className={`
                      h-[160px] rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border-2 border-dashed
                      ${dragActive ? "border-[var(--primary)] bg-indigo-50/50" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--primary)]">
                      <Upload size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">
                        Drag & drop file here, or{" "}
                        <span className="text-[var(--primary)]">browse</span>
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                        Images, Videos, Audio, PDFs (Max 5GB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[var(--primary)]">
                          <File size={20} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-700 truncate max-w-[240px]">
                            {selectedFile.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                          <span className="flex items-center gap-1">
                            <Loader2 size={10} className="animate-spin" />
                            Ingesting to Vault...
                          </span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[var(--primary)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={isUploading}
                    >
                      <option>Marketing</option>
                      <option>Public Relations</option>
                      <option>Product Design</option>
                      <option>Engineering</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Usage Rights <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none"
                      value={usageRights}
                      onChange={(e) => setUsageRights(e.target.value)}
                      disabled={isUploading}
                    >
                      <option value="">Select Rights</option>
                      <option value="Internal Use Only">Internal Use Only</option>
                      <option value="Public (Royalty Free)">Public (Royalty Free)</option>
                      <option value="Limited (Credit Required)">Limited (Credit Required)</option>
                      <option value="Restricted (License Required)">
                        Restricted (License Required)
                      </option>
                      <option value="Private / NDA">Private / NDA</option>
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>
                </div>
              </Card.Body>

              <div className="p-6 flex gap-3 border-t border-slate-50">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 shadow-lg shadow-indigo-100"
                  disabled={!selectedFile || !usageRights || isUploading}
                  onClick={handleStartUpload}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
