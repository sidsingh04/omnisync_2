import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AgentTopBarProps {
    agent: any;
    setAgent: (agent: any) => void;
}

export default function AgentTopBar({ agent, setAgent }: AgentTopBarProps) {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        if (agent?.status === 'Break') {
            alert('You cannot sign out while on break.');
            return;
        }

        try {
            await axios.post('http://localhost:3000/api/agent/update-status', {
                agentId: agent?.agentId,
                status: 'Offline'
            });
            sessionStorage.clear();
            navigate('/');
        } catch (e) {
            console.error("Signout update failed", e);
        }
    };

    const handleToggleBreak = async () => {
        const newStatus = agent?.status === 'Break' ? (agent.totalPending > 0 ? 'Busy' : 'Available') : 'Break';
        const updatedAgent = { ...agent, status: newStatus };
        setAgent(updatedAgent);

        try {
            await axios.put('http://localhost:3000/api/agent/update', updatedAgent);
        } catch (e) {
            console.error("Status update failed", e);
        }
    };

    const initials = agent?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'AG';

    return (
        <header className="bg-[var(--bg-secondary)] flex justify-between items-center border-b border-[var(--border-primary)] shadow-[var(--shadow-sm)] h-[70px]">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {initials}
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-[0.95rem] text-[var(--text-primary)]">{agent?.name || 'Loading...'}</span>
                    <span className="text-xs text-[var(--text-muted)]">ID: {agent?.agentId || '...'}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <span className="text-sm">Status:</span>
                <span className={`text-sm font-medium ${agent?.status === 'Break' ? 'text-orange-500' : 'text-[var(--text-secondary)]'}`}>{agent?.status || 'Available'}</span>
            </div>

            <button
                onClick={handleToggleBreak}
                className={`mr-2.5 px-4 py-2 border-none rounded cursor-pointer flex items-center gap-2 text-sm transition-colors text-white ${agent?.status === 'Break' ? 'bg-[var(--accent-secondary)] hover:bg-[var(--accent-primary)]' : 'bg-[var(--status-pending-color)] hover:bg-red-500'}`}
            >
                {agent?.status === 'Break' ? '▶ End Break' : '☕ Take Break'}
            </button>

            <div className="flex items-center gap-2.5">
                <button
                    onClick={handleSignOut}
                    className="bg-transparent border border-red-500 text-red-500 px-4 py-1.5 rounded-md cursor-pointer text-sm transition-all hover:bg-red-500 hover:text-white flex items-center gap-2"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}
