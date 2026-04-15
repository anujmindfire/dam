import React, { useRef, useState } from "react";
import { X, Upload, File, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-5"
          style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            className="glass w-full max-w-[540px] flex flex-col"
            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div
              className="p-6 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--color-glass-border)" }}
            >
              <h3 className="text-lg" style={{ color: "var(--color-text-main)" }}>
                Upload Digital Asset
              </h3>
              <button onClick={onClose} style={{ color: "var(--color-text-dim)" }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-6">
              {!selectedFile ? (
                <div
                  className={`h-[180px] rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 text-center p-5 ${dragActive ? "" : ""}`}
                  style={{
                    border: `2px dashed ${dragActive ? "var(--color-primary)" : "var(--color-glass-border)"}`,
                    background: dragActive ? "rgba(139, 92, 246, 0.05)" : undefined,
                  }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                >
                  <Upload size={40} style={{ color: "var(--color-primary)" }} />
                  <div>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                      Drag & drop file here, or{" "}
                      <span className="font-semibold" style={{ color: "var(--color-primary)" }}>
                        browse
                      </span>
                    </p>
                    <span className="text-xs block mt-1" style={{ color: "var(--color-text-dim)" }}>
                      Supports Images, Videos, Audio, and PDFs
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <div className="glass flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-[10px] flex items-center justify-center"
                      style={{
                        background: "var(--color-primary-glow)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <File size={24} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-text-main)" }}
                      >
                        {selectedFile.name}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="hover:text-red-500 transition-colors"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    className="text-[13px] font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Department
                  </label>
                  <select className="input-styled">
                    <option>Marketing</option>
                    <option>Public Relations</option>
                    <option>Product Design</option>
                    <option>Engineering</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-[13px] font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Usage Rights
                  </label>
                  <input
                    type="text"
                    className="input-styled"
                    placeholder="e.g. Internal only / Resale..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="p-6 flex gap-3 justify-end"
              style={{ borderTop: "1px solid var(--color-glass-border)" }}
            >
              <button
                className="glass py-2.5 px-5 rounded-[10px]"
                style={{ color: "var(--color-text-muted)" }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button className="btn-primary" disabled={!selectedFile} onClick={onClose}>
                Start Upload
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
