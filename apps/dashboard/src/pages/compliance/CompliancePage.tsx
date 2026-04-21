import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, History, Info, ExternalLink } from "lucide-react";
import { analyticsService, usageService } from "../../services";
import { useToast } from "../../components/ui/ToastProvider";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PageSkeleton } from "../../components/ui/Loader";

const CompliancePage: React.FC = () => {
  const [complianceData, setComplianceData] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"policy" | "history">("policy");
  const { toast } = useToast();

  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    setIsLoading(true);
    try {
      const [compRes, usageRes] = await Promise.all([
        analyticsService.getCompliance(),
        usageService.getLogs({ limit: 10 }),
      ]);
      setComplianceData(compRes.data.data);
      setActivity(usageRes.data.data.result || usageRes.data.data);
    } catch (error) {
      toast("Failed to load governance intelligence", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-tight italic">
            Governance & Compliance
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Standardized asset auditing and policy enforcement
          </p>
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
          {(["policy", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                ${activeTab === tab ? "bg-white text-[var(--primary)] shadow-sm border border-indigo-100" : "text-slate-500 hover:text-slate-700"}
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-none bg-indigo-600 text-white shadow-xl shadow-indigo-100 lg:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">
            Audit Score
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-bold tracking-tighter">
              {complianceData?.score || 0}%
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000"
              style={{ width: `${complianceData?.score || 0}%` }}
            />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider mt-4 opacity-70">
            System Integrity Validated
          </p>
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex items-center gap-4 p-6 hover:border-indigo-200 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Policy Alerts
              </p>
              <p className="text-2xl font-bold text-[var(--text-color)]">
                {complianceData?.alertsCount || 0}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-6 hover:border-indigo-200 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Approved Assets
              </p>
              <p className="text-2xl font-bold text-[var(--text-color)]">
                {complianceData?.approvedCount || 0}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <Card.Header className="flex items-center gap-3">
            <Info size={18} className="text-[var(--primary)]" />
            <Card.HeaderTitle>Security Audit Findings</Card.HeaderTitle>
          </Card.Header>
          <Card.Body className="space-y-4">
            {complianceData?.violations && complianceData.violations.length > 0 ? (
              complianceData.violations.map((v: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 group hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--text-color)] group-hover:text-[var(--primary)] transition-colors">
                      {v.title}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{v.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <ExternalLink size={16} />
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-[var(--text-color)] text-xl font-bold italic">
                  No Governance Issues Detected
                </h3>
                <p className="text-slate-400 max-w-xs font-medium">
                  All assets currently meet the established system policies
                </p>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header className="flex items-center gap-3">
            <History size={18} className="text-[var(--primary)]" />
            <Card.HeaderTitle>Recent Audit Trail</Card.HeaderTitle>
          </Card.Header>
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
            {activity.length > 0 ? (
              activity.map((log, idx) => (
                <div
                  key={idx}
                  className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="text-sm font-bold text-[var(--text-color)] truncate capitalize">
                      {log.action.replace("_", " ")}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(log.loggedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                    Success
                  </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-400 font-medium">
                No activity recorded
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompliancePage;
