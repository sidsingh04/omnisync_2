import React from 'react';

export default function AgentNotifications() {
    return (
        <aside className="w-[320px] bg-[var(--bg-secondary)] border-l border-[var(--border-secondary)] flex flex-col shrink-0">
            <div className="p-6 border-b border-[var(--border-secondary)] flex justify-between items-center bg-[var(--bg-card)]">
                <h3 className="text-lg font-bold text-[var(--text-primary)] m-0">Notifications</h3>
                <button className="bg-transparent border-none text-[var(--accent-primary)] cursor-pointer text-sm hover:underline font-semibold">
                    Clear All
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[var(--bg-secondary)]">
                <div className="text-center p-8 text-[var(--text-muted)] italic font-medium">
                    No new notifications
                </div>
            </div>
        </aside>
    );
}
