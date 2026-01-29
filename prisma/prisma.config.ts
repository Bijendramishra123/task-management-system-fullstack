/**
 * Prisma Configuration
 * Handles database connection for Prisma 7+
 */

import { defineConfig } from '@prisma/internals';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
