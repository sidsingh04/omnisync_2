const mongoose = require("mongoose");

const idempotencySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    response: {
        type: Object
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
});

module.exports = mongoose.model(
    "IdempotencyKey",
    idempotencySchema
);