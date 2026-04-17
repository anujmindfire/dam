import React, { useState, useEffect } from "react";
import { CheckSquare, Check, X, Eye, Clock } from "lucide-react";
import { approvalService } from "../../api";
import { useToast } from "../../components/Providers/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { PageSkeleton } from "../../components/ui/Loader";
import type { ApprovalRequestProps } from "../../types";

const ApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<ApprovalRequestProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await approvalService.list();
      setRequests(res.data.data.result || []);
    } catch (error) {
      toast("Failed to load approval requests", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") await approvalService.approve(id);
      else await approvalService.reject(id);

      toast(`Asset ${action}d successfully`, "success");
      fetchRequests();
    } catch (error) {
      toast(`Action failed. Please try again.`, "error");
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Review Inbox</h1>
        <p className="text-slate-400 mt-1">Pending approvals and lifecycle transitions</p>
      </div>

      <div className="flex flex-col gap-4">
        {requests.length > 0 ? (
          requests.map((req) => (
            <Card
              key={req.id}
              className="border-white/5 bg-slate-900/40 hover:bg-white/[0.05] transition-all overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-6 items-center">
                  <div className="p-6 lg:col-span-2 flex items-center gap-4 border-r border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                      <CheckSquare size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate">Request #{req.id.slice(0, 8)}</p>
                      <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1.5 line-clamp-1">
                        <Clock size={12} /> {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 lg:col-span-2 border-r border-white/5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">
                      Status
                    </p>
                    <div
                      className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        req.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : req.status === "rejected"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}
                    >
                      {req.status}
                    </div>
                  </div>

                  <div className="p-6 lg:col-span-2 flex items-center justify-end gap-3 bg-white/[0.01]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white gap-2"
                    >
                      <Eye size={16} /> Preview
                    </Button>
                    {req.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAction(req.id, "approve")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white border-none h-9 px-4 rounded-xl gap-2 font-bold uppercase tracking-widest text-[9px]"
                        >
                          <Check size={14} /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleAction(req.id, "reject")}
                          className="h-9 px-4 rounded-xl gap-2 font-bold uppercase tracking-widest text-[9px]"
                        >
                          <X size={14} /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center text-emerald-500/20 mb-4 border border-white/5 shadow-inner">
              <Check size={32} />
            </div>
            <h3 className="text-white font-bold">Review Queue Clear</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              All assets have been successfully moved through the governance pipeline.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApprovalsPage;
