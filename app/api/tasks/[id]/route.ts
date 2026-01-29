/**
 * PATCH /api/tasks/[id]
 * Update a task
 * PUT /api/tasks/[id]
 * Update a task (alias)
 * DELETE /api/tasks/[id]
 * Delete a task
 */

import { prisma } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'COMPLETED';
}

/**
 * Update a task
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const body: UpdateTaskRequest = await req.json();
    const updateData: any = {};

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    if (body.description !== undefined) {
      updateData.description = body.description || null;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: 'Task updated successfully',
        task: updatedTask,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Update task error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

/**
 * Update a task (PUT alias)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}

/**
 * Delete a task
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Delete task (must belong to user)
    const result = await prisma.task.deleteMany({
      where: {
        id,
        userId: payload.userId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Delete task error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
