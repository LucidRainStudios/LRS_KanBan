#!/usr/bin/env node

/**
 * Simple database setup script
 */

const { Client } = require('pg');

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/lrs_kanban',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255),
        name VARCHAR(255),
        password VARCHAR(255),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('User table created/verified');

    // Create access_token table
    await client.query(`
      CREATE TABLE IF NOT EXISTS access_token (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Access token table created/verified');

    // Create card table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS card (
        id SERIAL PRIMARY KEY,
        position INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        timer JSONB,
        comment_count INTEGER DEFAULT 0,
        board_id INTEGER,
        list_id INTEGER,
        cover_attachment_id INTEGER,
        created_by_id INTEGER,
        updated_by_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if priority column exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'card'
        AND column_name = 'priority'
      );
    `);

    if (!result.rows[0].exists) {
      console.log('Adding priority and effort columns...');

      await client.query(`
        ALTER TABLE card
        ADD COLUMN priority VARCHAR(10),
        ADD COLUMN effort INTEGER;
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_card_priority ON card(priority);
      `);

      console.log('Successfully added priority and effort columns');
    } else {
      console.log('Priority and effort columns already exist');
    }

    // Check if test user exists
    const userCheck = await client.query(`
      SELECT * FROM "user" WHERE email = 'test@test.com';
    `);

    if (userCheck.rows.length === 0) {
      // Insert test user
      await client.query(`
        INSERT INTO "user" (email, username, name, password, is_admin)
        VALUES ('test@test.com', 'testuser', 'Test User', 'password123', true);
      `);

      console.log('Test user created:');
      console.log('Email: test@test.com');
      console.log('Password: password123');
    } else {
      console.log('Test user already exists:');
      console.log('Email: test@test.com');
      console.log('Password: password123');
    }
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
