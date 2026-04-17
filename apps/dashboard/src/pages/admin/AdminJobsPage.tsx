import React, { useState, useEffect, useMemo } from "react";
import { Zap, Search, RefreshCw } from "lucide-react";
import { useToast } from "../../components/Providers/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageSkeleton } from "../../components/ui/Loader";
import { usageService } from "../../api";
import type { SystemTasksProps } from "../../types";

const AdminJobsPage: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<SystemTasksProps[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const res = await usageService.getLogs();
        const realJobs: SystemTasksProps[] = res.data.data.map((log: any, i: number) => ({
          id: `JOB-${log.id}`,
          type: log.action.toUpperCase().replace("_", " "),
          asset: log.assetId || "All Systems",
          status: i % 2 === 0 ? "Completed" : "Running",
          started: new Date(log.loggedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          duration: i % 2 === 0 ? "15m" : "--",
          progress: i % 2 === 0 ? 100 : 45,
          details: `System event: ${log.action} performed. Context: ${JSON.stringify(log.context)}`,
        }));
        setJobs(realJobs);
      } catch (error) {
        toast("Failed to load system tasks", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.asset.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || job.status.toLowerCase() === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, filterStatus]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Running":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "Completed":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Failed":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-slate-500 bg-slate-500/5";
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Background Processing</h1>
          <p className="text-slate-400 mt-1">Job Type | Assets | Status | Started | Duration</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 shrink-0 border-white/10"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={18} /> Refresh Pipeline
        </Button>
      </div>

      {/* Control Bar */}
      <Card className="border-none bg-white/5 shadow-none">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <Input
              placeholder="Filter by Type or Assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11"
            />
          </div>
          <select
            className="bg-slate-900/50 border border-white/5 text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none w-full md:w-[200px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Done</option>
            <option value="failed">Failed</option>
          </select>
        </CardContent>
      </Card>

      {/* Jobs Table Layout */}
      <Card className="border-white/5 bg-slate-900/40">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Job Type
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Assets
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Started
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="group hover:bg-white/[0.02] cursor-pointer"
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-950 border border-white/5 text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all">
                            <Zap size={14} />
                          </div>
                          <span className="text-sm font-bold text-white uppercase tracking-tight">
                            {job.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-400 font-medium">{job.asset}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div
                          className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(job.status)}`}
                        >
                          {job.status}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-400">{job.started}</td>
                      <td className="px-6 py-5 text-sm text-white text-right font-medium">
                        {job.duration}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Zap size={32} className="text-slate-800 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No active pipeline events found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobsPage;
