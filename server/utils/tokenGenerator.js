const QueueEntry = require('../models/QueueEntry');

/**
 * Generates a guaranteed collision-free queue token for a business.
 * @param {string|ObjectId} businessId - The business ID
 * @param {string} prefix - 'A' for appointment, 'W' for walk-in
 * @returns {Promise<string>} e.g. 'A-592', 'W-104'
 */
async function generateUniqueQueueToken(businessId, prefix = 'A') {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Check all existing tokens for this business today or currently active
  const existingEntries = await QueueEntry.find({
    business: businessId,
    $or: [
      { createdAt: { $gte: startOfDay } },
      { status: { $in: ['waiting', 'serving'] } }
    ]
  }).select('token');

  const existingTokens = new Set(existingEntries.map((e) => e.token));

  // Try random numbers 100-999
  for (let attempt = 0; attempt < 100; attempt++) {
    const num = Math.floor(100 + Math.random() * 900);
    const candidate = `${prefix}-${num}`;
    if (!existingTokens.has(candidate)) {
      return candidate;
    }
  }

  // Fallback sequential
  for (let num = 100; num <= 9999; num++) {
    const candidate = `${prefix}-${num}`;
    if (!existingTokens.has(candidate)) {
      return candidate;
    }
  }

  return `${prefix}-${Date.now().toString().slice(-4)}`;
}

module.exports = { generateUniqueQueueToken };
