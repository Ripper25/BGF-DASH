# Staff Authentication Flow

This document describes the secure staff authentication flow implemented in the BGF Dashboard application.

## Overview

The staff authentication system provides a secure way for staff members to authenticate with the application using their full name and a unique access code. The system uses JWT tokens for authentication and authorization, with role-based access control.

## Authentication Flow

1. **Staff Login**:
   - Staff member enters their full name and access code on the staff login page.
   - Frontend sends a POST request to `/api/staff-auth/login` with the credentials.
   - Backend validates the access code against a list of valid codes.
   - If valid, backend generates a JWT token containing staff information and role.
   - Token is returned to the frontend and stored in both localStorage and a cookie.

2. **Token Verification**:
   - On page load or navigation, the frontend verifies the token by calling `/api/staff-auth/verify`.
   - Backend validates the token signature and expiration.
   - If valid, staff information is returned to the frontend.

3. **Middleware Protection**:
   - Next.js middleware intercepts all requests to protected routes.
   - Middleware checks for the presence of a valid staff token in cookies.
   - If token is valid, middleware adds staff information to request headers.
   - If token is invalid or missing, middleware redirects to the login page.

4. **Role-Based Access Control**:
   - Staff roles are embedded in the JWT token.
   - Frontend components use the staff role to determine what UI elements to show.
   - Backend API routes can use the staff role from request headers to authorize actions.

## API Endpoints

### POST /api/staff-auth/login

Authenticates a staff member with their full name and access code.

**Request Body**:
```json
{
  "fullName": "John Doe",
  "accessCode": "APO001"
}
```

**Response (200 OK)**:
```json
{
  "message": "Staff login successful",
  "staff": {
    "id": "staff_APO001",
    "name": "John Doe",
    "role": "assistant_project_officer",
    "staff_number": "APO001",
    "is_staff": true,
    "authenticated": true,
    "timestamp": "2023-04-06T08:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized)**:
```json
{
  "message": "Invalid access code"
}
```

### GET /api/staff-auth/verify

Verifies a staff token and returns staff information.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "message": "Staff token verified",
  "staff": {
    "id": "staff_APO001",
    "name": "John Doe",
    "role": "assistant_project_officer",
    "staff_number": "APO001",
    "is_staff": true,
    "authenticated": true,
    "timestamp": "2023-04-06T08:00:00.000Z"
  }
}
```

**Response (401 Unauthorized)**:
```json
{
  "message": "Invalid token"
}
```

## Staff Roles

The system supports the following staff roles:

- `admin`: Administrator with full access
- `assistant_project_officer`: Field Officer
- `project_manager`: Project Manager
- `head_of_programs`: Program Manager
- `director`: Director
- `ceo`: Chief Executive
- `patron`: Patron

## Security Considerations

1. **JWT Token Security**:
   - Tokens are signed with a secret key.
   - Tokens expire after 4 hours.
   - Tokens contain staff role information for authorization.

2. **Access Code Security**:
   - Access codes are currently hardcoded but should be moved to a secure database or environment variables in production.
   - Each access code is associated with a specific role.

3. **Cookie Security**:
   - Staff token is stored in a cookie with SameSite=Strict attribute.
   - Cookie is used by middleware for server-side authentication.

4. **LocalStorage Security**:
   - Staff token is also stored in localStorage for client-side authentication.
   - This allows for a seamless user experience while maintaining security.

## Future Improvements

1. **Move access codes to a secure database** or environment variables.
2. **Implement refresh tokens** for longer sessions.
3. **Add two-factor authentication** for additional security.
4. **Implement more granular role-based access control** for specific routes and actions.
5. **Add audit logging** for authentication events.
