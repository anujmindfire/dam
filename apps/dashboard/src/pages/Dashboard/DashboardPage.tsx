import React from "react";
import { AlertTriangle, Files, CheckCircle2, Clock, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { constant } from "@dam/shared";

const { ui } = constant;

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

const DashboardPage: React.FC = () => {
  const stats: StatItem[] = [
    { label: ui.assetListTitle, value: "12,480", icon: Files, color: "var(--color-primary)" },
    { label: "Pending Review", value: "42", icon: Clock, color: "var(--color-secondary)" },
    {
      label: "Expiring Soon",
      value: "15",
      icon: AlertTriangle,
      color: "var(--color-accent-purple)",
    },
    { label: "Compliant", value: "98.2%", icon: CheckCircle2, color: "#10b981" },
  ];

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-2">
        <h1 className="page-title">{ui.dashboardTitle}</h1>
        <p className="page-subtitle">{ui.dashboardSubtitle}</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="glass glass-hover flex items-center gap-5 p-6">
            <div
              className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              <stat.icon size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {stat.label}
              </span>
              <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-6 max-xl:grid-cols-1">
        <div className="glass p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3>Usage Trends</h3>
            <button
              className="flex items-center gap-1.5 text-[13px] font-medium"
              style={{ color: "var(--color-primary)" }}
            >
              Detailed Report <ArrowUpRight size={16} />
            </button>
          </div>
          <div
            className="flex-1 min-h-[300px] rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px dashed var(--color-glass-border)",
              color: "var(--color-text-dim)",
            }}
          >
            <div>Usage activity visualization...</div>
          </div>
        </div>

        <div className="glass p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3>Recent Activity</h3>
          </div>
          <div className="flex flex-col gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex gap-4 relative">
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  style={{
                    background: "var(--color-primary)",
                    boxShadow: "0 0 8px var(--color-primary-glow)",
                  }}
                />
                <div className="flex flex-col gap-1">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    New Asset Uploaded
                  </span>
                  <span className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
                    "SummerCampaign_v2.mp4" by Mkt Team
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--color-text-dim)" }}>
                    2 mins ago
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
