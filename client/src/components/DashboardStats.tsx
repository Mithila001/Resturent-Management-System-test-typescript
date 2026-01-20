import React from "react";
import "./DashboardStats.css";

/**
 * DashboardStats Component
 *
 * A reusable component for displaying dashboard statistics with a consistent design.
 * Used in Owner and Manager dashboards.
 *
 * @example
 * ```tsx
 * <DashboardStats
 *   stats={[
 *     {
 *       icon: "💰",
 *       title: "Total Revenue",
 *       value: "$50,000",
 *       change: { value: "+12%", type: "positive" },
 *       variant: "primary"
 *     },
 *     {
 *       icon: "📦",
 *       title: "Total Orders",
 *       value: 1234,
 *       subtext: "All time orders"
 *     }
 *   ]}
 *   layout="grid"
 * />
 * ```
 */

export interface StatCardData {
  icon: string;
  title: string;
  value: string | number;
  subtext?: string;
  change?: {
    value: string;
    type: "positive" | "negative" | "neutral";
  };
  submetrics?: Array<{
    label: string;
    value: string | number;
  }>;
  variant?: "primary" | "default";
}

interface DashboardStatsProps {
  stats: StatCardData[];
  layout?: "grid" | "compact";
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, layout = "grid" }) => {
  const formatValue = (value: string | number): string => {
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value;
  };

  const formatChange = (input: string, type?: "positive" | "negative" | "neutral"): string => {
    // extract first percent-like token (e.g. "12.5%")
    const match = input.match(/(\d+(?:[\.,]\d+)?%)/);
    const pct = match ? match[1].trim() : input;
    if (type === "positive") return `↑ ${pct}`;
    if (type === "negative") return `↓ ${pct}`;
    return pct;
  };

  return (
    <div className={`dashboard-stats ${layout === "compact" ? "compact-layout" : "grid-layout"}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`dashboard-stat-card stat-card ${stat.variant === "primary" ? "primary-card" : ""}`}
        >
          <div className="stat-content">
            <div className="stat-header">
              <div className="stat-title">{stat.title}</div>
              {stat.change && (
                <div className={`stat-change ${stat.change.type}`}>
                  {formatChange(stat.change.value, stat.change.type)}
                </div>
              )}
            </div>

            <div className="stat-value">{formatValue(stat.value)}</div>

            {stat.subtext && <div className="stat-subtext">{stat.subtext}</div>}

            {stat.submetrics && stat.submetrics.length > 0 && (
              <div className="stat-submetrics">
                {stat.submetrics.map((metric, idx) => (
                  <span key={idx}>
                    {metric.label}: {formatValue(metric.value)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
