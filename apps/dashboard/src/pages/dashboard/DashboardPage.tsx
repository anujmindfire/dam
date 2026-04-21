import React, { useEffect, useState } from "react";
import { AlertTriangle, Files, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useToast } from "../../components/ui/ToastProvider";
import { PageSkeleton } from "../../components/ui/Loader";
import type { DashboardStatsProps, ActivityLogsProps } from "../../types";
import { analyticsService, usageService } from "../../services";
import { Card } from "../../components/ui/Card";

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

        const recentActivity: ActivityLogsProps[] = (
          usageRes.data.data.result || usageRes.data.data
        ).map((log: any) => ({
          id: log.id,
          action: log.action.replace("_", " "),
          target: `Assets ID: ${log.assetsId}`,
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
      label: "Storage Used",
      value: stats?.totalStorage ? `${(stats.totalStorage / (1024 * 1024)).toFixed(1)} MB` : "0 MB",
      icon: Files,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Duplicates",
      value: stats?.duplicateCount.toLocaleString() || "0",
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Active Jobs",
      value: stats?.activeJobsCount?.toString() || "0",
      icon: TrendingUp,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Compliance Score",
      value: stats?.complianceScore !== undefined ? `${stats.complianceScore}%` : "0%",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-tight">
            System Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            System active: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metaCards.map((stat, i) => (
          <Card key={i} className="p-6 hover:border-gray-300 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-md flex items-center justify-center transition-transform group-hover:scale-110 ${stat.bg}`}
              >
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <h3 className="text-2xl font-bold text-[var(--text-color)]">{stat.value}</h3>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Trends */}
        <Card className="lg:col-span-2">
          <Card.Header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-[var(--primary)]" />
              <Card.HeaderTitle>Global Usage Trends</Card.HeaderTitle>
            </div>
          </Card.Header>
          <Card.Body>
            {stats?.usageTrends && stats.usageTrends.length > 0 ? (
              <div className="h-64 flex items-end gap-2 px-4 pb-8">
                {stats.usageTrends.map((trend: any, i: number) => {
                  const maxCount = Math.max(
                    ...stats.usageTrends.map((t: any) => parseInt(t.count)),
                  );
                  const height = maxCount > 0 ? (parseInt(trend.count) / maxCount) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div
                        className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 relative"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {trend.count} events
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase transform -rotate-45 origin-top-left mt-2 whitespace-nowrap">
                        {new Date(trend.date).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg bg-gray-50/50">
                <div className="text-center">
                  <TrendingUp size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No usage trends recorded yet</p>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Status Card */}
        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.HeaderTitle>System Status</Card.HeaderTitle>
            </Card.Header>
            <Card.Body className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-transparent hover:border-[var(--border)] transition-all">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-amber-500" />
                  <span className="text-sm font-semibold text-[var(--text-color)]">Pending</span>
                </div>
                <span className="text-xl font-bold text-[var(--text-color)]">
                  {stats?.statusDistribution?.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-transparent hover:border-[var(--border)] transition-all">
                <div className="flex items-center gap-3">
                  <TrendingUp size={18} className="text-blue-500" />
                  <span className="text-sm font-semibold text-[var(--text-color)]">Active</span>
                </div>
                <span className="text-xl font-bold text-[var(--text-color)]">
                  {stats?.statusDistribution?.processing || 0}
                </span>
              </div>
            </Card.Body>
          </Card>

          {/* Recent Activity */}
          <Card>
            <Card.Header>
              <Card.HeaderTitle>Recent Activity</Card.HeaderTitle>
            </Card.Header>
            <Card.Body className="space-y-4 max-h-80 overflow-y-auto">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-color)] truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {activity.target} · {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center font-medium">
                  No recent activity recorded
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="pt-10 text-center text-xs text-gray-400 font-medium">
        Intelligence Engine v1.4.2 · Copyright © Revize 2026
      </div>
    </div>
  );
};

export default DashboardPage;
