#!/usr/bin/env node

/**
 * Create a test user for development
 */

const { Client } = require('pg');

async function createTestUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/lrs_kanban'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if user table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'user'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('User table does not exist. Creating basic user table...');

      // Create a basic user table for development
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

      console.log('User table created');
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
    console.error('Error creating test user:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestUser();
