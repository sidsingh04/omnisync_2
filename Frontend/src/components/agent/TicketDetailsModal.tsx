import React, { useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid";

interface TicketDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket?: any;
    agent?: any;
    onTicketUpdate?: () => void;
}

export default function TicketDetailsModal({ isOpen, onClose, ticket, agent, onTicketUpdate }: TicketDetailsModalProps) {
    const [remarks, setRemarks] = useState('');
    const [callDuration, setCallDuration] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !ticket) return null;

    const handleApproval = async () => {
        if (!remarks) {
            alert('Please enter remarks before sending for approval.');
            return;
        }

        const duration = parseInt(callDuration, 10);
        if (isNaN(duration) || duration < 0) {
            alert('Please enter a valid call duration.');
            return;
        }

        setIsSubmitting(true);

        try {
            const updatedTicket = {
                ...ticket,
                status: 'approval',
                remarks,
                callDuration: duration,
                approvalDate: new Date().toUTCString(),
            };

            await axios.put(
                'http://localhost:3000/api/ticket/update',
                updatedTicket,
                {
                    headers: {
                        "x-idempotency-key": uuidv4()
                    }
                }
            );

            // Revert UI fields back
            setRemarks('');
            setCallDuration('');
            if (onTicketUpdate) onTicketUpdate();
            onClose();

        } catch (error) {
            console.error('Error sending for approval:', error);
            alert('Failed to update ticket status.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex justify-center items-center opacity-100 transition-opacity">
            <div className="bg-[var(--bg-card)] w-[90%] max-w-[500px] rounded-xl shadow-[var(--shadow-modal)] flex flex-col overflow-hidden transform transition-transform translate-y-0 border border-[var(--border-primary)] max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-modal-header)] flex justify-between items-center">
                    <h3 className="m-0 text-lg text-[var(--text-primary)] font-semibold">Ticket Details</h3>
                    <button
                        onClick={onClose}
                        className="bg-transparent border-none text-2xl cursor-pointer text-[var(--text-muted)] hover:text-red-500 transition-colors"
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
                    {/* Meta Information Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-secondary)]">
                        <div className="flex flex-col gap-1">
                            <span className="text-[0.8rem] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Ticket ID</span>
                            <span className="text-[0.95rem] font-mono text-[var(--text-primary)]">{ticket.issueId}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[0.8rem] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Status</span>
                            <div>
                                <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md uppercase ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                    ticket.status === 'approval' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {ticket.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[0.8rem] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Issue Code</span>
                            <span className="text-[0.95rem] font-medium text-[var(--text-primary)]">{ticket.code}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[0.8rem] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Issue Date</span>
                            <span className="text-[0.95rem] text-[var(--text-primary)]">{new Date(ticket.issueDate).toLocaleString()}</span>
                        </div>
                        {ticket.resolvedDate && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[0.8rem] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Resolved Date</span>
                                <span className="text-[0.95rem] text-[var(--text-primary)]">{new Date(ticket.resolvedDate).toLocaleString()}</span>
                            </div>
                        )}
                        {ticket.callDuration > 0 && ticket.status !== 'pending' && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[0.8rem] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Call Duration</span>
                                <span className="text-[0.95rem] text-[var(--text-primary)]">{ticket.callDuration} mins</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">Description:</span>
                        <p className="bg-[var(--bg-tertiary)] p-4 rounded-md font-normal leading-relaxed m-0 border border-[var(--border-secondary)] text-[var(--text-primary)] whitespace-pre-wrap text-[0.95rem]">
                            {ticket.description}
                        </p>
                    </div>

                    {ticket.status !== 'pending' && ticket.remarks && ticket.remarks !== "Initial ticket creation" && (
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-[var(--text-primary)]">Agent Remarks:</span>
                            <div className="bg-[var(--bg-tertiary)] p-4 rounded-md border border-[var(--border-secondary)] text-[0.95rem] italic text-[var(--text-primary)] whitespace-pre-wrap">
                                "{ticket.remarks}"
                            </div>
                        </div>
                    )}

                    {ticket.status === 'pending' && (
                        <>
                            <hr className="border-t border-[var(--border-primary)] my-2" />

                            <div className="flex flex-col gap-2">
                                <label htmlFor="ticketRemarks" className="text-sm font-semibold text-[var(--text-primary)]">Agent Remarks <span className="text-red-500">*</span></label>
                                <textarea
                                    id="ticketRemarks"
                                    className="p-3 border border-[var(--border-secondary)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] font-sans text-[0.95rem] outline-none transition-colors w-full focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] disabled:bg-[var(--bg-secondary)] disabled:cursor-not-allowed"
                                    placeholder={agent?.status === 'Break' ? 'Action disabled while on break.' : 'Enter resolution details or remarks...'}
                                    rows={4}
                                    disabled={agent?.status === 'Break' || isSubmitting}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="ticketCallDuration" className="text-sm font-semibold text-[var(--text-primary)]">Call Duration (minutes) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    id="ticketCallDuration"
                                    min="0"
                                    placeholder="e.g. 15"
                                    className="p-3 border border-[var(--border-secondary)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] font-sans text-[0.95rem] outline-none transition-colors w-full focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] disabled:bg-[var(--bg-secondary)] disabled:cursor-not-allowed"
                                    disabled={agent?.status === 'Break' || isSubmitting}
                                    value={callDuration}
                                    onChange={(e) => setCallDuration(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="approvalAttachment" className="text-sm font-semibold text-[var(--text-primary)]">Attachment (Image/Audio)</label>
                                <input
                                    type="file"
                                    id="approvalAttachment"
                                    accept="image/*,audio/*"
                                    className="p-3 border border-[var(--border-secondary)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] font-sans text-[0.95rem] outline-none transition-colors w-full focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[var(--border-primary)] flex justify-end gap-3 bg-[var(--bg-modal-header)]">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-md font-medium cursor-pointer text-[0.95rem] transition-colors bg-[var(--bg-card)] border border-[var(--border-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                    >
                        Close
                    </button>
                    {ticket.status === 'pending' && (
                        <button
                            onClick={handleApproval}
                            disabled={agent?.status === 'Break' || isSubmitting}
                            className="px-5 py-2.5 rounded-md font-medium cursor-pointer text-[0.95rem] transition-colors bg-[var(--accent-secondary)] text-[var(--text-primary)] border-none hover:bg-[var(--accent-primary)] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : 'Send for Approval'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
