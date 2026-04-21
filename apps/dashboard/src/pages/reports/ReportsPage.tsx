import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, PieChart, Download, RefreshCcw } from "lucide-react";
import { analyticsService } from "../../services";
import { useToast } from "../../components/ui/ToastProvider";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PageSkeleton } from "../../components/ui/Loader";

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: "Last 30 Days",
    department: "All Departments",
    assetType: "All Asset Types",
  });
  const { toast } = useToast();

  // Memoized stats cards data
  const statsCards = React.useMemo(
    () => [
      {
        label: "Total Assets",
        value: stats?.totalAssets || 0,
        icon: BarChart3,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        description: "Total number of assets in the repository",
      },
      {
        label: "Storage Used",
        value: stats?.totalStorage
          ? `${(stats.totalStorage / (1024 * 1024)).toFixed(1)} MB`
          : "0 MB",
        icon: TrendingUp,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        description: "Total disk space consumed by assets",
      },
      {
        label: "Active Jobs",
        value: stats?.activeJobsCount?.toString() || "0",
        icon: RefreshCcw,
        color: "text-amber-600",
        bg: "bg-amber-50",
        description: "Background processing jobs currently running",
      },
      {
        label: "Compliance Score",
        value: stats?.complianceScore !== undefined ? `${stats.complianceScore}%` : "0%",
        icon: PieChart,
        color: "text-blue-600",
        bg: "bg-blue-50",
        description: "Percentage of assets meeting governance standards",
      },
    ],
    [stats],
  );

  // Memoized trends calculation
  const memoizedTrends = React.useMemo(() => {
    if (!stats?.usageTrends) return [];
    const maxCount = Math.max(...stats.usageTrends.map((t: any) => parseInt(t.count) || 0));
    return stats.usageTrends.map((trend: any) => ({
      ...trend,
      height: maxCount > 0 ? (parseInt(trend.count) / maxCount) * 100 : 0,
    }));
  }, [stats?.usageTrends]);

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [statsRes] = await Promise.all([analyticsService.getOverview(filters)]);
      setStats(statsRes.data.data);
    } catch (error) {
      toast("Failed to load intelligence stats", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await analyticsService.triggerReport();
      const reportData = res.data.data;

      if (reportData?.downloadUrl) {
        window.open(reportData.downloadUrl, "_blank");
        toast("Intelligence report downloaded successfully!", "success");
      }

      fetchStats();
    } catch (error) {
      toast("Failed to export intelligence report", "error");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-tight italic">
            Asset Intelligence Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            System-wide usage analytics and distribution metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
            value={filters.timeRange}
            onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
            aria-label="Filter by Time Range"
          >
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>All Time</option>
          </select>
          <select
            className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            aria-label="Filter by Department"
          >
            <option>All Departments</option>
            <option>Marketing</option>
            <option>PR</option>
            <option>Engineering</option>
          </select>
          <select
            className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
            value={filters.assetType}
            onChange={(e) => setFilters({ ...filters, assetType: e.target.value })}
            aria-label="Filter by Asset Type"
          >
            <option>All Asset Types</option>
            <option>Images</option>
            <option>Videos</option>
            <option>Documents</option>
          </select>
          <Button
            className="gap-2 shadow-lg shadow-indigo-200 ml-3"
            onClick={handleExport}
            isLoading={isExporting}
            aria-label="Generate and export a new intelligence report"
          >
            <Download size={16} /> Export Intelligence
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => (
          <Card
            key={idx}
            className="p-6 hover:border-indigo-200 transition-all group focus-within:ring-2 focus-within:ring-indigo-100"
            role="region"
            aria-label={stat.label}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${stat.bg} ${stat.color}`}
                aria-hidden="true"
              >
                <stat.icon size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <h3 className="text-2xl font-bold text-[var(--text-color)]" title={stat.description}>
              {stat.value}
            </h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <Card.Header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-[var(--primary)]" />
              <Card.HeaderTitle>Global Engagement Trends</Card.HeaderTitle>
            </div>
            <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
              <button className="px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-white text-[var(--primary)] shadow-sm">
                Usage
              </button>
              <button className="px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase text-slate-400 hover:text-slate-600">
                Storage
              </button>
            </div>
          </Card.Header>
          <Card.Body>
            {memoizedTrends.length > 0 ? (
              <div
                className="h-80 flex items-end gap-3 px-6 pb-10"
                role="img"
                aria-label="Usage trend chart"
              >
                {memoizedTrends.map((trend: any, i: number) => {
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                      <div
                        className="w-full bg-indigo-600 rounded-t-2xl transition-all duration-700 hover:bg-indigo-500 relative shadow-lg shadow-indigo-100"
                        style={{ height: `${trend.height}%` }}
                        aria-label={`${trend.count} events on ${new Date(trend.date).toLocaleDateString()}`}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                          {trend.count} Events
                        </div>
                      </div>
                      <span
                        className="text-[9px] font-bold text-slate-400 uppercase transform -rotate-45 origin-top-left mt-2 whitespace-nowrap"
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
              <div className="h-80 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                <div className="text-center">
                  <BarChart3 size={48} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                    No intelligence trends found yet
                  </p>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header className="flex items-center gap-3">
            <PieChart size={18} className="text-[var(--primary)]" />
            <Card.HeaderTitle>Distribution</Card.HeaderTitle>
          </Card.Header>
          <Card.Body className="space-y-6">
            <div className="flex items-center justify-center py-10 relative">
              <div className="w-40 h-40 rounded-full border-8 border-indigo-500 border-t-slate-100 animate-spin duration-[3000ms]" />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-[var(--text-color)]">84%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Efficiency
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {stats?.mimetypeDistribution && stats.mimetypeDistribution.length > 0 ? (
                stats.mimetypeDistribution.map((item: any, idx: number) => {
                  const percentage = Math.round((parseInt(item.count) / stats.totalAssets) * 100);
                  return (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[150px]">
                          {item.mimetype || "Unknown"}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--text-color)]">
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-xs text-slate-400 font-medium italic">
                  No distribution data available
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
