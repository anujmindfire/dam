import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Eye, RefreshCcw } from "lucide-react";
import { approvalService } from "../../services";
import { useToast } from "../../components/ui/ToastProvider";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { AppList } from "../../components/ui/AppList";
import type { Column, ApprovalRequestProps } from "../../types";

const ApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<ApprovalRequestProps[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, [page, limit, search]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await approvalService.list({
        status: "pending",
        page,
        limit,
        search: search || undefined,
      });
      const data = res.data?.data?.result || res.data?.data || [];
      const count = res.data?.totalCount || 0;
      setRequests(data);
      setTotalCount(count);
    } catch (error) {
      toast("Failed to load review queue", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approvalService.approve(id);
      toast("Review verified and approved", "success");
      fetchRequests();
    } catch (error) {
      toast("Verification failed", "error");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await approvalService.reject(id);
      toast("Review rejected", "success");
      fetchRequests();
    } catch (error) {
      toast("Rejection failed", "error");
    }
  };

  const columns: Column[] = [
    { id: "id", label: "Request ID", width: 25 },
    { id: "assetsId", label: "Assets", width: 25 },
    { id: "requesterName", label: "Requested by", width: 20 },
    { id: "status", label: "Status", width: 15, align: "center" },
    { id: "actions", label: "Actions", width: 15, align: "center" },
  ];

  const renderRow = (req: ApprovalRequestProps, columnId: string) => {
    switch (columnId) {
      case "id":
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
              <Clock size={16} />
            </div>
            <span className="font-bold text-[var(--text-color)]">#{req.id.slice(0, 8)}</span>
          </div>
        );
      case "assetsId":
        return (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            ID: {req.assetsId.slice(0, 8)}
          </span>
        );
      case "requesterName":
        return (
          <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
            {req.requesterName || "Internal System"}
          </span>
        );
      case "status":
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">
              Pending
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              onClick={() => navigate(`/assets/${req.assetsId}`)}
              className="w-9 h-9 p-0 text-slate-400 hover:text-[var(--primary)]"
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleApprove(req.id)}
              className="w-9 h-9 p-0 text-slate-400 hover:text-emerald-500"
            >
              <CheckCircle2 size={16} />
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleReject(req.id)}
              className="w-9 h-9 p-0 text-slate-400 hover:text-rose-500"
            >
              <XCircle size={16} />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const syncButton = (
    <Button variant="outline" onClick={fetchRequests} className="gap-2">
      <RefreshCcw size={16} /> Sync Queue
    </Button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-tight italic">
            Review Inbox
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Approve or reject assets pending verification
          </p>
        </div>
      </div>

      <AppList
        columns={columns}
        rows={requests}
        count={totalCount}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        loading={isLoading}
        onSearch={setSearch}
        addButton={syncButton}
        renderRow={renderRow}
      />
    </div>
  );
};

export default ApprovalsPage;
