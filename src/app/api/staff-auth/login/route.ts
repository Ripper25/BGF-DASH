import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, STAFF_TOKEN_COOKIE, STAFF_TOKEN_EXPIRY } from '@/config';
import { validateStaffAccessCode } from '@/lib/staff-access';

// Using JWT_SECRET from config

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { fullName, accessCode } = body;

    // Validate required fields
    if (!fullName || !accessCode) {
      return NextResponse.json(
        { message: 'Full name and access code are required' },
        { status: 400 }
      );
    }

    // Validate access code using the staff access module
    const staffDetails = await validateStaffAccessCode(accessCode);
    if (!staffDetails) {
      return NextResponse.json(
        { message: 'Invalid access code' },
        { status: 401 }
      );
    }

    // Create staff user object
    const staffUser = {
      id: `staff_${accessCode}`, // Generate a unique ID for the staff user
      name: fullName,
      role: staffDetails.role,
      staff_number: accessCode,
      is_staff: true, // Flag to identify staff users
      authenticated: true,
      timestamp: new Date().toISOString()
    };

    // Generate JWT token
    const token = jwt.sign(
      {
        id: staffUser.id,
        name: staffUser.name,
        role: staffUser.role,
        staff_number: staffUser.staff_number,
        is_staff: true // Flag to identify staff users
      },
      JWT_SECRET,
      { expiresIn: '4h' } // 4-hour expiration
    );

    // Set the token in a cookie
    const response = NextResponse.json(
      {
        message: 'Staff login successful',
        staff: staffUser,
        token
      },
      { status: 200 }
    );

    // Set the token in a cookie
    response.cookies.set({
      name: STAFF_TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      maxAge: STAFF_TOKEN_EXPIRY,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (error: any) {
    console.error('Staff login error:', error);
    return NextResponse.json(
      { message: 'Staff login failed', error: error.message },
      { status: 500 }
    );
  }
}
