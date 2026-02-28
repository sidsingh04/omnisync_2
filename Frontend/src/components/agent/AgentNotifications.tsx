import React from 'react';

interface AgentNotificationsProps {
    isOpen: boolean;
    onToggle: () => void;
    notifications: any[];
    onClear: () => void;
}

export default function AgentNotifications({ isOpen, onToggle, notifications, onClear }: AgentNotificationsProps) {

    const getNotification3DStyle = (type?: string) => {
        // Keeping the 3D shadows and hover lifts, but universally setting a dark background
        const baseStyles = 'bg-neutral-900 border-t border-l border-b-[4px] border-r-[4px] shadow-[2px_2px_8px_rgba(0,0,0,0.5),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:-translate-y-1 hover:shadow-[4px_4px_12px_rgba(0,0,0,0.7)] transition-all duration-200 cursor-default relative overflow-hidden';

        switch (type) {
            case 'assigned':
                return `${baseStyles} border-t-yellow-400/50 border-l-yellow-400/50 border-b-yellow-500 border-r-yellow-500 text-yellow-400`;
            case 'resolved':
                return `${baseStyles} border-t-green-400/50 border-l-green-400/50 border-b-green-600 border-r-green-600 text-green-400`;
            case 'rejected':
                return `${baseStyles} border-t-red-400/50 border-l-red-400/50 border-b-red-600 border-r-red-600 text-red-400`;
            default:
                return `${baseStyles} border-t-[var(--border-secondary)] border-l-[var(--border-secondary)] border-b-[var(--border-primary)] border-r-[var(--border-primary)] text-[var(--accent-primary)]`;
        }
    };

    const getNotificationIcon = (type?: string) => {
        switch (type) {
            case 'assigned':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
            case 'resolved':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
            case 'rejected':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
        }
    };

    return (
        <aside
            className={`bg-[var(--bg-secondary)] border-l border-[var(--border-secondary)] flex flex-col shrink-0 transition-all duration-300 ease-in-out relative ${isOpen ? 'w-[320px]' : 'w-[60px]'
                }`}
        >
            <div className={`flex flex-col h-full transition-opacity duration-300 overflow-hidden ${isOpen ? 'opacity-100 w-[320px]' : 'opacity-0 invisible w-0'}`}>
                <div className="p-5 border-b border-[var(--border-secondary)] flex justify-between items-center bg-[var(--bg-card)] min-w-[320px]">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onToggle}
                            className="w-8 h-8 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-colors"
                            title="Collapse Notifications"
                        >
                            ▶
                        </button>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] m-0 flex items-center gap-2">
                            <span>🔔</span> Notifications
                        </h3>
                    </div>
                    {notifications && notifications.length > 0 && (
                        <button
                            onClick={onClear}
                            className="bg-transparent border-none text-[var(--accent-primary)] cursor-pointer text-sm hover:underline font-semibold"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[var(--bg-secondary)] min-w-[320px]">
                    {(!notifications || notifications.length === 0) ? (
                        <div className="text-center p-8 text-[var(--text-muted)] italic font-medium">
                            No new notifications
                        </div>
                    ) : (
                        notifications.map((notif: any) => {
                            const styleClass = getNotification3DStyle(notif.type);
                            return (
                                <div key={notif.id} className={`${styleClass} p-4 rounded-lg flex items-start gap-3 shrink-0 animate-fade-in-down`}>
                                    <div className="shrink-0 mt-0.5">
                                        {getNotificationIcon(notif.type)}
                                    </div>
                                    <div className="flex flex-col gap-1 w-full relative z-10">
                                        <div className="text-sm font-semibold leading-relaxed text-white">
                                            {notif.message}
                                        </div>
                                        <div className="text-[0.7rem] font-bold opacity-70 self-end mt-1 uppercase tracking-wider text-gray-400">
                                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    {/* Subtle light flare adjusted for dark background */}
                                    <div className="absolute top-0 left-0 w-3/4 h-3/4 bg-white/5 blur-2xl rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/4"></div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Minimized Icon (Visible when closed) */}
            {!isOpen && (
                <div className="flex flex-col items-center py-5 gap-6 w-full">
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-colors"
                        title="Expand Notifications"
                    >
                        ◀
                    </button>
                    <div
                        onClick={onToggle}
                        className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] cursor-pointer w-full flex justify-center py-2"
                        title="Expand Notifications"
                    >
                        <span className="text-xl relative text-[var(--text-muted)] group hover:text-[var(--accent-primary)] transition-colors">
                            🔔
                        </span>
                    </div>
                </div>
            )}
        </aside>
    );
}
