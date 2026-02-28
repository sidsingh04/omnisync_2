const Agent = require("../models/Agent");
const { getIO } = require("../socket");

async function updateAgentStatus(req, res) {
    try {
        const { agentId, status } = req.body;
        const agent = await Agent.findOne({ agentId });
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" });
        }
        const oldStatus = agent.status;
        agent.status = status;
        await agent.save();

        try {
            getIO().emit("agentStatusUpdated", {
                agentId: agent.agentId,
                name: agent.name,
                oldStatus: oldStatus,
                status: agent.status,
                timestamp: new Date().toISOString()
            });
        } catch (socketErr) {
            console.error("Socket emit error:", socketErr);
        }

        return res.json({ success: true, message: "Status updated successfully" });
    } catch (error) {
        console.error("Error updating agent status:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function getAgent(req, res) {
    try {
        const { agentId } = req.query;
        const agent = await Agent.findOne({ agentId });
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" });
        }
        return res.json({ success: true, agent });
    } catch (error) {
        console.error("Error getting agent:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


async function getAgentsOfStatus(req, res) {
    try {
        const { status } = req.query;
        const agents = await Agent.find({ status });
        return res.json({ success: true, agents });
    } catch (error) {
        console.error("Error getting agents:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function updateAgent(req, res) {
    try {
        const { _id, __v, agentId, ...updateFields } = req.body;

        console.log(req.body);

        // Fetch current document to capture the old status
        const currentAgent = await Agent.findOne({ agentId });
        if (!currentAgent) {
            return res.status(404).json({ success: false, message: "Agent not found" });
        }

        const oldStatus = currentAgent.status;

        const updatedAgent = await Agent.findOneAndUpdate(
            { agentId },
            { $set: updateFields },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedAgent) {
            return res.status(404).json({ success: false, message: "Agent not found" });
        }

        if (updateFields.status && oldStatus !== updateFields.status) {
            try {
                getIO().emit("agentStatusUpdated", {
                    agentId: updatedAgent.agentId,
                    name: updatedAgent.name,
                    oldStatus: oldStatus,
                    status: updatedAgent.status,
                    timestamp: new Date().toISOString()
                });
            } catch (socketErr) {
                console.error("Socket emit error:", socketErr);
            }
        }

        return res.json({ success: true, message: "Agent updated successfully", agent: updatedAgent });
    } catch (error) {
        console.error("Error updating agent:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function getAllAgents(req, res) {
    try {
        const agents = await Agent.find();
        return res.json({ success: true, agents });
    } catch (error) {
        console.error("Error getting agents:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function getPaginatedAgents(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { agentId: { $regex: search, $options: 'i' } },
                    { status: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const agents = await Agent.aggregate([
            { $match: query },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "tickets",
                    localField: "_id",
                    foreignField: "agent",
                    as: "agentTickets"
                }
            },
            {
                $addFields: {
                    totalPending: {
                        $size: {
                            $filter: {
                                input: "$agentTickets",
                                as: "ticket",
                                cond: { $eq: ["$$ticket.status", "pending"] }
                            }
                        }
                    },
                    totalResolved: {
                        $size: {
                            $filter: {
                                input: "$agentTickets",
                                as: "ticket",
                                cond: { $eq: ["$$ticket.status", "resolved"] }
                            }
                        }
                    },
                    pendingApprovals: {
                        $size: {
                            $filter: {
                                input: "$agentTickets",
                                as: "ticket",
                                cond: { $eq: ["$$ticket.status", "approval"] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    agentTickets: 0 // Exclude massive raw array
                }
            }
        ]);

        const totalAgents = await Agent.countDocuments(query);

        return res.json({
            success: true,
            agents,
            pagination: {
                totalAgents,
                totalPages: Math.ceil(totalAgents / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error("Error getting paginated agents:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = {
    updateAgentStatus,
    getAgent,
    updateAgent,
    getAllAgents,
    getAgentsOfStatus,
    getPaginatedAgents
};