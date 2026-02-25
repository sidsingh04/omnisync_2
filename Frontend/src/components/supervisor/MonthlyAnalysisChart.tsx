import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface Ticket {
    issueId: string;
    code: string;
    status: string;
    issueDate: string;
    resolvedDate?: string | null;
}

interface MonthlyAnalysisChartProps {
    tickets: Ticket[];
}

export default function MonthlyAnalysisChart({ tickets }: MonthlyAnalysisChartProps) {
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        tickets.forEach(t => {
            if (t.issueDate) {
                const d = new Date(t.issueDate);
                if (!isNaN(d.getTime())) {
                    months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                }
            }
            if (t.resolvedDate) {
                const d = new Date(t.resolvedDate);
                if (!isNaN(d.getTime())) {
                    months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                }
            }
        });
        const sortedMonths = Array.from(months).sort().reverse();
        return sortedMonths;
    }, [tickets]);

    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        if (availableMonths.length > 0) return availableMonths[0];
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Update selected month if it's empty and availableMonths populates
    React.useEffect(() => {
        if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
            setSelectedMonth(availableMonths[0]);
        }
    }, [availableMonths, selectedMonth]);

    const chartData = useMemo(() => {
        if (!selectedMonth) return [];
        const [yearStr, monthStr] = selectedMonth.split('-');
        if (!yearStr || !monthStr) return [];
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1;

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = Array.from({ length: daysInMonth }, (_, i) => ({
            day: String(i + 1),
            raised: 0,
            resolved: 0
        }));

        tickets.forEach(ticket => {
            if (ticket.issueDate) {
                const d = new Date(ticket.issueDate);
                if (d.getFullYear() === year && d.getMonth() === month) {
                    const dayObj = days[d.getDate() - 1];
                    if (dayObj) dayObj.raised++;
                }
            }
            if (ticket.status === 'resolved' && ticket.resolvedDate) {
                const d = new Date(ticket.resolvedDate);
                if (d.getFullYear() === year && d.getMonth() === month) {
                    const dayObj = days[d.getDate() - 1];
                    if (dayObj) dayObj.resolved++;
                }
            }
        });

        return days;
    }, [tickets, selectedMonth]);

    const formatMonthLabel = (monthString: string) => {
        if (!monthString) return '';
        const parts = monthString.split('-');
        if (parts.length < 2) return monthString;
        const [year, month] = parts;
        const d = new Date(parseInt(year), parseInt(month) - 1, 1);
        if (isNaN(d.getTime())) return monthString;
        return d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-[var(--shadow-sm)] border border-[var(--border-primary)] flex flex-col w-full h-full min-h-[450px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] m-0">Monthly Analysis (Day-wise)</h3>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="py-2 px-4 border border-[var(--border-secondary)] rounded-lg text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all font-medium cursor-pointer"
                >
                    {availableMonths.length === 0 && <option value={selectedMonth}>{formatMonthLabel(selectedMonth) || 'Loading...'}</option>}
                    {availableMonths.map(m => (
                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                    ))}
                </select>
            </div>

            <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-secondary)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickMargin={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} allowDecimals={false} tickMargin={10} />
                        <Tooltip
                            cursor={{ fill: 'var(--bg-secondary)' }}
                            contentStyle={{
                                backgroundColor: 'var(--bg-tertiary)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-primary)',
                                boxShadow: 'var(--shadow-md)',
                                color: 'var(--text-primary)'
                            }}
                            labelFormatter={(label) => `Day ${label}, ${formatMonthLabel(selectedMonth)}`}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                        <Bar name="Tickets Raised" dataKey="raised" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                        <Bar name="Tickets Resolved" dataKey="resolved" fill="var(--status-active-color)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
