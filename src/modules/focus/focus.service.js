const { client } = require('../../config/redis');

// Default session length is 45 minutes.
// The learner can optionally pass a custom duration in the request body.
// We cap it at 180 minutes (3 hours) to prevent abuse.
const DEFAULT_DURATION_MINS = 45;
const MAX_DURATION_MINS = 180;

// Builds the Redis key for a learner's focus session.
// Keeping the key format in one place means if we ever change it,
// we only change it here — not scattered across three functions.
const sessionKey = (userId) => `focus:session:${userId}`;

// START FOCUS SESSION
// Sets a Redis key with an expiry (EX = seconds).
// If a session is already active, this overwrites it with the new duration.
// That's intentional — restarting a session is a valid action.
const startSession = async (userId, body) => {
    let durationMins = parseInt(body.durationMins) || DEFAULT_DURATION_MINS;

    // Enforce the cap — never let a session run longer than MAX_DURATION_MINS
    if (durationMins > MAX_DURATION_MINS) durationMins = MAX_DURATION_MINS;
    if (durationMins < 1) durationMins = DEFAULT_DURATION_MINS;

    const durationSeconds = durationMins * 60;

    // SET key value EX seconds
    // The value '1' is a placeholder — we only care that the key exists
    // and when it expires, not what it stores.
    await client.set(sessionKey(userId), '1', { EX: durationSeconds });

    return {
        active: true,
        durationMins,
        secondsRemaining: durationSeconds
    };
};

// END FOCUS SESSION EARLY
// Deletes the Redis key before it naturally expires.
// If there's no active session, we still return success — idempotent.
const endSession = async (userId) => {
    await client.del(sessionKey(userId));
    return { active: false, secondsRemaining: 0 };
};

// GET SESSION STATUS
// TTL returns:
//   -2 if the key doesn't exist (no active session)
//   -1 if the key exists but has no expiry (should never happen here)
//   A positive number = seconds remaining on the key
const getStatus = async (userId) => {
    const ttl = await client.ttl(sessionKey(userId));

    if (ttl <= 0) {
        // Session doesn't exist or has expired
        return { active: false, secondsRemaining: 0 };
    }

    return {
        active: true,
        secondsRemaining: ttl,
        minutesRemaining: Math.ceil(ttl / 60)  // handy for the frontend display
    };
};

module.exports = { startSession, endSession, getStatus };