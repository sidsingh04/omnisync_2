import React from 'react';

interface AgentNotificationsProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function AgentNotifications({ isOpen, onToggle }: AgentNotificationsProps) {
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
                    <button className="bg-transparent border-none text-[var(--accent-primary)] cursor-pointer text-sm hover:underline font-semibold">
                        Clear All
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[var(--bg-secondary)] min-w-[320px]">
                    <div className="text-center p-8 text-[var(--text-muted)] italic font-medium">
                        No new notifications
                    </div>
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
