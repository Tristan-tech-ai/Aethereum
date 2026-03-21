import React, { useState, useMemo } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Area,
    AreaChart,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

/**
 * XPHistoryChart — line/area chart showing XP earned per day.
 *
 * DRD §7.3: Profile Analytics — XP Progress Chart (Recharts LineChart) 30/90 days.
 * PRD §5.2: XP Sources display + trends.
 *
 * Props:
 *   data: Array<{ date: string, xp: number, cumulative?: number, sessions?: number }>
 *   loading?: boolean
 *
 * If no data provided, renders demo data for showcasing.
 */

// ── Period Selector ──

const periods = [
    { key: "7d", label: "7D", days: 7 },
    { key: "30d", label: "30D", days: 30 },
    { key: "90d", label: "90D", days: 90 },
];

// ── Generate demo data (for when API isn't ready) ──

const generateDemoData = (days) => {
    const data = [];
    const now = new Date();
    let cumulative = Math.floor(Math.random() * 2000) + 500;

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayXP =
            Math.random() > 0.2 ? Math.floor(Math.random() * 150 + 20) : 0; // 20% chance of no study
        cumulative += dayXP;
        data.push({
            date: date.toISOString().split("T")[0],
            xp: dayXP,
            cumulative,
            sessions: dayXP > 0 ? Math.floor(Math.random() * 3) + 1 : 0,
        });
    }
    return data;
};

// ── Custom Tooltip ──

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const d = payload[0]?.payload;
    const date = new Date(label + "T00:00:00");
    const formatted = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="bg-dark-elevated border border-border-subtle rounded-md-drd p-3 shadow-lg-drd min-w-[160px]">
            <p className="text-caption text-text-muted mb-1.5">{formatted}</p>
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-body-sm text-text-secondary">
                        XP Earned
                    </span>
                    <span className="text-body-sm font-semibold text-primary-light">
                        +{d?.xp?.toLocaleString() ?? 0}
                    </span>
                </div>
                {d?.sessions != null && (
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-body-sm text-text-secondary">
                            Sessions
                        </span>
                        <span className="text-body-sm font-medium text-text-primary">
                            {d.sessions}
                        </span>
                    </div>
                )}
                {d?.cumulative != null && (
                    <div className="flex items-center justify-between gap-4 pt-1 border-t border-border-subtle">
                        <span className="text-body-sm text-text-secondary">
                            Total XP
                        </span>
                        <span className="text-body-sm font-semibold text-text-primary">
                            {d.cumulative.toLocaleString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Custom Active Dot ──

const ActiveDot = (props) => {
    const { cx, cy } = props;
    return (
        <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="#A78BFA"
            stroke="#0F0F1A"
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 0 4px rgba(167,139,250,0.5))" }}
        />
    );
};

// ── Main Component ──

const XPHistoryChart = ({
    data: propData = null,
    loading = false,
    className = "",
}) => {
    const [period, setPeriod] = useState("30d");

    const selectedDays = periods.find((p) => p.key === period)?.days || 30;

    // Use prop data or generate demo
    const chartData = useMemo(() => {
        if (propData && propData.length > 0) {
            return propData.slice(-selectedDays);
        }
        return generateDemoData(selectedDays);
    }, [propData, selectedDays]);

    // Summary stats
    const totalXP = useMemo(
        () => chartData.reduce((sum, d) => sum + (d.xp || 0), 0),
        [chartData],
    );
    const avgXP = useMemo(
        () => Math.round(totalXP / (chartData.length || 1)),
        [totalXP, chartData],
    );
    const bestDay = useMemo(
        () => Math.max(...chartData.map((d) => d.xp || 0)),
        [chartData],
    );
    const activeDays = useMemo(
        () => chartData.filter((d) => (d.xp || 0) > 0).length,
        [chartData],
    );

    // Format date for x-axis
    const formatDate = (dateStr) => {
        const d = new Date(dateStr + "T00:00:00");
        if (selectedDays <= 7)
            return d.toLocaleDateString("en-US", { weekday: "short" });
        if (selectedDays <= 30)
            return d.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
            });
        return d.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
        });
    };

    // Show every Nth tick to avoid clutter
    const tickInterval = selectedDays <= 7 ? 0 : selectedDays <= 30 ? 4 : 13;

    if (loading) {
        return (
            <div className={`bg-dark-card rounded-md-drd p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-5 w-32 bg-dark-secondary rounded" />
                    <div className="h-[200px] bg-dark-secondary rounded" />
                </div>
            </div>
        );
    }

    return (
        <div
            className={`bg-dark-card rounded-md-drd border border-border-subtle ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary-light" />
                    <h3 className="text-body font-semibold text-text-primary">
                        XP Progress
                    </h3>
                </div>

                {/* Period selector */}
                <div className="flex gap-1 bg-dark-secondary rounded-sm-drd p-0.5">
                    {periods.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={`px-2.5 py-1 rounded-sm-drd text-caption font-medium transition-colors ${
                                period === p.key
                                    ? "bg-primary text-white"
                                    : "text-text-muted hover:text-text-secondary"
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3 px-4 pb-3">
                <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">
                        Total
                    </p>
                    <p className="text-sm font-bold text-primary-light">
                        +{totalXP.toLocaleString()}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">
                        Avg/Day
                    </p>
                    <p className="text-sm font-bold text-text-primary">
                        {avgXP}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">
                        Best Day
                    </p>
                    <p className="text-sm font-bold text-success">+{bestDay}</p>
                </div>
                <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">
                        Active
                    </p>
                    <p className="text-sm font-bold text-text-primary">
                        {activeDays}/{chartData.length}d
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="px-2 pb-4" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="xpGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#A78BFA"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#A78BFA"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1A1A2E"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fill: "#6B7280", fontSize: 10 }}
                            axisLine={{ stroke: "#1A1A2E" }}
                            tickLine={false}
                            interval={tickInterval}
                        />

                        <YAxis
                            tick={{ fill: "#6B7280", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) =>
                                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                            }
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: "#A78BFA30" }}
                        />

                        <Area
                            type="monotone"
                            dataKey="xp"
                            stroke="#A78BFA"
                            strokeWidth={2}
                            fill="url(#xpGradient)"
                            activeDot={<ActiveDot />}
                            dot={false}
                            animationDuration={800}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default XPHistoryChart;
