import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import AgentDetailsModal from './AgentDetailsModal';

interface Agent {
    agentId: string;
    name: string;
    status: string;
    totalPending: number;
    totalResolved: number;
    pendingApprovals: number;
}

export default function AgentsTab() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAgents = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/agent/getAllAgents');
            if (res.data.success) {
                setAgents(res.data.agents);
            }
        } catch (error) {
            console.error("Error fetching agents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [searchQuery]);

    // Derived Metrics
    const metrics = useMemo(() => {
        return {
            total: agents.length,
            available: agents.filter(a => a.status === 'Available').length,
            break: agents.filter(a => a.status === 'Break').length,
            offline: agents.filter(a => a.status === 'Offline').length,
            busy: agents.filter(a => a.status === 'Busy').length
        };
    }, [agents]);

    // Filtering
    const filteredAgents = useMemo(() => {
        if (!debouncedSearchQuery) return agents;
        const lower = debouncedSearchQuery.toLowerCase();
        return agents.filter(a =>
            a.name?.toLowerCase().includes(lower) ||
            a.agentId?.toLowerCase().includes(lower) ||
            a.status?.toLowerCase().includes(lower)
        );
    }, [agents, debouncedSearchQuery]);

    const MetricCard = ({ title, value, colorClass, icon }: any) => (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-[var(--shadow-sm)] border border-[var(--border-primary)] flex items-center gap-4 cursor-default transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${colorClass}`}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-2xl font-bold text-[var(--text-primary)]">{value}</span>
                <span className="text-sm text-[var(--text-secondary)] font-medium">{title}</span>
            </div>
        </div>
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-[var(--status-active-bg)] text-[var(--status-active-color)] border-[var(--status-active-border)]';
            case 'Busy': return 'bg-[var(--status-resolving-bg)] text-[var(--status-resolving-color)] border-[var(--status-resolving-border)]';
            case 'Break': return 'bg-[var(--status-pending-bg)] text-[var(--status-pending-color)] border-[var(--status-pending-border)]';
            default: return 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-secondary)]';
        }
    };

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-[var(--status-active-color)]';
            case 'Busy': return 'bg-[var(--status-resolving-color)]';
            case 'Break': return 'bg-[var(--status-pending-color)]';
            default: return 'bg-gray-500';
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-[var(--text-muted)] italic flex-1 flex items-center justify-center">Loading agents pool...</div>;
    }

    return (
        <div className="flex flex-col gap-6 overflow-y-auto p-6">

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <MetricCard title="Total Agents" value={metrics.total} colorClass="bg-[var(--bg-tertiary)] text-[var(--accent-primary)]" icon="👥" />
                <MetricCard title="Available Agents" value={metrics.available} colorClass="bg-[var(--status-active-bg)] text-[var(--status-active-color)]" icon="✓" />
                <MetricCard title="On Break" value={metrics.break} colorClass="bg-[var(--status-pending-bg)] text-[var(--status-pending-color)]" icon="☕" />
                <MetricCard title="Offline" value={metrics.offline} colorClass="bg-[var(--bg-tertiary)] text-[var(--text-muted)]" icon="🔌" />
                <MetricCard title="Busy" value={metrics.busy} colorClass="bg-[var(--status-resolving-bg)] text-[var(--status-resolving-color)]" icon="⚡" />
            </div>

            {/* Search */}
            <div className="relative max-w-xl">
                <input
                    type="text"
                    placeholder="Search agents by name, ID, or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3 px-4 pl-11 border border-[var(--border-secondary)] rounded-lg text-[0.95rem] outline-none transition-all focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-[var(--shadow-sm)]"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">🔍</span>
            </div>

            {/* Main Layout containing status updates (mock) and table */}
            <div className="flex gap-6 mt-2">
                {/* Left Mini Panel */}
                <div className="w-[300px] bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-primary)] flex flex-col min-h-[500px]">
                    <div className="px-5 py-4 border-b border-[var(--border-secondary)] flex justify-between items-center bg-[var(--bg-tertiary)] rounded-t-xl">
                        <h2 className="text-[1.05rem] font-bold text-[var(--text-primary)] m-0">Status Updates</h2>
                    </div>
                    <div className="p-6 flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm text-center italic bg-[var(--bg-secondary)]">
                        No recent status updates
                    </div>
                </div>

                {/* Right Table Panel */}
                <div className="flex-1 bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-primary)] flex flex-col min-h-[500px]">
                    <div className="px-6 py-4 border-b border-[var(--border-secondary)] flex justify-between items-center bg-[var(--bg-tertiary)] rounded-t-xl">
                        <h2 className="text-[1.05rem] font-bold text-[var(--text-primary)] m-0">All Agents</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-secondary)] bg-[var(--bg-card)]">
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Agent</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-center">Pending Tickets</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-center">Resolved Tickets</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-center">Pending Approvals</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-primary)]">
                                {filteredAgents.length > 0 ? (
                                    filteredAgents.map(agent => (
                                        <tr
                                            key={agent.agentId}
                                            className="hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                                            onClick={() => {
                                                setSelectedAgent(agent);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-sm">
                                                        {agent.name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-[var(--text-primary)]">{agent.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-[var(--text-secondary)]">{agent.agentId}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(agent.status)}`}>
                                                    <span className={`w-2 h-2 rounded-full ${getStatusDot(agent.status)}`}></span>
                                                    {agent.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-[var(--text-primary)]">{agent.totalPending || 0}</td>
                                            <td className="px-6 py-4 text-center font-medium text-[var(--text-primary)]">{agent.totalResolved || 0}</td>
                                            <td className="px-6 py-4 text-center font-medium text-[var(--text-primary)]">{agent.pendingApprovals || 0}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                                    title="View Details"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedAgent(agent);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-muted)] italic">
                                            No agents matched your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Agent Details Modal */}
            <AgentDetailsModal
                isOpen={isModalOpen}
                agent={selectedAgent}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedAgent(null);
                }}
            />
        </div>
    );
}
