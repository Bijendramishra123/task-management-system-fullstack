/**
 * POST /api/tasks
 * Create a new task
 * Headers: Authorization: Bearer <token>
 * Body: { title: string, description?: string }
 */

import { prisma } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface CreateTaskRequest {
  title: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(req.headers.get('authorization') || '');
    if (!token) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body: CreateTaskRequest = await req.json();
    const { title, description } = body;

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        userId: payload.userId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        message: 'Task created successfully',
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Create task error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tasks
 * Get all tasks for authenticated user with pagination and filtering
 * Query params: page=1, limit=10, status=PENDING|COMPLETED
 */
export async function GET(req: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(req.headers.get('authorization') || '');
    if (!token) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '10'));
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build filter
    const where: any = { userId: payload.userId };
    
    if (status && ['PENDING', 'COMPLETED'].includes(status)) {
      where.status = status;
    }

    if (search && search.trim().length > 0) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get total count
    const total = await prisma.task.count({ where });

    // Get tasks
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    return NextResponse.json(
      {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Get tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
