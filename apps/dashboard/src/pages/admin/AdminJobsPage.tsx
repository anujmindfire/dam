import React, { useEffect, useState } from "react";
import { Zap, Clock, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";
import { useToast } from "../../components/ui/ToastProvider";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PageSkeleton } from "../../components/ui/Loader";
import api from "../../services";

const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/jobs");
      setJobs(res.data.data || []);
    } catch (error) {
      toast("Failed to load background operations", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
            Success
          </span>
        );
      case "processing":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">
            Active
          </span>
        );
      case "queued":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-100">
            Queued
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-50 text-slate-500 border border-slate-100">
            Unknown
          </span>
        );
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-tight italic">
            Background Processing
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            System workers and event-driven operations
          </p>
        </div>
        <Button variant="outline" onClick={fetchJobs} className="gap-2">
          <RefreshCcw size={16} /> Refresh Tasks
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <Card.Header className="flex items-center gap-3">
              <Clock size={18} className="text-[var(--primary)]" />
              <Card.HeaderTitle>Active Tasks Queue</Card.HeaderTitle>
            </Card.Header>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Job Type
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Asset
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Started
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[var(--primary)] border border-indigo-100">
                            <Zap size={14} />
                          </div>
                          <span className="text-sm font-bold text-[var(--text-color)] capitalize">
                            {job.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                          {job.target || "System Task"}
                        </span>
                      </td>
                      <td className="px-6 py-5">{getStatusBadge(job.status)}</td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {new Date(job.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {(() => {
                            if (job.status !== "completed" || !job.startedAt || !job.completedAt)
                              return "--";
                            const start = new Date(job.startedAt).getTime();
                            const end = new Date(job.completedAt).getTime();
                            const diffInSeconds = Math.max(0, Math.floor((end - start) / 1000));

                            if (diffInSeconds < 60) return `${diffInSeconds}s`;
                            const mins = Math.floor(diffInSeconds / 60);
                            const secs = diffInSeconds % 60;
                            return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
                          })()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-indigo-600 border-none shadow-xl shadow-indigo-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={120} />
            </div>
            <Card.Body className="relative z-10 text-white">
              <h3 className="text-xl font-bold mb-2">Worker Status</h3>
              <p className="text-indigo-100 text-sm font-medium mb-6">
                Internal systems operating at peak efficiency
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest">Throughput</span>
                  <span className="text-lg font-bold">1.2 GB/s</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest">Active nodes</span>
                  <span className="text-lg font-bold">8 / 12</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Card.HeaderTitle>Health Overview</Card.HeaderTitle>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Message Queue
                  </p>
                  <p className="text-sm font-bold text-emerald-600 uppercase">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Cache Layer
                  </p>
                  <p className="text-sm font-bold text-amber-600 uppercase">Warning (Memory)</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminJobsPage;
