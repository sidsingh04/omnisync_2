const IdempotencyKey = require("../models/IdempotencyKey");

async function idempotencyMiddleware(req, res, next) {

    const key = req.headers["x-idempotency-key"];

    if (!key) return next();

    try {
        const existing = await IdempotencyKey.findOne({ key });

        if (existing) {
            return res.json(existing.response);
        }

        req.idempotencyKey = key;
        next();

    } catch (err) {
        next(err);
    }
}

module.exports = idempotencyMiddleware;