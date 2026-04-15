import React, { useState } from "react";
import { User, Bell, Palette, Lock, Users, LogOut, Sun, Moon, Monitor } from "lucide-react";
import { constant } from "@dam/shared";

const { ui } = constant;

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isDanger?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon,
  children,
  isDanger,
}) => (
  <div
    className={`glass p-8 flex flex-col gap-6 ${isDanger ? "border-2 border-red-500/20 bg-red-500/5" : ""}`}
    style={{ borderRadius: "0.75rem" }}
  >
    <div
      className="flex justify-between items-start gap-4 pb-4"
      style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
    >
      <div className="flex gap-6 items-start flex-1">
        <div className="shrink-0 flex items-center" style={{ color: "var(--color-primary)" }}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {description}
          </p>
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-6">{children}</div>
  </div>
);

const SettingsPage: React.FC = () => {
  const [theme, setTheme] = useState("auto");
  const [notifications, setNotifications] = useState({
    uploads: true,
    reviews: true,
    expiring: true,
    digest: true,
  });
  const [autoApprove, setAutoApprove] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="flex flex-col gap-8 max-w-[900px] mx-auto animate-[fadeIn_0.3s_ease-in]">
      <div>
        <h1 className="page-title">{ui.settingsTitle}</h1>
        <p className="page-subtitle">{ui.settingsSubtitle}</p>
      </div>

      {/* Profile */}
      <SettingsSection
        title={ui.profile}
        description="Update your personal information"
        icon={<User size={24} />}
      >
        <div className="flex flex-col gap-6">
          <div className="flex gap-6 items-end">
            <div
              className="w-[100px] h-[100px] rounded-full overflow-hidden"
              style={{ border: "3px solid var(--color-primary)" }}
            >
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="btn-outline">Change Avatar</button>
          </div>
          {[
            { label: "Name", type: "text", value: "Sarah Chen" },
            { label: "Email", type: "email", value: "sarah.chen@company.com" },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-2">
              <label className="font-semibold text-[15px]">{field.label}</label>
              <input type={field.type} defaultValue={field.value} className="input-styled" />
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[15px]">Department</label>
            <select className="input-styled">
              <option>Marketing</option>
              <option>Sales</option>
              <option>Design</option>
              <option>HR</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[15px]">Role</label>
            <input
              type="text"
              defaultValue="Asset Manager"
              className="input-styled opacity-50 cursor-not-allowed"
              disabled
            />
          </div>
          <button className="btn-primary w-fit">{ui.save}</button>
        </div>
      </SettingsSection>

      {/* Theme */}
      <SettingsSection
        title={ui.theme}
        description="Customize how the interface looks"
        icon={<Palette size={24} />}
      >
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center gap-8">
            <div>
              <h4 className="font-semibold">Theme</h4>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Choose your preferred theme
              </p>
            </div>
            <div className="flex gap-4">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "auto", label: "Auto", icon: Monitor },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all duration-200 ${theme === t.id ? "" : "hover:border-[var(--color-primary)]"}`}
                    style={{
                      border: `2px solid ${theme === t.id ? "var(--color-primary)" : "rgba(255, 255, 255, 0.1)"}`,
                      background: theme === t.id ? "rgba(59, 130, 246, 0.1)" : "transparent",
                      color: theme === t.id ? "var(--color-primary)" : "var(--color-text-muted)",
                    }}
                    onClick={() => handleThemeChange(t.id)}
                  >
                    <Icon size={20} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-px" style={{ background: "rgba(255, 255, 255, 0.1)" }} />
          <div className="flex justify-between items-center gap-8">
            <div>
              <h4 className="font-semibold">Compact Mode</h4>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Reduce spacing for more content
              </p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked={false} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection
        title={ui.notifications}
        description="Control how you receive updates"
        icon={<Bell size={24} />}
      >
        <div className="flex flex-col gap-6">
          {[
            { key: "uploads", label: "Asset Uploads", desc: "Notify when new assets are uploaded" },
            { key: "reviews", label: "Review Requests", desc: "Notify when assets need review" },
            { key: "expiring", label: "Expiring Assets", desc: "Notify about expiring assets" },
            { key: "digest", label: "Weekly Digest", desc: "Receive weekly activity summary" },
          ].map((n) => (
            <div
              key={n.key}
              className="flex justify-between items-center gap-8 p-4 rounded-lg"
              style={{ background: "rgba(255, 255, 255, 0.02)" }}
            >
              <div>
                <h4 className="font-semibold">{n.label}</h4>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {n.desc}
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  defaultChecked={notifications[n.key as keyof typeof notifications]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [n.key]: e.target.checked })
                  }
                />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Security */}
      <SettingsSection
        title={ui.privacy}
        description="Manage your account security"
        icon={<Lock size={24} />}
      >
        <div className="flex flex-col gap-6">
          {[
            {
              title: ui.changePassword,
              desc: "Change your password regularly",
              btn: ui.changePassword,
            },
            {
              title: ui.twoFactorAuth,
              desc: "Add an extra layer of security",
              btn: `${ui.enable} ${ui.twoFactorAuth}`,
            },
            {
              title: "Active Sessions",
              desc: "Manage your logged-in devices",
              btn: `${ui.view} Sessions`,
            },
          ].map((item, i) => (
            <React.Fragment key={item.title}>
              {i > 0 && <div className="h-px" style={{ background: "rgba(255, 255, 255, 0.1)" }} />}
              <div
                className="flex justify-between items-center gap-8 p-4 rounded-lg"
                style={{ background: "rgba(255, 255, 255, 0.02)" }}
              >
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                    {item.desc}
                  </p>
                </div>
                <button className="btn-outline whitespace-nowrap">{item.btn}</button>
              </div>
            </React.Fragment>
          ))}
        </div>
      </SettingsSection>

      {/* Administration */}
      <SettingsSection
        title={ui.administration}
        description="System and team management (Admin only)"
        icon={<Users size={24} />}
      >
        <div className="flex flex-col gap-6">
          {[
            {
              title: "User Management",
              desc: "Add, edit, or remove team members",
              btn: "Manage Users",
            },
            {
              title: "Collections & Permissions",
              desc: "Organize assets and set access levels",
              btn: "Configure Collections",
            },
            {
              title: "Integration Settings",
              desc: "Connect with external services",
              btn: "Manage Integrations",
            },
            {
              title: "Storage & Database",
              desc: "Manage storage quotas and backups",
              btn: "Storage Settings",
            },
          ].map((item, i) => (
            <React.Fragment key={item.title}>
              {i > 0 && <div className="h-px" style={{ background: "rgba(255, 255, 255, 0.1)" }} />}
              <div
                className="flex justify-between items-center gap-8 p-4 rounded-lg"
                style={{ background: "rgba(255, 255, 255, 0.02)" }}
              >
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                    {item.desc}
                  </p>
                </div>
                <button className="btn-outline whitespace-nowrap">{item.btn}</button>
              </div>
            </React.Fragment>
          ))}
          <div className="h-px" style={{ background: "rgba(255, 255, 255, 0.1)" }} />
          <div
            className="flex justify-between items-center gap-8 p-4 rounded-lg"
            style={{ background: "rgba(255, 255, 255, 0.02)" }}
          >
            <div>
              <h4 className="font-semibold">Auto-Approval Rules</h4>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Set rules for automatic asset approval
              </p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                defaultChecked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <div
        className="glass p-8 flex flex-col gap-6 border-2 border-red-500/20"
        style={{ borderRadius: "0.75rem", background: "rgba(239, 68, 68, 0.05)" }}
      >
        <div className="pb-4" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <h3 className="text-lg font-semibold">Danger Zone</h3>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Irreversible actions
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <div
            className="flex justify-between items-center gap-8 p-4 rounded-lg"
            style={{ background: "rgba(239, 68, 68, 0.05)" }}
          >
            <div>
              <h4 className="font-semibold" style={{ color: "#ef4444" }}>
                Logout
              </h4>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Sign out of your account
              </p>
            </div>
            <button className="btn-danger flex items-center gap-2">
              <LogOut size={18} /> Logout
            </button>
          </div>
          <div className="h-px" style={{ background: "rgba(255, 255, 255, 0.1)" }} />
          <div
            className="flex justify-between items-center gap-8 p-4 rounded-lg"
            style={{ background: "rgba(239, 68, 68, 0.05)" }}
          >
            <div>
              <h4 className="font-semibold" style={{ color: "#ef4444" }}>
                Delete Account
              </h4>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Permanently delete your account and all related data
              </p>
            </div>
            <button className="btn-danger">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
