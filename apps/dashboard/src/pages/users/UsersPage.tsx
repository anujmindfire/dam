import React, { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Mail, Shield, ShieldAlert, Clock } from "lucide-react";
import { userService } from "../../api";
import { useToast } from "../../components/Providers/ToastProvider";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { PageSkeleton } from "../../components/ui/Loader";
import type { UserProps } from "../../types";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.list();
      setUsers(res.data.data.result || []);
    } catch (error) {
      toast("Failed to load user hub.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to terminate this user?")) return;
    try {
      await userService.remove(id);
      toast("User terminated successfully", "success");
      fetchUsers();
    } catch (error) {
      toast("Termination failed", "error");
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Team Management</h1>
          <p className="text-slate-400 mt-1">Manage custodial roles and system access</p>
        </div>
        <Button className="gap-2 px-6 shadow-lg shadow-blue-600/20">
          <UserPlus size={20} /> Provision User
        </Button>
      </div>

      <Card className="border-white/5 bg-slate-900/40">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Identiy
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Role
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                          <Users size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{user.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Mail size={12} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.roleId === 1 ? (
                          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
                            <Shield size={14} /> Admin
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                            <ShieldAlert size={14} /> Custodian
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                          user.status === "active"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-slate-400 bg-slate-500/10 border-slate-500/20"
                        }`}
                      >
                        {user.status || "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />{" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Just Now"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </Button>
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

export default UsersPage;
