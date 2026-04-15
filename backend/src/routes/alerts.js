/**
 * Alerts Routes
 * Provides endpoints for alert data
 */

const express = require('express');
const router = express.Router();
const queries = require('../models/queries');

/**
 * GET /api/alerts?limit=50
 * Get recent alerts
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const clampedLimit = Math.min(Math.max(limit, 1), 100);

    let alerts = [];
    try {
      alerts = await queries.getRecentAlerts(clampedLimit);
    } catch (dbError) {
      // DB unavailable - return empty array
      return res.json([]);
    }

    // Transform DB rows to API format
    const transformed = alerts.map(alert => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      entity: alert.entity,
      message: alert.message,
      details: alert.details_json,
      createdAt: alert.created_at,
      resolvedAt: alert.resolved_at,
    }));

    res.json(transformed);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
