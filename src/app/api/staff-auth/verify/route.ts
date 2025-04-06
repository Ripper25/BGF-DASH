import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, STAFF_TOKEN_COOKIE } from '@/config';

// Using JWT_SECRET from config

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get(STAFF_TOKEN_COOKIE)?.value;

    // If no token, check Authorization header
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Use token from cookie or header
    const staffToken = token || headerToken;

    if (!staffToken) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(staffToken, JWT_SECRET) as any;

    // Check if it's a staff token
    if (!decoded.is_staff) {
      return NextResponse.json(
        { message: 'Not a valid staff token' },
        { status: 401 }
      );
    }

    // Return staff data
    return NextResponse.json({
      message: 'Staff token verified',
      staff: {
        id: decoded.id,
        name: decoded.name,
        role: decoded.role,
        staff_number: decoded.staff_number,
        is_staff: decoded.is_staff,
        authenticated: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Staff token verification error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { message: 'Token expired' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Token verification failed', error: error.message },
      { status: 500 }
    );
  }
}
