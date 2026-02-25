import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketsTab from '../components/supervisor/TicketsTab';
import AgentsTab from '../components/supervisor/AgentsTab';
import AnalyticsTab from '../components/supervisor/AnalyticsTab';
import { initializeTheme } from '../theme/Theme';

export default function SupervisorDashboard() {
    const navigate = useNavigate();
    const [supervisor, setSupervisor] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'tickets' | 'agents' | 'analytics'>('tickets');

    useEffect(() => {
        initializeTheme();
        const fetchSupervisor = async () => {
            const supervisorId = sessionStorage.getItem('supervisorId');
            if (!supervisorId) {
                navigate('/');
                return;
            }
            try {
                // Adjusting the endpoint to match backend if available or just setting dummy data/state
                setSupervisor({ name: `Supervisor ${supervisorId}`, supervisorId });
            } catch (error) {
                console.error("Failed to load supervisor data:", error);
                navigate('/');
            }
        };
        fetchSupervisor();
    }, [navigate]);

    const handleSignOut = () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            sessionStorage.clear();
            navigate('/');
        }
    };

    if (!supervisor) {
        return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)]">Loading supervisor data...</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col">
            {/* Top Bar */}
            <header className="bg-[var(--bg-secondary)] h-[70px] flex justify-between items-center shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 m-0 pl-6">OmniSync</h3>
                    <span className="px-3 py-1 bg-[var(--bg-primary)] text-[var(--accent-primary)] rounded-full text-xs font-semibold tracking-wide uppercase border border-[var(--border-secondary)]">
                        Supervisor
                    </span>
                </div>

                <nav className="hidden md:flex flex-1 max-w-[500px] h-full mx-8">
                    {['tickets', 'agents', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex flex-col items-center justify-center flex-1 h-full border-b-2 transition-colors cursor-pointer text-sm font-medium ${activeTab === tab
                                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-tertiary)]'
                                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
                                }`}
                        >
                            <span className="capitalize">{tab}</span>
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-red-500 font-medium text-sm transition-colors rounded-lg hover:bg-red-50 cursor-pointer border-none bg-transparent"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-[1400px] w-full mx-auto overflow-hidden flex flex-col">
                {activeTab === 'tickets' && <TicketsTab />}
                {activeTab === 'agents' && <AgentsTab />}
                {activeTab === 'analytics' && <AnalyticsTab />}
            </main>
        </div>
    );
}
