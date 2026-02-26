const Ticket = require("../models/Tickets");
const Agent = require("../models/Agent");

// Applying Aggregation pipeline for AnalyticsTab and agent-status

// Get overall metrics and top issue categories
async function getMetrics(req, res) {
    try {
        const metricsData = await Ticket.aggregate([
            {
                $facet: {
                    statusCounts: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    distinctErrorsCount: [
                        {
                            $match: { code: { $exists: true, $ne: "" } }
                        },
                        {
                            $group: {
                                _id: "$code"
                            }
                        },
                        {
                            $count: "totalDistinct"
                        }
                    ],
                    topIssueTypes: [
                        {
                            $group: {
                                _id: { $ifNull: ["$code", "Unknown"] },
                                value: { $sum: 1 }
                            }
                        },
                        { $sort: { value: -1 } },
                        { $limit: 5 },
                        {
                            $project: {
                                _id: 0,
                                name: "$_id",
                                value: 1
                            }
                        }
                    ]
                }
            }
        ]);

        const result = metricsData[0];

        let resolved = 0, pending = 0, approval = 0;
        if (result.statusCounts) {
            result.statusCounts.forEach(status => {
                if (status._id === 'resolved') resolved = status.count;
                if (status._id === 'pending') pending = status.count;
                if (status._id === 'approval') approval = status.count;
            });
        }

        const distinctErrors = result.distinctErrorsCount[0] ? result.distinctErrorsCount[0].totalDistinct : 0;
        const issueTypesData = result.topIssueTypes || [];

        res.status(200).json({
            success: true,
            metrics: { resolved, pending, approval, distinctErrors },
            issueTypesData
        });

    } catch (error) {
        console.error("Error fetching metrics:", error);
        res.status(500).json({ success: false, message: "Failed to fetch metrics" });
    }
};

// Get all distinct available months for dropdown (YYYY-MM format)
async function getAvailableMonths(req, res) {
    try {
        const monthsData = await Ticket.aggregate([
            {
                $project: {
                    issueMonth: {
                        $dateToString: { format: "%Y-%m", date: "$issueDate" }
                    },
                    resolvedMonth: {
                        $dateToString: { format: "%Y-%m", date: "$resolvedDate" }
                    }
                }
            },
            {
                $project: {
                    months: {
                        $filter: {
                            input: ["$issueMonth", "$resolvedMonth"],
                            cond: { $ne: ["$$this", null] }
                        }
                    }
                }
            },
            { $unwind: "$months" },
            {
                $group: {
                    _id: "$months"
                }
            },
            { $sort: { _id: -1 } },
            {
                $group: {
                    _id: null,
                    availableMonths: { $push: "$_id" }
                }
            }
        ]);

        const availableMonths = monthsData.length > 0 ? monthsData[0].availableMonths : [];
        res.status(200).json({ success: true, availableMonths });

    } catch (error) {
        console.error("Error fetching available months:", error);
        res.status(500).json({ success: false, message: "Failed to fetch available months" });
    }
};

async function getMonthlyData(req, res) {
    try {
        const { month } = req.query; // Expect format YYYY-MM
        if (!month) {
            return res.status(400).json({ success: false, message: "Month parameter is required (YYYY-MM)" });
        }

        const [yearStr, monthStr] = month.split('-');
        if (!yearStr || !monthStr) {
            return res.status(400).json({ success: false, message: "Invalid month format. Expected YYYY-MM" });
        }

        const year = parseInt(yearStr, 10);
        const monthNum = parseInt(monthStr, 10) - 1; // 0-indexed month

        const startDate = new Date(year, monthNum, 1);
        const endDate = new Date(year, monthNum + 1, 0, 23, 59, 59, 999);
        const daysInMonth = new Date(year, monthNum + 1, 0).getDate();

        const monthlyData = await Ticket.aggregate([
            {
                $facet: {
                    raisedTickets: [
                        {
                            $match: {
                                issueDate: { $gte: startDate, $lte: endDate }
                            }
                        },
                        {
                            $group: {
                                _id: { $dayOfMonth: "$issueDate" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    resolvedTickets: [
                        {
                            $match: {
                                status: "resolved",
                                resolvedDate: { $gte: startDate, $lte: endDate }
                            }
                        },
                        {
                            $group: {
                                _id: { $dayOfMonth: "$resolvedDate" },
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = monthlyData[0];

        const raisedMap = new Map();
        if (result.raisedTickets) {
            result.raisedTickets.forEach(item => raisedMap.set(item._id, item.count));
        }

        const resolvedMap = new Map();
        if (result.resolvedTickets) {
            result.resolvedTickets.forEach(item => resolvedMap.set(item._id, item.count));
        }

        const formattedDays = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return {
                day: String(day),
                raised: raisedMap.get(day) || 0,
                resolved: resolvedMap.get(day) || 0
            };
        });

        res.status(200).json({ success: true, days: formattedDays });

    } catch (error) {
        console.error("Error fetching monthly data:", error);
        res.status(500).json({ success: false, message: "Failed to fetch monthly data" });
    }
};


async function getAgentStatusMetrics(req, res) {
    try {
        const agentStatusData = await Agent.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        let available = 0, busy = 0, offline = 0, breaktime = 0, total = 0;

        agentStatusData.forEach(status => {
            const count = status.count;
            total += count;

            switch (status._id) {
                case 'Available': available = count; break;
                case 'Busy': busy = count; break;
                case 'Offline': offline = count; break;
                case 'Break': breaktime = count; break;
            }
        });

        res.status(200).json({
            success: true,
            metrics: {
                total,
                available,
                busy,
                offline,
                break: breaktime
            }
        });

    } catch (error) {
        console.error("Error fetching agent status metrics:", error);
        res.status(500).json({ success: false, message: "Failed to fetch agent status metrics" });
    }
};

module.exports = {
    getMetrics,
    getAvailableMonths,
    getMonthlyData,
    getAgentStatusMetrics
};
