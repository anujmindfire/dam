import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className="animate-spin text-blue-500" size={32} />
  </div>
);

export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner />
      <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">
        Syncing Repository...
      </p>
    </div>
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-white/5 animate-pulse rounded-xl ${className}`} />
);

export const PageSkeleton: React.FC = () => (
  <div className="flex flex-col gap-8 w-full">
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-12 w-48" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Skeleton className="lg:col-span-2 h-[400px]" />
      <Skeleton className="h-[400px]" />
    </div>
  </div>
);
