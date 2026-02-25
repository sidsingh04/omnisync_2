const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({

    issueId: {
        type: String,
        required: true,
        unique: true,
    },

    code: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    callDuration: {
        type: Number,
        default: 0,
        min: 0
    },

    agentId: {
        type: String,
        required: true,
    },

    issueDate: {
        type: Date,
        default: Date.now
    },

    approvalDate: {
        type: Date
    },

    resolvedDate: {
        type: Date
    },

    remarks: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: String,
        enum: ["pending", "approval", "resolved"],
        default: "pending"
    }

}, { timestamps: true });

// ticketSchema.index({ issueId: 1 });
ticketSchema.index({ agentId: 1 });
ticketSchema.index({ status: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);