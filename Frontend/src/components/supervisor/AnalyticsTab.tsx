import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import MonthlyAnalysisChart from './MonthlyAnalysisChart';

interface Ticket {
    issueId: string;
    code: string;
    status: string;
    issueDate: string;
    resolvedDate?: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsTab() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/ticket/get-all');
                if (res.data.success) {
                    setTickets(res.data.tickets);
                }
            } catch (error) {
                console.error("Failed to load analytics data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTickets();
    }, []);

    // Summary Metrics
    const metrics = useMemo(() => {
        let resolved = 0;
        let pending = 0;
        let approval = 0;
        const uniqueErrors = new Set();

        tickets.forEach(t => {
            if (t.status === 'resolved') resolved++;
            if (t.status === 'pending') pending++;
            if (t.status === 'approval') approval++;
            if (t.code) uniqueErrors.add(t.code);
        });

        return { resolved, pending, approval, distinctErrors: uniqueErrors.size };
    }, [tickets]);

    // Format Data for Issue Types (Pie/Bar Chart)
    const issueTypesData = useMemo(() => {
        const types: Record<string, number> = {};
        tickets.forEach(ticket => {
            const code = ticket.code || 'Unknown';
            types[code] = (types[code] || 0) + 1;
        });
        return Object.entries(types)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [tickets]);

    const MetricCard = ({ title, value, icon, colorClass }: any) => (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-[var(--shadow-sm)] border border-[var(--border-primary)] flex items-center justify-between transition-shadow hover:shadow-[var(--shadow-md)]">
            <div>
                <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{value}</div>
                <div className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">{title}</div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${colorClass}`}>
                {icon}
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="p-8 text-center text-[var(--text-muted)] italic flex-1 flex items-center justify-center">Loading analytics dashboard...</div>;
    }

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto w-full p-6">

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Resolved" value={metrics.resolved} icon="✓" colorClass="bg-[var(--bg-tertiary)] text-[var(--status-active-color)]" />
                <MetricCard title="Pending Review" value={metrics.pending} icon="🕒" colorClass="bg-[var(--bg-tertiary)] text-[var(--status-resolving-color)]" />
                <MetricCard title="In Approval" value={metrics.approval} icon="📋" colorClass="bg-[var(--bg-tertiary)] text-[var(--accent-primary)]" />
                <MetricCard title="Distinct Errors" value={metrics.distinctErrors} icon="⚠️" colorClass="bg-[var(--bg-tertiary)] text-[#c084fc]" />
            </div>

            {/* Monthly Analysis */}
            <div className="w-full">
                <MonthlyAnalysisChart tickets={tickets} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                {/* Top Issue Types */}
                <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-[var(--shadow-sm)] border border-[var(--border-primary)] flex flex-col h-full">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Top Issue Categories</h3>
                    <div className="w-full h-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={issueTypesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {issueTypesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Empty block to balance layout or for future chart */}
                <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-secondary)] flex flex-col justify-center items-center text-center h-full">
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-2xl shadow-[var(--shadow-sm)] flex items-center justify-center text-[var(--accent-primary)] mb-4 border border-[var(--border-primary)]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Live Insights Active</h3>
                    <p className="text-[var(--text-muted)] max-w-[250px]">Recharts powered rendering engine is processing your OmniSync-2 API queue smoothly.</p>
                </div>
            </div>

        </div>
    );
}
