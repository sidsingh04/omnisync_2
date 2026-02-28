import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid";
import CreateTicketModal from './CreateTicketModal';
import socket from '../../services/socket';

interface Ticket {
    issueId: string;
    code: string;
    description: string;
    status: string;
    agentId: string;
    issueDate: string;
    callDuration?: number;
    remarks?: string;
}

export default function TicketsTab() {
    const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
    const [approvalTickets, setApprovalTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pendingRes, approvalRes] = await Promise.all([
                axios.get('http://localhost:3000/api/ticket/get-by-status?status=pending'),
                axios.get('http://localhost:3000/api/ticket/get-by-status?status=approval') // Need approval endpoint logic mapping
            ]);

            if (pendingRes.data.success) {
                setPendingTickets(pendingRes.data.tickets.sort((a: any, b: any) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
            }
            if (approvalRes.data.success) {
                setApprovalTickets(approvalRes.data.tickets.sort((a: any, b: any) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {

        socket.connect();

        const refreshTickets = () => {
            fetchData();
        };

        socket.on("ticketAssigned", refreshTickets);
        socket.on("ticketApprovalSent", refreshTickets);
        socket.on("ticketResolved", refreshTickets);
        socket.on("ticketRejected", refreshTickets);

        return () => {
            socket.off("ticketAssigned", refreshTickets);
            socket.off("ticketApprovalSent", refreshTickets);
            socket.off("ticketResolved", refreshTickets);
            socket.off("ticketRejected", refreshTickets);
        };

    }, []);

    const handleTicketApproval = async (
        ticket: Ticket,
        isApproved: boolean
    ) => {

        if (!window.confirm(
            `Are you sure you want to ${isApproved ? 'approve' : 'reject'} ticket ${ticket.issueId}?`
        )) return;

        try {

            const updatedTicket: any = {
                issueId: ticket.issueId,
                status: isApproved ? "resolved" : "pending"
            };

            if (!isApproved) {
                updatedTicket.rejectedDate = new Date().toUTCString();
            }

            if (isApproved) {
                updatedTicket.resolvedDate =
                    new Date().toUTCString();
            } else {
                updatedTicket.approvalDate = null;
            }

            await axios.put(
                "http://localhost:3000/api/ticket/update",
                updatedTicket,
                {
                    headers: {
                        "x-idempotency-key": uuidv4()
                    }
                }
            );

        } catch (error) {
            console.error("Ticket approval error:", error);
            alert("Failed to update ticket.");
        }
    };

    const StatusDot = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            pending: 'bg-orange-400',
            approval: 'bg-blue-400',
            resolved: 'bg-emerald-400'
        };
        return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-gray-400'} mr-2 shadow-sm`}></span>;
    };

    if (isLoading) {
        return <div className="p-8 text-center text-[var(--text-muted)] italic flex-1 flex items-center justify-center">Loading pending tickets and approvals...</div>;
    }

    return (
        <div className="p-6 h-full">
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Left Column - Pending & Notifications */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Pending */}
                    <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-secondary)] flex flex-col flex-1 max-h-[800px]">
                        <div className="px-6 py-4 border-b border-[var(--border-secondary)] flex justify-between items-center bg-[var(--bg-tertiary)] rounded-t-xl gap-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">Pending Tickets</h2>
                                <span className="px-3 py-1 bg-[var(--bg-primary)] border border-[var(--border-secondary)] text-[var(--text-primary)] font-semibold text-sm rounded-full shadow-sm">
                                    {pendingTickets.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border-none cursor-pointer shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" />
                                </svg>
                                Create Ticket
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                            {pendingTickets.length > 0 ? (
                                pendingTickets.map(t => (
                                    <div key={t.issueId} className="bg-[var(--bg-card)] p-4 rounded-lg border border-blue-400 border-2 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono font-semibold text-[var(--accent-primary)]">{t.issueId}</span>
                                            <span className="px-2.5 py-1 bg-[var(--status-pending-bg)] text-[var(--status-pending-color)] text-xs font-semibold rounded uppercase tracking-wider border border-[var(--status-pending-border)]">
                                                <StatusDot status="pending" /> Pending
                                            </span>
                                        </div>
                                        <div className="font-medium text-[var(--text-primary)] mb-1">{t.code}</div>
                                        <div className="text-sm text-[var(--text-muted)] flex justify-between items-center mt-3">
                                            <span>Agent: {t.agentId}</span>
                                            <span>{new Date(t.issueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-8 text-[var(--text-muted)] italic bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">No pending tickets</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Approval Window */}
                <div className="flex-[1.2] flex flex-col">
                    <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-secondary)] flex flex-col flex-1 max-h-[800px] border-l-4 border-l-[var(--accent-primary)]">
                        <div className="px-6 py-4 border-b border-[var(--border-secondary)] flex justify-between items-center bg-[var(--bg-tertiary)] rounded-tr-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--accent-secondary)] text-white rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">Approval Window</h2>
                            </div>
                            <span className="px-3 py-1 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-secondary)] font-bold text-sm rounded-full shadow-sm">
                                {approvalTickets.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[var(--bg-secondary)]">
                            {approvalTickets.length > 0 ? (
                                approvalTickets.map(t => (
                                    <div key={t.issueId} className="bg-[var(--bg-card)] p-5 rounded-xl border border-orange-400 border-2 shadow-[var(--shadow-sm)] flex flex-col gap-3">
                                        <div className="flex justify-between items-center border-b border-[var(--border-secondary)] pb-3">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-lg text-[var(--text-primary)]">{t.issueId}</span>
                                                <span className="text-sm text-[var(--text-muted)] font-medium">Agent: <span className="text-[var(--accent-primary)]">{t.agentId}</span></span>
                                            </div>
                                        </div>
                                        <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--border-secondary)]">
                                            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-1">Issue Topic</div>
                                            <div className="text-[var(--text-primary)] font-medium">{t.code}</div>
                                        </div>
                                        {t.remarks && (
                                            <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--accent-primary)]/30">
                                                <div className="text-sm font-semibold text-[var(--accent-primary)] mb-1">Agent Remarks</div>
                                                <p className="text-[var(--text-secondary)] text-sm m-0 italic whitespace-pre-wrap">{t.remarks}</p>
                                            </div>
                                        )}
                                        <div className="flex gap-3 justify-end mt-2 pt-3 border-t border-[var(--border-secondary)]">
                                            <button
                                                onClick={() => handleTicketApproval(t, false)}
                                                className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-secondary)] text-[var(--text-primary)] rounded-lg text-sm font-semibold hover:bg-[var(--bg-secondary)] hover:text-red-500 transition-colors cursor-pointer"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleTicketApproval(t, true)}
                                                className="px-5 py-2 bg-emerald-600 text-white border-none rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-[var(--shadow-sm)] cursor-pointer flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-12 flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
                                    <svg className="w-16 h-16 mb-4 text-[var(--text-muted)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-lg font-medium text-[var(--text-muted)] m-0">No items pending approval</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => fetchData()}
            />
        </div>
    );
}
