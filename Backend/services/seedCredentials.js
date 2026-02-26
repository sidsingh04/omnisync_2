require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { agentCredentials, superCredentials } = require("../models/Credentials");
const Agent = require("../models/Agent");

const SALT_ROUNDS = 10;

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const AgentCredentialsData = [
    { agentId: "A101", password: "helloji" },
    { agentId: "A102", password: "helloji" },
    { agentId: "A103", password: "helloji" },
    { agentId: "A104", password: "helloji" }
];

const SupervisorCredentialsData = [
    { superId: "S102", password: "helloji" }
];

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Seed Agents
        for (const cred of AgentCredentialsData) {
            // Fetch the Agent document to get its ObjectId
            const agentDoc = await Agent.findOne({ agentId: cred.agentId });

            if (!agentDoc) {
                console.warn(`[Warning] Agent with agentId ${cred.agentId} not found in Agent collection. Skipping credential seeding for this agent.`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(cred.password, SALT_ROUNDS);

            await agentCredentials.findOneAndUpdate(
                { agentId: cred.agentId },
                {
                    password: hashedPassword,
                    agent: agentDoc._id
                },
                { upsert: true, new: true }
            );
        }
        console.log(`Finished processing agent credentials.`);

        // Seed Supervisors
        for (const cred of SupervisorCredentialsData) {
            const hashedPassword = await bcrypt.hash(cred.password, SALT_ROUNDS);

            await superCredentials.findOneAndUpdate(
                { superId: cred.superId },
                { password: hashedPassword },
                { upsert: true, new: true }
            );
        }
        console.log(`Successfully seeded ${SupervisorCredentialsData.length} supervisor credentials.`);

        console.log("Seeding completed.");
        process.exit(0);
    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
}

seedData();