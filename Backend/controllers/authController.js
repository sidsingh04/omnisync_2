const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { agentCredentials, superCredentials } = require("../models/Credentials.js");
const authService = require("../services/credentials.js");
const dotenv = require("dotenv");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';


async function agentLogin(req, res) {
    try {
        const { userId, password } = req.body;

        const user = await agentCredentials.findOne({ agentId: userId });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const payload = { id: user.agentId, role: 'agent' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({ message: "Login successful", token: token });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function supervisorLogin(req, res) {
    try {
        const { userId, password } = req.body;

        const user = await superCredentials.findOne({ superId: userId });
        // console.log("User from DB:", user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        // console.log("Password match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const payload = { id: user.superId, role: 'supervisor' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            supervisorId: user.superId,
            token: token
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    agentLogin,
    supervisorLogin
};