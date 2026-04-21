import React, { useState, useEffect } from "react";
import { Trash2, Edit2, X } from "lucide-react";
import { userService } from "../../services";
import { useToast } from "../../components/ui/ToastProvider";
import type { UserProps } from "../../types";
import { AppList } from "../../components/ui/AppList";
import type { Column } from "../../types";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProps | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [currentPage, limit, searchTerm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.list({
        page: currentPage,
        limit,
        searchKey: searchTerm || undefined,
      });
      const userData = res.data?.data?.result || res.data?.data || [];
      const count = res.data?.totalCount || 0;
      setUsers(userData);
      setTotalCount(count);
    } catch (error: any) {
      toast(error.response?.data?.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (user: UserProps) => {
    setEditingUser(user);
    setEditName(user.name);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await userService.update(editingUser.id, { name: editName });
      toast("User identity updated", "success");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast(error.response?.data?.message, "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.remove(id);
      toast("User deleted successfully", "success");
      fetchUsers();
    } catch (error: any) {
      toast(error.response?.data?.message, "error");
    }
  };

  const columns: Column[] = [
    { id: "name", label: "Name", width: 35, sortable: true },
    { id: "email", label: "Email", width: 35, sortable: true },
    { id: "status", label: "Status", width: 15, align: "center" },
    { id: "actions", label: "Actions", width: 15, align: "right" },
  ];

  const renderRow = (user: UserProps, columnId: string) => {
    switch (columnId) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-[var(--primary)] font-bold text-xs border border-indigo-100">
              {user.name?.charAt(0) || "U"}
            </div>
            <span className="font-bold text-[var(--text-color)]">{user.name}</span>
          </div>
        );
      case "email":
        return <span className="text-slate-500 font-medium">{user.email}</span>;
      case "status": {
        const isActive = user.roleId === 1;
        return (
          <div className="flex items-center justify-center">
            <div
              className={`
              px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
              ${isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200"}
            `}
            >
              {isActive ? "Administrator" : "Standard User"}
            </div>
          </div>
        );
      }
      case "actions": {
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(user)}
              className="text-slate-400 hover:text-[var(--primary)]"
            >
              <Edit2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(user.id)}
              className="text-slate-400 hover:text-rose-500"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-tight italic">
            User Management
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Control access and system roles</p>
        </div>
      </div>

      <AppList
        columns={columns}
        rows={users}
        count={totalCount}
        page={currentPage}
        setPage={setCurrentPage}
        limit={limit}
        setLimit={setLimit}
        loading={isLoading}
        onSearch={setSearchTerm}
        renderRow={renderRow}
      />

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md">
            <Card.Header className="flex items-center justify-between">
              <Card.HeaderTitle>Edit User</Card.HeaderTitle>
              <Button
                variant="ghost"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 p-0"
              >
                <X size={18} />
              </Button>
            </Card.Header>
            <Card.Body className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Name <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 shadow-lg shadow-indigo-100" onClick={handleUpdate}>
                  Update
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      <div className="mt-10 pt-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
        Identity Engine v1.0.4 · DAM Identity
      </div>
    </div>
  );
};

export default UsersPage;
