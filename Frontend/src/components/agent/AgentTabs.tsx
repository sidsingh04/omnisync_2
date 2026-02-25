import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

interface AgentTabsProps {
    agent: any;
    tickets: any[];
    onTicketClick: (ticket: any) => void;
}

export default function AgentTabs({ agent, tickets, onTicketClick }: AgentTabsProps) {
    const [activeTab, setActiveTab] = useState<'pending' | 'activity'>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State for History
    const [historyPage, setHistoryPage] = useState(1);
    const [totalHistoryPages, setTotalHistoryPages] = useState(1);
    const [paginatedHistory, setPaginatedHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Fetch Paginated History
    useEffect(() => {
        if (!agent?.agentId) return;

        const fetchPaginatedHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const res = await axios.get(`http://localhost:3000/api/ticket/get-paginated-history?agentId=${agent.agentId}&page=${historyPage}&limit=5`);
                if (res.data.success) {
                    setPaginatedHistory(res.data.tickets);
                    setTotalHistoryPages(res.data.pagination.totalPages);
                }
            } catch (error) {
                console.error("Failed to fetch history page", error);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchPaginatedHistory();
    }, [agent?.agentId, historyPage]);

    
    const pendingTickets = useMemo(() => {
        return tickets?.filter(t => t.status === 'pending') || [];
    }, [tickets]);

    const approvalTickets = useMemo(() => {
        return (tickets?.filter(t => t.status === 'approval') || []).sort((a, b) =>
            new Date(b.approvalDate).getTime() - new Date(a.approvalDate).getTime()
        );
    }, [tickets]);

    const resolvedTickets = useMemo(() => {
        return tickets?.filter(t => t.status === 'resolved') || [];
    }, [tickets]);

    
    const filteredPending = useMemo(() => {
        if (!searchQuery) return pendingTickets;
        const lowerQuery = searchQuery.toLowerCase();
        return pendingTickets.filter(
            t => t.issueId.toLowerCase().includes(lowerQuery) || t.code?.toLowerCase().includes(lowerQuery)
        );
    }, [pendingTickets, searchQuery]);

    const renderTicketCard = (ticket: any, type: 'pending' | 'approval' | 'history') => {
        const isPending = type === 'pending';
        const statusColorClass = isPending ? 'bg-blue-100 text-blue-700' :
            (ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700');

        return (
            <div key={ticket.issueId} className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-primary)] flex flex-col gap-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:bg-[var(--bg-card-hover)] hover:shadow-[var(--shadow-md)]">
                <div className="flex justify-between items-center">
                    <span className="font-mono font-semibold text-gray-500">{ticket.issueId}</span>
                    <span className={`text-[0.75rem] px-2.5 py-1 rounded-md uppercase font-semibold capitalize ${statusColorClass}`}>
                        {ticket.status}
                    </span>
                </div>
                <div className="font-medium text-[var(--text-primary)]">{ticket.code || 'No Subject'}</div>
                <div className="flex justify-between text-[0.85rem] text-gray-500 mt-2">
                    <span>{new Date(ticket.issueDate).toLocaleDateString()}</span>
                    {isPending && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onTicketClick(ticket); }}
                            className="px-3 py-1 bg-transparent border border-[var(--accent-primary)] text-[var(--accent-primary)] rounded-md text-[0.85rem] cursor-pointer transition-colors hover:bg-[var(--accent-primary)] hover:text-[var(--text-primary)]"
                        >
                            View Details
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto flex flex-col gap-6">

            {/* Search Bar */}
            <div className="relative max-w-[600px]">
                <input
                    type="text"
                    placeholder="Search tickets by ID, subject"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3 px-4 pl-10 border border-[var(--border-secondary)] rounded-lg text-[0.95rem] outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                </span>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-4 border-b-2 border-gray-200 relative">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-3 px-4 text-base font-medium relative top-[2px] border-b-2 transition-all cursor-pointer ${activeTab === 'pending'
                        ? 'text-[var(--accent-primary)] border-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
                        }`}
                >
                    Pending Tickets
                    <span className={`ml-2 text-xs py-0.5 px-2 rounded-xl text-white ${activeTab === 'pending' ? 'bg-[var(--accent-primary)]' : 'bg-[var(--text-muted)]'}`}>
                        {pendingTickets.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-3 px-4 text-base font-medium relative top-[2px] border-b-2 transition-all cursor-pointer ${activeTab === 'activity'
                        ? 'text-[var(--accent-primary)] border-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
                        }`}
                >
                    Activity & History
                </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-col gap-6 flex">
                {activeTab === 'pending' && (
                    <div className="flex flex-col gap-4">
                        {filteredPending.length > 0 ? (
                            filteredPending.map(t => renderTicketCard(t, 'pending'))
                        ) : (
                            <div className="text-center p-8 text-gray-500 italic bg-white rounded-lg border border-gray-200 shadow-sm">
                                {searchQuery ? 'No matching tickets found' : 'No pending tickets available'}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-sm border border-[var(--border-primary)] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-emerald-100 text-emerald-500">✓</div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-[var(--text-primary)]">{resolvedTickets.length}</span>
                                    <span className="text-sm text-[var(--text-secondary)]">Resolved Tickets</span>
                                </div>
                            </div>
                            <div className="bg-[var(--bg-card)] p-6 rounded-xl shadow-sm border border-[var(--border-primary)] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-orange-50 text-orange-500">⏳</div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-[var(--text-primary)]">{pendingTickets.length}</span>
                                    <span className="text-sm text-[var(--text-secondary)]">Pending Tickets</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pb-2 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider font-semibold">
                            Approvals Sent to Supervisor
                        </div>
                        <div className="flex flex-col gap-4">
                            {approvalTickets.length > 0 ? (
                                approvalTickets.map(t => renderTicketCard(t, 'approval'))
                            ) : (
                                <div className="text-center p-8 text-[var(--text-muted)] italic bg-[var(--bg-card)] rounded-lg border border-[var(--border-secondary)] shadow-sm">No pending approvals</div>
                            )}
                        </div>

                        <div className="mt-4 pb-2 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider font-semibold">
                            Ticket History
                        </div>
                        <div className="flex flex-col gap-4">
                            {isLoadingHistory ? (
                                <div className="text-center p-8 text-[var(--text-muted)] italic bg-[var(--bg-card)] rounded-lg border border-[var(--border-secondary)] shadow-sm">Loading history...</div>
                            ) : paginatedHistory.length > 0 ? (
                                paginatedHistory.map(t => renderTicketCard(t, 'history'))
                            ) : (
                                <div className="text-center p-8 text-[var(--text-muted)] italic bg-[var(--bg-card)] rounded-lg border border-[var(--border-secondary)] shadow-sm">No history available</div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalHistoryPages > 1 && (
                            <div className="flex justify-between items-center px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-secondary)] rounded-lg mt-2 shadow-[var(--shadow-sm)]">
                                <button
                                    disabled={historyPage === 1 || isLoadingHistory}
                                    onClick={() => setHistoryPage(prev => prev - 1)}
                                    className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 cursor-pointer transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-medium text-[var(--text-secondary)]">
                                    Page {historyPage} of {totalHistoryPages || 1}
                                </span>
                                <button
                                    disabled={historyPage >= totalHistoryPages || isLoadingHistory}
                                    onClick={() => setHistoryPage(prev => prev + 1)}
                                    className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 cursor-pointer transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
