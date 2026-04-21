const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: ['ok', 'degraded']
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                     total:
 *                       type: number
 *                 database:
 *                   type: string
 *                   enum: ['connected', 'disconnected']
 */
router.get('/', (req, res) => {
  const status = mongoose.connection.readyState === 1 ? 'ok' : 'degraded';
  const memUsage = process.memoryUsage();
  
  res.json({
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
    },
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

module.exports = router;
