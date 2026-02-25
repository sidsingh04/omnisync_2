require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { agentCredentials, superCredentials } = require("../models/Credentials");

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
            const hashedPassword = await bcrypt.hash(cred.password, SALT_ROUNDS);

            await agentCredentials.findOneAndUpdate(
                { agentId: cred.agentId },
                { password: hashedPassword },
                { upsert: true, new: true }
            );
        }
        console.log(`Successfully seeded ${AgentCredentialsData.length} agent credentials.`);

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