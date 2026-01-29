/**
 * Database connection using Prisma ORM
 * Handles PostgreSQL connection via Neon
 * DATABASE_URL must be set in .env.local or environment
 */

import { PrismaClient } from '@prisma/client';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Get the database URL from environment
const databaseUrl = process.env.DATABASE_URL;

// Validate DATABASE_URL is set
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please check your .env.local file.'
  );
}

export const prisma = 
  global.prismaGlobal ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

/**
 * Legacy query function for backward compatibility
 */
export async function query(
  queryString: string,
  values?: (string | number | boolean | null)[]
) {
  try {
    const result = await prisma.$queryRawUnsafe(queryString, ...(values || []));
    return {
      rows: Array.isArray(result) ? result : [result],
      rowCount: Array.isArray(result) ? result.length : 1,
    };
  } catch (error) {
    console.error('[v0] Database query error:', error);
    throw error;
  }
}
