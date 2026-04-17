import React, { useEffect, useState } from "react";
import { AlertTriangle, Files, CheckCircle2, Clock, ArrowUpRight, TrendingUp } from "lucide-react";
import { useToast } from "../../components/Providers/ToastProvider";
import { PageSkeleton } from "../../components/ui/Loader";
import type { DashboardStatsProps, ActivityLogsProps } from "../../types";
import { analyticsService, usageService } from "../../api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, usageRes] = await Promise.all([
          analyticsService.getOverview(),
          usageService.getLogs({ limit: 5 }),
        ]);

        const recentActivity: ActivityLogsProps[] = usageRes.data.data.map((log: any) => ({
          id: log.id,
          action: log.action.replace("_", " "),
          target: `Assets ID: ${log.assetId}`,
          timestamp: new Date(log.loggedAt).toLocaleTimeString(),
        }));

        setStats({
          ...statsRes.data.data,
          recentActivity,
        });
      } catch (error) {
        toast("Failed to load dashboard intelligence", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <PageSkeleton />;

  const metaCards = [
    {
      label: "Total Assets",
      value: stats?.totalAssets.toLocaleString() || "0",
      icon: Files,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Duplicate Risk",
      value: stats?.duplicateCount.toLocaleString() || "0",
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Expiring Rights",
      value: stats?.expiredCount.toLocaleString() || "0",
      icon: Clock,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      label: "Trust Score",
      value: stats?.complianceScore !== undefined ? `${stats.complianceScore}%` : "0%",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Assets Overview Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Real-time repository analytics and health monitor</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-all flex items-center gap-2">
            <Clock size={16} /> History
          </button>
          <button className="px-5 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
            Generate Report <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metaCards.map((stat, i) => (
          <Card key={i} className="group hover:bg-white/[0.05] transition-all">
            <CardContent className="p-6 flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}
              >
                <stat.icon size={26} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white mt-0.5">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Usage Trends Chart</CardTitle>
            <button className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
              View Detailed Report <ArrowUpRight size={16} />
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <div className="text-center">
                <TrendingUp size={48} className="text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">Synchronizing trend data...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Status */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm text-slate-300">Pending Assets</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {stats?.statusDistribution?.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-slate-300">Active Processing</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {stats?.statusDistribution?.processing || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 group">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 relative" />
                    <div className="absolute top-4 bottom-[-24px] left-[4px] w-[1px] bg-white/10 group-last:hidden" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-white">{activity.action}</span>
                    <span className="text-[12px] text-slate-400">"{activity.target}"</span>
                    <span className="text-[10px] text-slate-500 mt-1">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
