// API's related to Tickets

const Ticket = require("../models/Tickets");
const Agent = require("../models/Agent");

async function createTicket(req, res) {
    try {
        const { issueId, code, description, agentId, status, issueDate } = req.body;

        // Find the agent to get their ObjectId
        const agent = await Agent.findOne({ agentId });
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" });
        }

        const ticket = new Ticket({
            issueId,
            code,
            description,
            agentId,
            agent: agent._id,
            status: status || 'pending',
            issueDate: issueDate || new Date(),
            remarks: req.body.remarks || "Initial ticket creation"
        });
        await ticket.save();

        // Update agent status to 'Busy' if they aren't 'Offline'
        if (agent.status !== 'Offline') {
            agent.status = 'Busy';
            await agent.save();
        }

        return res.json({ success: true, message: "Ticket created successfully" });
    } catch (error) {
        console.error("Error creating ticket:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function getTicketById(req, res) {
    try {
        const { issueId } = req.query;
        const ticket = await Ticket.findOne({ issueId });
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }
        return res.json({ success: true, ticket });
    } catch (error) {
        console.error("Error getting ticket:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function updateTicket(req, res) {
    try {
        const { issueId, _id, __v, agentId, agent, ...updateFields } = req.body;
        const ticket = await Ticket.findOneAndUpdate({ issueId }, { $set: updateFields }, { new: true, runValidators: true });
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }
        return res.json({ success: true, message: "Ticket updated successfully" });
    } catch (error) {
        console.error("Error updating ticket:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function getTicketsByStatus(req, res) {
    try {
        const { status } = req.query;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status query parameter is required"
            });
        }

        const tickets = await Ticket.find({ status });

        return res.json({
            success: true,
            tickets
        });

    } catch (error) {
        console.error("Error getting tickets:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function getTicketsByAgentId(req, res) {
    try {
        const { agentId } = req.query;

        if (!agentId) {
            return res.status(400).json({
                success: false,
                message: "agentId query parameter is required"
            });
        }

        const tickets = await Ticket.find({ agentId });

        return res.json({
            success: true,
            tickets
        });

    } catch (error) {
        console.error("Error getting tickets:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function getAllTickets(req, res) {
    try {
        const tickets = await Ticket.find();
        return res.json({
            success: true,
            tickets
        });
    } catch (error) {
        console.error("Error getting tickets:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function getPaginatedHistory(req, res) {
    try {
        const agentId = req.query.agentId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";

        if (!agentId) {
            return res.status(400).json({
                success: false,
                message: "agentId query parameter is required"
            });
        }

        const skip = (page - 1) * limit;

        let query = { agentId };
        if (search) {
            query.$or = [
                { issueId: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } }
            ];
        }

        // Fetch tickets, sorted by issueDate (newest first)
        const tickets = await Ticket.find(query)
            .sort({ issueDate: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for this agent to calculate total pages
        const totalTickets = await Ticket.countDocuments(query);
        const totalPages = Math.ceil(totalTickets / limit);

        return res.json({
            success: true,
            tickets,
            pagination: {
                total: totalTickets,
                page,
                totalPages,
                limit
            }
        });
    } catch (error) {
        console.error("Error getting paginated tickets:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = {
    createTicket,
    getTicketById,
    updateTicket,
    getTicketsByStatus,
    getTicketsByAgentId,
    getAllTickets,
    getPaginatedHistory
};