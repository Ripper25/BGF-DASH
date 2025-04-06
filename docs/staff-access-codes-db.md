# Staff Access Codes Database

This document provides information about the staff access codes database table in the BGF Dashboard application.

## Overview

The `staff_access_codes` table in the Supabase database stores staff access codes used for staff authentication. Each access code is associated with a staff role, which determines the staff member's permissions in the application.

## Table Structure

The `staff_access_codes` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, automatically generated |
| code | TEXT | Unique staff access code (e.g., 'APO001') |
| name | TEXT | Human-readable name for the role (e.g., 'Field Officer') |
| role | TEXT | Role identifier (e.g., 'assistant_project_officer') |
| created_at | TIMESTAMP | When the record was created |
| updated_at | TIMESTAMP | When the record was last updated |

## Row Level Security (RLS) Policies

The following RLS policies are applied to the `staff_access_codes` table:

1. **Authenticated users can read staff access codes**
   - Allows any authenticated user to read staff access codes
   - This is necessary for the staff login process

2. **Administrators can manage staff access codes**
   - Allows users with the 'admin' role to create, update, and delete staff access codes
   - This ensures that only administrators can manage staff access codes

## Default Staff Access Codes

The following staff access codes are inserted into the database by default:

| Code | Name | Role |
|------|------|------|
| APO001 | Field Officer | assistant_project_officer |
| RPM001 | Project Manager | project_manager |
| HOP001 | Program Manager | head_of_programs |
| DIR001 | Director | director |
| CEO001 | Chief Executive | ceo |
| PAT001 | Patron | patron |
| ADM001 | Administrator | admin |

## Usage in the Application

The staff access codes are used in the following ways:

1. **Staff Login**: Staff members enter their full name and access code to authenticate
2. **Role-Based Access Control**: The role associated with the access code determines what the staff member can access
3. **Login Guide**: The access codes are displayed in the login guide for demonstration purposes

## Fallback Mechanism

The application includes a fallback mechanism in case the database is unavailable. This is implemented in the `getFallbackStaffAccessCodes` function in `src/lib/staff-access.ts`. The fallback values match the default values inserted into the database.

In a production environment, the application should not rely on hardcoded fallback values. Instead, it should log an error and potentially trigger an alert if the database is unavailable.

## Managing Staff Access Codes

Staff access codes can be managed in the following ways:

1. **Supabase Dashboard**: Administrators can use the Supabase dashboard to manage staff access codes
2. **API**: The application includes an API for managing staff access codes (requires admin role)
3. **Database Migration**: The database migration script inserts the default staff access codes

## Security Considerations

1. **Access Code Security**: Staff access codes should be treated as sensitive information
2. **Role-Based Access Control**: The role associated with the access code determines what the staff member can access
3. **Row Level Security**: RLS policies ensure that only authorized users can manage staff access codes
4. **JWT Token**: The staff authentication process generates a JWT token with the staff member's role
5. **Token Expiration**: The JWT token expires after 4 hours, requiring the staff member to re-authenticate
