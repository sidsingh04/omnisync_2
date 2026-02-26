import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AgentTopBar from '../components/agent/AgentTopBar';
import AgentTabs from '../components/agent/AgentTabs';
import AgentNotifications from '../components/agent/AgentNotifications';
import TicketDetailsModal from '../components/agent/TicketDetailsModal';
import { initializeTheme } from '../theme/Theme';

export default function AgentDashboard() {
    const navigate = useNavigate();
    const [agent, setAgent] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(true);

    const loadDashboardData = async () => {
        try {
            const userId = sessionStorage.getItem('userId');
            if (!userId) {
                navigate('/');
                return;
            }

            const agentRes = await axios.get(`http://localhost:3000/api/agent/get-agent?agentId=${userId}`);
            let currentAgent = agentRes.data.agent;

            const ticketsRes = await axios.get(`http://localhost:3000/api/ticket/get-by-agentId?agentId=${userId}`);
            const currentTickets = ticketsRes.data.success ? ticketsRes.data.tickets : [];
            setTickets(currentTickets);

            if (currentAgent.totalPending === 0 && currentAgent.status !== 'Break') {
                currentAgent.status = 'Available';
            } else if (currentAgent.totalPending > 0 && currentAgent.status !== 'Break') {
                currentAgent.status = 'Busy';
            }

            await axios.post('http://localhost:3000/api/agent/update-status', {
                agentId: userId,
                status: currentAgent.status
            });

            setAgent(currentAgent);
            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeTheme();
        loadDashboardData();
    }, [navigate]);

    if (loading || !agent) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="text-[var(--text-muted)] font-medium">Loading Agent Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[var(--bg-primary)] flex flex-col font-sans text-[var(--text-primary)] overflow-hidden">
            <AgentTopBar
                agent={agent}
                setAgent={setAgent}
            />
            <main className="flex flex-1 overflow-hidden">
                <AgentTabs
                    agent={agent}
                    tickets={tickets}
                    onTicketClick={(ticket: any) => setSelectedTicket(ticket)}
                />
                <AgentNotifications
                    isOpen={isNotificationsOpen}
                    onToggle={() => setIsNotificationsOpen(!isNotificationsOpen)}
                />
            </main>

            <TicketDetailsModal
                isOpen={!!selectedTicket}
                ticket={selectedTicket}
                agent={agent}
                onClose={() => setSelectedTicket(null)}
                onTicketUpdate={loadDashboardData}
            />
        </div>
    );
}
