import React, { useState, useEffect, useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { useToast } from "../../components/Providers/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { PageSkeleton } from "../../components/ui/Loader";
import type { ComplianceIssuesProps } from "../../types";
import { analyticsService, assetsService, metadataService } from "../../api";

const CompliancePage: React.FC = () => {
  const [issues, setIssues] = useState<ComplianceIssuesProps[]>([]);
  const [stats, setStats] = useState<{ riskLevel: string; healthScore: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "expired" | "duplicates">("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompliance = async () => {
      setIsLoading(true);
      try {
        const [complianceRes, duplicatesRes, expiredRes] = await Promise.all([
          analyticsService.getCompliance(),
          metadataService.getDuplicates(),
          assetsService.list({ status: "expired" }),
        ]);

        const combinedIssues: ComplianceIssuesProps[] = [
          ...duplicatesRes.data.data.map((d: any) => ({
            id: `d-${d.id}`,
            asset: `Assets ID: ${d.assetId}`,
            owner: "System Flag",
            type: "duplicates",
            severity: "warning",
            description: "Potential duplicate via hash match",
            action: "Sync",
            date: "Today",
          })),
          ...expiredRes.data.data.result.map((e: any) => ({
            id: `e-${e.id}`,
            asset: e.filename,
            owner: e.owner || "Unassigned",
            type: "expired",
            severity: "critical",
            description: `Rights expired on ${new Date(e.expiryDate).toLocaleDateString()}`,
            action: "Renew",
            date: "Expired",
          })),
        ];

        setIssues(combinedIssues);
        setStats(complianceRes.data.data);
      } catch (error) {
        toast("Governance synchronization failed", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompliance();
  }, []);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => activeTab === "all" || issue.type === activeTab);
  }, [issues, activeTab]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "warning":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Governance & Compliance</h1>
          <p className="text-slate-400 mt-1">Automated risk detection and policy enforcement</p>
        </div>
        <div className="flex gap-4">
          <Card className="px-6 py-3 bg-rose-500/5 border-rose-500/10">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
              Global Risk
            </span>
            <p className="text-xl font-bold text-white leading-none mt-1">
              {stats?.riskLevel || "High"}
            </p>
          </Card>
          <Card className="px-6 py-3 bg-emerald-500/5 border-emerald-500/10">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              Health Score
            </span>
            <p className="text-xl font-bold text-white leading-none mt-1">
              {stats?.healthScore || "94"}%
            </p>
          </Card>
        </div>
      </div>

      {/* Main Table Interface */}
      <Card className="border-white/5 bg-slate-900/40">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5">
            {["all", "expired", "duplicates"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-300"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            className="bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-xl px-6"
          >
            Initialize Audit Scan
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Assets Identification
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Policy Violation
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Resolution
                  </th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Timeline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <tr key={issue.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white tracking-tight">
                            {issue.asset}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Custodian: {issue.owner}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div
                          className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${getSeverityStyles(issue.severity)}`}
                        >
                          {issue.severity}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[13px] text-slate-400 font-medium leading-relaxed">
                          {issue.description}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 text-xs font-bold uppercase tracking-wider"
                        >
                          {issue.action}
                        </Button>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-xs text-slate-500">{issue.date}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <ShieldCheck size={48} className="text-emerald-500/20 mx-auto mb-4" />
                      <h3 className="text-white font-bold">No Governance Issues Detected</h3>
                      <p className="text-slate-500 text-sm mt-1">
                        Selected policy baseline is currently healthy.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Remainder Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <Card className="border-white/5 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Governance Audit Log</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div className="w-1 h-auto bg-blue-600 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-semibold mb-1">
                    Policy Update: PII Protection
                  </p>
                  <p className="text-xs text-slate-500">
                    System updated automated redaction logic for internal documents.
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    <span>Admin: John Doe</span>
                    <span>•</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Policy Health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pt-4">
            <div className="p-8 rounded-3xl bg-slate-950 border border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-white font-bold mb-1">All Systems Validated</h4>
              <p className="text-slate-500 text-xs">
                Continuous monitoring active across 847 assets.
              </p>
              <Button variant="outline" className="mt-6 border-white/10 rounded-xl px-8">
                Refresh Baseline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompliancePage;
