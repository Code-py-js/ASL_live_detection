#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * Usage:
 *   node scripts/db-setup.js        # Setup with default config
 *   NODE_ENV=test node scripts/db-setup.js  # Setup test database
 * 
 * This script:
 * 1. Connects to MongoDB (or in-memory for testing)
 * 2. Creates database indexes for optimal query performance
 * 3. Verifies collections exist
 * 4. Optionally seeds test data
 */

require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

const mongoose = require('mongoose');
const { mongoUri, useInMemoryDb } = require('../src/config');
const User = require('../src/models/User');
const Translation = require('../src/models/Translation');

const { logger } = require('../src/utils/logger');

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const SEED_DATA = process.env.SEED_DATA === 'true';

async function setupIndexes() {
  try {
    logger.info('Setting up database indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    logger.info('✓ User email index created');

    // Translation indexes
    await Translation.collection.createIndex({ userId: 1 });
    logger.info('✓ Translation userId index created');

    await Translation.collection.createIndex({ createdAt: -1 });
    logger.info('✓ Translation createdAt index created');

    await Translation.collection.createIndex({ userId: 1, createdAt: -1 });
    logger.info('✓ Translation userId + createdAt compound index created');

    logger.info('All indexes created successfully');
  } catch (error) {
    if (error.code === 11000) {
      logger.warn('Indexes already exist (this is expected on subsequent runs)');
    } else {
      logger.error('Error creating indexes:', error.message);
      throw error;
    }
  }
}

async function verifyCollections() {
  try {
    logger.info('Verifying collections...');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    logger.info(`Database collections: ${collectionNames.join(', ')}`);

    // Ensure collections exist
    if (!collectionNames.includes('users')) {
      await mongoose.connection.db.createCollection('users');
      logger.info('✓ Created users collection');
    } else {
      logger.info('✓ users collection exists');
    }

    if (!collectionNames.includes('translations')) {
      await mongoose.connection.db.createCollection('translations');
      logger.info('✓ Created translations collection');
    } else {
      logger.info('✓ translations collection exists');
    }
  } catch (error) {
    logger.error('Error verifying collections:', error.message);
    throw error;
  }
}

async function seedTestData() {
  if (!SEED_DATA) {
    logger.info('Skipping test data seeding (set SEED_DATA=true to seed)');
    return;
  }

  try {
    logger.info('Seeding test data...');

    // Clear existing data
    await User.deleteMany({});
    await Translation.deleteMany({});
    logger.info('Cleared existing test data');

    // Create test user
    const testUser = await User.create({
      email: 'test@example.com',
      password: 'TestPassword123!',
    });
    logger.info(`✓ Created test user: ${testUser.email} (ID: ${testUser._id})`);

    // Create sample translations
    const sampleTranslations = [
      {
        userId: testUser._id,
        signText: 'Hello',
        translatedText: 'Hello',
        confidence: 0.95,
      },
      {
        userId: testUser._id,
        signText: 'Thank you',
        translatedText: 'Thank you',
        confidence: 0.87,
      },
      {
        userId: testUser._id,
        signText: 'Yes',
        translatedText: 'Yes',
        confidence: 0.92,
      },
    ];

    const translations = await Translation.insertMany(sampleTranslations);
    logger.info(`✓ Created ${translations.length} sample translations`);
  } catch (error) {
    logger.error('Error seeding test data:', error.message);
    throw error;
  }
}

async function connect() {
  try {
    if (useInMemoryDb) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      logger.info('Creating in-memory MongoDB instance...');
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      logger.info('✓ Connected to in-memory MongoDB');
    } else {
      logger.info(`Connecting to MongoDB (${NODE_ENV})...`);
      await mongoose.connect(mongoUri);
      logger.info('✓ Connected to MongoDB');
    }

    logger.info(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    logger.error('Connection failed:', error.message);
    throw error;
  }
}

async function disconnect() {
  try {
    await mongoose.disconnect();
    logger.info('✓ Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting:', error.message);
  }
}

async function main() {
  logger.info('='.repeat(60));
  logger.info('Database Setup Script');
  logger.info('='.repeat(60));
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Seed data: ${SEED_DATA}`);

  try {
    await connect();
    await verifyCollections();
    await setupIndexes();
    await seedTestData();

    logger.info('='.repeat(60));
    logger.info('✓ Database setup completed successfully');
    logger.info('='.repeat(60));
  } catch (error) {
    logger.error('='.repeat(60));
    logger.error('✗ Database setup failed');
    logger.error('='.repeat(60));
    process.exit(1);
  } finally {
    await disconnect();
  }
}

main();
