import React, { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";
import type { ToastProps } from "../../types";

const Toast: React.FC<ToastProps> = ({ id, message, type = "info", onClose }) => {
  useEffect(() => {
    if (type !== "loading") {
      const timer = setTimeout(() => onClose(id), 5000);
      return () => clearTimeout(timer);
    }
  }, [id, type, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
    loading: <Loader2 className="text-blue-500 animate-spin" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
  };

  const colors = {
    success: "border-emerald-500/20 bg-emerald-500/5",
    error: "border-rose-500/20 bg-rose-500/5",
    info: "border-blue-500/20 bg-blue-500/5",
    loading: "border-blue-500/20 bg-blue-500/5",
    warning: "border-amber-500/20 bg-amber-500/5",
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-full duration-300 ${colors[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium text-slate-200 min-w-[200px]">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-slate-500 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
