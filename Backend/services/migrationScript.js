//For adding agent reference to tickets collection

const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Ticket = require("../models/Tickets");
const Agent = require("../models/Agent");
dotenv.config({ path: __dirname + "/../.env" });

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function migrateTickets() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for migration...");

        const tickets = await Ticket.find();
        let migratedCount = 0;

        for (const ticket of tickets) {
            // Only update if agent reference is missing
            if (!ticket.agent) {
                const agent = await Agent.findOne({
                    agentId: ticket.agentId
                });

                if (agent) {
                    ticket.agent = agent._id;
                    await ticket.save();
                    migratedCount++;
                } else {
                    console.warn(`Agent not found for agentId: ${ticket.agentId} on ticket ${ticket._id}`);
                }
            }
        }

        console.log(`Successfully migrated ${migratedCount} tickets.`);
        process.exit(0);
    } catch (error) {
        console.error("Error during migration:", error);
        process.exit(1);
    }
}

migrateTickets();