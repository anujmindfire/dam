import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Eye, RefreshCcw } from "lucide-react";
import { approvalService } from "../../services";
import { useToast } from "../../components/ui/ToastProvider";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { AppList } from "../../components/ui/AppList";
import { Card } from "../../components/ui/Card";
import type { Column, ApprovalRequestProps } from "../../types";

const ApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<ApprovalRequestProps[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

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

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectingId) return;
    if (!rejectionReason.trim()) {
      toast("Please provide a reason for rejection", "error");
      return;
    }

    try {
      await approvalService.reject(rejectingId, rejectionReason);
      toast("Review rejected", "success");
      setIsRejectModalOpen(false);
      setRejectingId(null);
      fetchRequests();
    } catch (error) {
      toast("Rejection failed", "error");
    }
  };

  const columns: Column[] = [
    { id: "assetsId", label: "Asset Details", width: 35 },
    { id: "requesterName", label: "Requested by", width: 20 },
    { id: "status", label: "Status", width: 15, align: "center" },
    { id: "id", label: "Request ID", width: 15, align: "center" },
    { id: "actions", label: "Actions", width: 15, align: "right" },
  ];

  const renderRow = (req: ApprovalRequestProps, columnId: string) => {
    switch (columnId) {
      case "assetsId":
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 shrink-0">
              <Eye size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[var(--text-color)] truncate text-sm">
                {(req as any).assets?.filename || `Asset #${req.assetsId}`}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                ID: {String(req.assetsId).slice(0, 8)}
              </span>
            </div>
          </div>
        );
      case "requesterName":
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700">
              {req.requesterName || "Internal System"}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Automatic Trigger
            </span>
          </div>
        );
      case "status":
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">
                Pending
              </span>
            </div>
          </div>
        );
      case "id":
        return (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block">
            REQ-{String(req.id).padStart(4, "0")}
          </span>
        );
      case "actions":
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/assets/${req.assetsId}`)}
              className="w-8 h-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-200 outline-none"
              title="View Asset"
              aria-label={`View details for asset ${req.assetsId}`}
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleApprove(req.id)}
              className="w-8 h-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-200 outline-none"
              title="Approve"
              aria-label={`Approve request for asset ${req.assetsId}`}
            >
              <CheckCircle2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRejectClick(req.id)}
              className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 focus:ring-2 focus:ring-rose-200 outline-none"
              title="Reject"
              aria-label={`Reject request for asset ${req.assetsId}`}
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
    <Button
      variant="outline"
      onClick={fetchRequests}
      className="gap-2 focus:ring-2 focus:ring-slate-200 outline-none"
      aria-label="Synchronize review queue"
    >
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

      {isRejectModalOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
        >
          <Card className="w-full max-w-md shadow-2xl border-rose-100">
            <Card.Header className="bg-rose-50/50 border-b border-rose-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600"
                  aria-hidden="true"
                >
                  <XCircle size={18} />
                </div>
                <Card.HeaderTitle id="reject-modal-title" className="text-rose-900">
                  Reject Approval
                </Card.HeaderTitle>
              </div>
            </Card.Header>
            <Card.Body className="p-6 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="rejection-reason"
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  Rejection Reason (Required)
                </label>
                <textarea
                  id="rejection-reason"
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all resize-none"
                  placeholder="Explain why this asset is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  autoFocus
                  required
                  aria-required="true"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 focus:ring-2 focus:ring-slate-100 outline-none"
                  onClick={() => setIsRejectModalOpen(false)}
                  aria-label="Cancel rejection"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 focus:ring-2 focus:ring-rose-300 outline-none"
                  onClick={confirmReject}
                  aria-label="Confirm asset rejection"
                >
                  Confirm Rejection
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;
