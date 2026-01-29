/**
 * POST /api/auth/register
 * Register a new user
 * Body: { email: string, password: string, name?: string }
 */

import { prisma } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequest = await req.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
        name: name || null,
      },
    });

    // Create tokens
    // Convert time strings to seconds: 15m = 900s, 7d = 604800s
    const accessExpiry = process.env.JWT_EXPIRE_IN?.includes('m') 
      ? parseInt(process.env.JWT_EXPIRE_IN) * 60 
      : parseInt(process.env.JWT_EXPIRE_IN || '900');
    
    const refreshExpiry = process.env.JWT_REFRESH_EXPIRE_IN?.includes('d')
      ? parseInt(process.env.JWT_REFRESH_EXPIRE_IN) * 86400
      : parseInt(process.env.JWT_REFRESH_EXPIRE_IN || '604800');

    const accessToken = createToken(
      { userId: user.id, email: user.email },
      accessExpiry
    );

    const refreshToken = createToken(
      { userId: user.id, email: user.email },
      refreshExpiry
    );

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: { id: user.id, email: user.email, name: user.name },
        accessToken,
        refreshToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
