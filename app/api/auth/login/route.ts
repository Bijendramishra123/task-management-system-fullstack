/**
 * POST /api/auth/login
 * Authenticate user and return JWT tokens
 * Body: { email: string, password: string }
 */

import { prisma } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: LoginRequest = await req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken,
        refreshToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
