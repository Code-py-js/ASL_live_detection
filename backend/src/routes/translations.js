const express = require('express');
const validator = require('validator');

const Translation = require('../models/Translation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/translations:
 *   post:
 *     summary: Create a new translation record
 *     tags:
 *       - Translations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inputText:
 *                 type: string
 *                 description: Input text to translate
 *               outputText:
 *                 type: string
 *                 description: Output translation text
 *               confidence:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 description: Confidence score of translation
 *             required:
 *               - inputText
 *               - outputText
 *     responses:
 *       201:
 *         description: Translation record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Translation'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - valid JWT required
 *       500:
 *         description: Server error
 */
// Create translation record
router.post('/', authenticate, async (req, res) => {
  try {
    const { inputText, outputText, confidence } = req.body;

    // Validate input fields
    if (!inputText || typeof inputText !== 'string' || inputText.trim() === '') {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'inputText is required and must be a non-empty string',
        timestamp: new Date().toISOString()
      });
    }
    if (!outputText || typeof outputText !== 'string' || outputText.trim() === '') {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'outputText is required and must be a non-empty string',
        timestamp: new Date().toISOString()
      });
    }
    if (typeof confidence !== 'undefined' && typeof confidence !== 'number') {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'confidence must be a number',
        timestamp: new Date().toISOString()
      });
    }
    if (typeof confidence === 'number' && (confidence < 0 || confidence > 1)) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'confidence must be between 0 and 1',
        timestamp: new Date().toISOString()
      });
    }

    // Sanitize input to prevent XSS
    const sanitizedInput = validator.escape(inputText.trim());
    const sanitizedOutput = validator.escape(outputText.trim());

    const translation = await Translation.create({
      userId: req.user.userId,
      inputText: sanitizedInput,
      outputText: sanitizedOutput,
      confidence: typeof confidence === 'number' ? confidence : 0,
    });

    res.status(201).json(translation);
  } catch (err) {
    console.error('Create translation error:', err);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create translation',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/translations:
 *   get:
 *     summary: Retrieve user's translation history with pagination
 *     tags:
 *       - Translations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: List of user's translations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Translation'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: Unauthorized - valid JWT required
 *       500:
 *         description: Server error
 */
// Get translations for the user
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const translations = await Translation.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Translation.countDocuments({ userId: req.user.userId });

    res.json({
      data: translations,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Get translations error:', err);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve translations',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
