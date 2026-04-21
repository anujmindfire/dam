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
    success: <CheckCircle2 className="text-emerald-400" size={18} />,
    error: <AlertCircle className="text-rose-400" size={18} />,
    info: <Info className="text-indigo-400" size={18} />,
    loading: <Loader2 className="text-indigo-400 animate-spin" size={18} />,
    warning: <AlertCircle className="text-amber-400" size={18} />,
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-slate-800
        bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] 
        animate-in slide-in-from-right-full duration-500
      `}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-semibold text-white min-w-[200px] tracking-tight">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-2 p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
