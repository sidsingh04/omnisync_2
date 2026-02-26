const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    unique: true,
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  //Combine agentCredentials into agentSchema
  //  password: { type: String, required: true },

  status: {
    type: String,
    enum: ['Offline', 'Available', 'Busy', 'Break'],
    default: "Offline"
  },

  totalCallDuration: {
    type: Number,
    default: 0
  },

  enrolledDate: {
    type: Date,
    default: Date.now
  },

  failedCalls: {
    type: Number,
    default: 0
  },

  successfulCalls: {
    type: Number,
    default: 0
  },

  totalPending: {
    type: Number,
    default: 0
  },

  totalResolved: {
    type: Number,
    default: 0
  },

  pendingApprovals: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

// agentSchema.index({ agentId: 1 });
agentSchema.index({ status: 1 });

module.exports = mongoose.model("Agent", agentSchema);