import React, { useState } from "react";
import {
  User,
  Bell,
  Palette,
  Lock,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Camera,
  Shield,
  Mail,
} from "lucide-react";
import { useAuth } from "../../components/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState("dark");

  const [notifications, setNotifications] = useState({
    uploads: true,
    reviews: true,
    expiring: true,
    digest: false,
  });

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Preferences</h1>
        <p className="text-slate-400 mt-1">
          Manage your account settings and global configurations
        </p>
      </div>

      {/* Profile Section */}
      <Card className="border-white/5 bg-slate-900/40">
        <CardHeader className="border-b border-white/5 pb-6">
          <CardTitle className="text-lg font-bold flex items-center gap-3">
            <User className="text-blue-500" size={20} /> Identity & Access
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-bold text-white shadow-2xl overflow-hidden capitalize">
                  {user?.name?.[0] || <User size={40} />}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                  <Camera size={16} />
                </button>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {user?.roleId === 1 ? "Administrator" : "Standard User"}
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <Input defaultValue={user?.name} className="bg-white/5 border-white/5" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <Input defaultValue={user?.email} className="bg-white/5 border-white/5" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Organization Unit
                </label>
                <select className="flex h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                  <option>Marketing Operations</option>
                  <option>Product Design</option>
                  <option>Compliance & Legal</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Language
                </label>
                <select className="flex h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                  <option>English (Global)</option>
                  <option>Spanish (ES)</option>
                  <option>French (FR)</option>
                </select>
              </div>
              <div className="md:col-span-2 mt-4">
                <Button className="px-8 rounded-xl h-11">Save Changes</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout & Aesthetics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-white/5 bg-slate-900/40">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-lg font-bold flex items-center gap-3">
              <Palette className="text-purple-500" size={20} /> Visual Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-bold text-white">Interface Theme</p>
                <p className="text-xs text-slate-500 mt-0.5">Customize your environment</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", icon: Sun, label: "Day" },
                { id: "dark", icon: Moon, label: "Night" },
                { id: "auto", icon: Monitor, label: "System" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${theme === t.id ? "bg-white/10 border-white/10 text-white" : "border-white/5 text-slate-500 hover:border-white/10"}`}
                >
                  <t.icon size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-900/40">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-lg font-bold flex items-center gap-3">
              <Bell className="text-amber-500" size={20} /> Intel Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-5">
            {[
              { key: "uploads", label: "Assets Flow", desc: "Alert me on new repository uploads" },
              { key: "reviews", label: "Action Required", desc: "Notify when review is assigned" },
              {
                key: "expiring",
                label: "Risk Mitigation",
                desc: "Alert before asset rights expire",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between group">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${notifications[item.key as keyof typeof notifications] ? "bg-blue-600" : "bg-slate-800"}`}
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof notifications],
                    }))
                  }
                >
                  <div
                    className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${notifications[item.key as keyof typeof notifications] ? "left-6" : "left-1"}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Enterprise Security */}
      <Card className="border-white/5 bg-slate-900/40">
        <CardHeader className="border-b border-white/5 pb-6">
          <CardTitle className="text-lg font-bold flex items-center gap-3">
            <Lock className="text-rose-500" size={20} /> Security Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {[
              {
                label: "Credentials Management",
                desc: "Update your authentication credentials and encryption keys",
                icon: Shield,
                action: "Update",
              },
              {
                label: "Two-Factor Verification",
                desc: "Enhance account integrity with biometric or OTP layers",
                icon: Mail,
                action: "Configure",
              },
              {
                label: "Active Nodes",
                desc: "Review and manage devices with authorized system access",
                icon: Monitor,
                action: "Manage",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors ${i < 2 ? "border-b border-white/5" : ""}`}
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 group-hover:text-white group-hover:border-white/10 transition-all">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                      {item.label}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-white/5 group-hover:border-white/20 px-4 h-9"
                >
                  {item.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Termination Zone */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold text-rose-500 tracking-tight">System Termination</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md">
            Deactivating your account will immediately revoke all repository access and archive your
            activity telemetry.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={logout}
            className="gap-2 text-slate-400 hover:text-white px-6"
          >
            <LogOut size={18} /> Sign Out
          </Button>
          <Button variant="danger" className="px-6 rounded-xl hover:shadow-rose-600/20">
            Deactivate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
