import React, { useEffect, useState } from "react";
import { AlertTriangle, Files, Clock, TrendingUp } from "lucide-react";
import { useToast } from "../../components/ui/ToastProvider";
import { PageSkeleton } from "../../components/ui/Loader";
import type { DashboardStatsProps } from "../../types";
import { analyticsService, usageService, approvalService, assetsService } from "../../services";
import { Card } from "../../components/ui/Card";

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, usageRes, pendingApprovalsRes, approvalHistoryRes, latestAssetsRes] =
          await Promise.all([
            analyticsService.getOverview(),
            usageService.getLogs({ limit: 10 }),
            approvalService.list({ status: "pending" }),
            approvalService.list({ limit: 10 }),
            assetsService.list({ limit: 5 }),
          ]);

        const rawUsage = usageRes.data.data.result || usageRes.data.data || [];
        const rawApprovals =
          approvalHistoryRes.data.data.result || approvalHistoryRes.data.data || [];
        const rawAssets = latestAssetsRes.data.data.result || latestAssetsRes.data.data || [];
        const pendingCount =
          pendingApprovalsRes.data.totalCount || pendingApprovalsRes.data.data?.length || 0;

        // Merge all activity types for a rich live feed
        const usageActivity = rawUsage.map((log: any) => ({
          id: `u-${log.id}`,
          action: log.action.replace("_", " "),
          target: `Asset ID: ${log.assetsId}`,
          timestamp: new Date(log.loggedAt).toLocaleTimeString(),
          date: new Date(log.loggedAt),
        }));

        const approvalActivity = rawApprovals.map((app: any) => ({
          id: `a-${app.id}`,
          action: `Review ${app.status}`,
          target: `Asset ID: ${app.assetsId}`,
          timestamp: new Date(app.createdAt).toLocaleTimeString(),
          date: new Date(app.createdAt),
        }));

        const uploadActivity = rawAssets.map((asset: any) => ({
          id: `up-${asset.id}`,
          action: "New Upload",
          target: asset.filename,
          timestamp: new Date(asset.createdAt).toLocaleTimeString(),
          date: new Date(asset.createdAt),
        }));

        const recentActivity = [...usageActivity, ...approvalActivity, ...uploadActivity]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 7);

        // Ensure Usage Trends has at least 7 days of data for the chart baseline
        let usageTrends = statsRes.data.data.usageTrends || [];
        if (usageTrends.length < 7) {
          const filledTrends = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            const existing = usageTrends.find((t: any) => t.date === dateStr);
            filledTrends.push(existing || { date: dateStr, count: 0 });
          }
          usageTrends = filledTrends;
        }

        setStats({
          ...statsRes.data.data,
          statusDistribution: {
            ...statsRes.data.data.statusDistribution,
            pending: (statsRes.data.data.statusDistribution?.pending || 0) + pendingCount,
          },
          usageTrends,
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

  const metaCards = React.useMemo(
    () => [
      {
        label: "Total Assets",
        value: stats?.totalAssets?.toLocaleString() || "0",
        icon: Files,
        color: "text-blue-500",
        bg: "bg-blue-50",
        description: "Total assets across all departments",
      },
      {
        label: "Duplicates",
        value: stats?.duplicateCount.toLocaleString() || "0",
        icon: AlertTriangle,
        color: "text-amber-500",
        bg: "bg-amber-50",
        description: "Potential duplicate assets detected",
      },
      {
        label: "Expiring Soon",
        value: stats?.expiredCount?.toString() || "0",
        icon: Clock,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
        description: "Assets reaching their expiry date",
      },
      {
        label: "Risk Assessment",
        value: stats?.complianceScore !== undefined ? `${100 - stats.complianceScore}%` : "0%",
        icon: AlertTriangle,
        color: "text-rose-500",
        bg: "bg-rose-50",
        description: "System compliance risk level",
      },
    ],
    [stats],
  );

  const memoizedTrends = React.useMemo(() => {
    if (!stats?.usageTrends) return [];
    const maxCount = Math.max(...stats.usageTrends.map((t: any) => parseInt(t.count) || 0));
    return stats.usageTrends.map((trend: any) => ({
      ...trend,
      height: maxCount > 0 ? (parseInt(trend.count) / maxCount) * 100 : 0,
    }));
  }, [stats?.usageTrends]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div
      className="space-y-8 animate-in fade-in duration-500"
      role="main"
      aria-label="System Dashboard"
    >
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
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label="Quick Stats"
      >
        {metaCards.map((stat, i) => (
          <Card
            key={i}
            className="p-6 hover:border-gray-300 transition-all group focus-within:ring-2 focus-within:ring-indigo-100"
            aria-label={stat.label}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-md flex items-center justify-center transition-transform group-hover:scale-110 ${stat.bg}`}
                aria-hidden="true"
              >
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <h3 className="text-2xl font-bold text-[var(--text-color)]" title={stat.description}>
              {stat.value}
            </h3>
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
            {memoizedTrends.length > 0 ? (
              <div
                className="h-64 flex items-end gap-2 px-4 pb-8"
                role="img"
                aria-label="Usage trends chart"
              >
                {memoizedTrends.map((trend: any, i: number) => {
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div
                        className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 relative"
                        style={{ height: `${trend.height}%` }}
                        aria-label={`${trend.count} events on ${new Date(trend.date).toLocaleDateString()}`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {trend.count} events
                        </div>
                      </div>
                      <span
                        className="text-[8px] font-bold text-slate-400 uppercase transform -rotate-45 origin-top-left mt-2 whitespace-nowrap"
                        aria-hidden="true"
                      >
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
