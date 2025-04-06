# BGF Dashboard Staff Authentication System

This document provides an overview of the staff authentication system implemented in the BGF Dashboard application.

## Overview

The BGF Dashboard includes a secure staff authentication system that allows staff members to log in using their full name and a unique access code. The system uses JWT tokens for authentication and authorization, with role-based access control.

## Features

- **Secure JWT-based authentication**: Staff members are authenticated using JWT tokens with a 4-hour expiration.
- **Role-based access control**: Different staff roles have access to different parts of the application.
- **Server-side validation**: Access codes are validated on the server side.
- **Middleware protection**: Protected routes are guarded by middleware that checks for valid staff tokens.
- **Environment variable configuration**: Staff access codes and JWT secret can be configured via environment variables.

## Staff Roles

The system supports the following staff roles:

- `admin`: Administrator with full access
- `assistant_project_officer`: Field Officer
- `regional_project_manager`: Regional Manager
- `head_of_programs`: Program Manager
- `director`: Director
- `ceo`: Chief Executive
- `patron`: Patron

## Configuration

### Environment Variables

The following environment variables can be configured in `.env.local`:

```
# JWT secret for staff authentication
JWT_SECRET=your-secret-key

# Staff access codes - JSON string of access codes and roles
STAFF_ACCESS_CODES={"APO001":{"name":"Field Officer","role":"assistant_project_officer"},"RPM001":{"name":"Project Manager","role":"project_manager"},"HOP001":{"name":"Program Manager","role":"head_of_programs"},"DIR001":{"name":"Director","role":"director"},"CEO001":{"name":"Chief Executive","role":"ceo"},"PAT001":{"name":"Patron","role":"patron"},"ADM001":{"name":"Administrator","role":"admin"}}
```

## Implementation Details

### API Endpoints

- `POST /api/staff-auth/login`: Authenticates a staff member with their full name and access code.
- `GET /api/staff-auth/verify`: Verifies a staff token and returns staff information.

### Frontend Services

- `staffAuthService`: Provides methods for staff login, token verification, and logout.
- `apiService`: Includes the staff token in API requests.

### Middleware

The Next.js middleware intercepts all requests to protected routes and checks for valid staff tokens.

## Security Considerations

1. **JWT Token Security**:
   - Tokens are signed with a secret key.
   - Tokens expire after 4 hours.
   - Tokens contain staff role information for authorization.

2. **Access Code Security**:
   - Access codes can be configured via environment variables.
   - Each access code is associated with a specific role.

3. **Cookie Security**:
   - Staff token is stored in a cookie with SameSite=Strict attribute.
   - Cookie is used by middleware for server-side authentication.

## Usage

### Staff Login

1. Navigate to `/staff-login`.
2. Enter your full name and access code.
3. Click "Sign In".

### Protected Routes

Protected routes require a valid staff token. If you try to access a protected route without being authenticated, you will be redirected to the login page.

### Logout

Click the "Logout" button in the sidebar to log out. This will clear the staff token from both localStorage and cookies.

## Documentation

For more detailed information about the staff authentication flow, see the [Staff Authentication Flow](./docs/staff-auth-flow.md) document.
