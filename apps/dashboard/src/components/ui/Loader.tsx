import React from "react";

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
  </div>
);

export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner />
      <p className="text-sm font-bold text-[var(--text-color)] uppercase tracking-widest animate-pulse">
        Syncing...
      </p>
    </div>
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`} />
);

export const PageSkeleton: React.FC = () => (
  <div className="flex flex-col gap-8 w-full">
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-48" />
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
