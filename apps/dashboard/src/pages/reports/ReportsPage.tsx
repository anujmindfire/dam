import React, { useState, useEffect, useMemo } from "react";
import { BarChart3, AlertTriangle, Download, ShieldCheck } from "lucide-react";
import type { DashboardStatsProps } from "../../types";
import { useToast } from "../../components/Providers/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { PageSkeleton } from "../../components/ui/Loader";
import { analyticsService } from "../../api";

const ReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [filterDept, setFilterDept] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [stats, setStats] = useState<DashboardStatsProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await analyticsService.getOverview();
        setStats(res.data.data);
      } catch (error) {
        toast("Failed to load intelligence data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [timeRange, filterDept, filterType]);

  const metaCards = useMemo(
    () => [
      {
        title: "Total Assets",
        value: stats?.totalAssets || "0",
        icon: BarChart3,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        title: "Expired Assets",
        value: stats?.expiredCount || "0",
        icon: AlertTriangle,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
      },
      {
        title: "Redundancy Hub",
        value: stats?.duplicateCount || "0",
        icon: ShieldCheck,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
    ],
    [stats],
  );

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Assets Intelligence Reports
          </h1>
          <p className="text-slate-400 mt-1">Deep-dive repository diagnostics and trend analysis</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 border-white/10 uppercase tracking-widest text-[10px] font-bold"
          >
            <Download size={16} /> Export PDF
          </Button>
          <Button className="gap-2 px-6 rounded-xl uppercase tracking-widest text-[10px] font-bold shadow-lg shadow-blue-600/20">
            Configure Alerts
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <Card className="bg-white/5 border-none shadow-none">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Time Range
            </span>
            <select
              className="bg-slate-900/50 border border-white/5 text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Department
            </span>
            <select
              className="bg-slate-900/50 border border-white/5 text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="marketing">Marketing</option>
              <option value="engineering">Engineering</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Asset Type
            </span>
            <select
              className="bg-slate-900/50 border border-white/5 text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Logic Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Usage Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-between gap-4 p-8 bg-white/[0.01]">
            {[65, 45, 78, 52, 90, 34, 61].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div
                  className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-lg transition-all duration-500 group-hover:to-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Day {i + 1}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {metaCards.map((stat, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon size={18} />
                  </div>
                  <span className="text-sm text-slate-300">{stat.title}</span>
                </div>
                <span className="text-lg font-bold text-white">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Duplication & Detailed Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Detail & Duplication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Dimension
                  </th>
                  <th className="pb-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Growth
                  </th>
                  <th className="pb-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="pb-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">
                    Magnitude
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  {
                    dim: "Global Marketing",
                    growth: "+12.4%",
                    status: "Healthy",
                    magnitude: "84,120",
                  },
                  {
                    dim: "Assets Operations",
                    growth: "+5.1%",
                    status: "Review",
                    magnitude: "32,900",
                  },
                  { dim: "Legal Policy", growth: "-1.2%", status: "Nominal", magnitude: "4,102" },
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-white/[0.01]">
                    <td className="py-4 text-sm font-medium text-white">{row.dim}</td>
                    <td className="py-4 text-sm text-emerald-500">{row.growth}</td>
                    <td className="py-4 text-sm text-slate-400">{row.status}</td>
                    <td className="py-4 text-sm text-white text-right font-bold">
                      {row.magnitude}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
