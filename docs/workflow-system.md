# BGF Dashboard Workflow System

This document provides a comprehensive overview of the workflow system implemented in the BGF Dashboard application.

## Overview

The BGF Dashboard implements a 5-stage workflow for processing requests:

1. **Request Submission**: Users submit requests that enter the workflow system.
2. **Assignment to Field Officer**: Head of Programs assigns requests to Assistant Project Officers or Regional Project Managers.
3. **Due Diligence Verification**: Assigned officers review and verify the requests.
4. **Programme Manager Review**: Head of Programs reviews the officer's verification and makes a decision.
5. **Management Forwarding**: Directors review and forward to CEO and Patron for final approval.

## Database Schema

### Main Tables

1. **requests**: Stores basic request information
   - `id`: UUID (primary key)
   - `ticket_number`: Unique identifier for the request
   - `user_id`: ID of the user who submitted the request
   - `request_type`: Type of request
   - `title`: Request title
   - `description`: Request description
   - `status`: Current status of the request

2. **request_workflow**: Tracks the workflow stages for each request
   - `id`: UUID (primary key)
   - `request_id`: ID of the request
   - `current_stage`: Current workflow stage
   - Various fields for each workflow stage (dates, notes, assigned users)

3. **workflow_comments**: Stores comments for each workflow stage
   - `id`: UUID (primary key)
   - `workflow_id`: ID of the workflow
   - `request_id`: ID of the request
   - `user_id`: ID of the user who made the comment
   - `comment`: Comment text
   - `stage`: Workflow stage the comment belongs to
   - `created_at`: When the comment was created

4. **request_documents**: Stores documents attached to requests
   - `id`: UUID (primary key)
   - `request_id`: ID of the request
   - `file_name`: Name of the file
   - `file_path`: Path to the file
   - `file_type`: Type of file
   - `uploaded_by`: ID of the user who uploaded the file
   - `created_at`: When the document was uploaded

### Views

1. **workflow_stages**: Organizes workflow fields into the 5-stage workflow
   - Combines data from `request_workflow`, `requests`, and `users` tables
   - Groups fields by workflow stage for easier access

## Workflow Stages

The workflow system defines the following stages:

1. **submission**: Initial request submission by user
2. **hop_review**: Head of Programs initial review
3. **officer_assignment**: Assignment to Assistant Project Officer or Regional Project Manager
4. **officer_review**: Review by assigned officer
5. **hop_final_review**: Head of Programs final review
6. **director_review**: Review by Director
7. **executive_approval**: Final approval by CEO and Patron
8. **completed**: Request completed

## Request Status

The request status is synchronized with the workflow stage:

1. **submitted**: Request has been submitted
2. **under_review**: Request is being reviewed at any stage
3. **pending_info**: Waiting for additional information
4. **officer_reviewed**: Reviewed by assigned officer
5. **hop_reviewed**: Reviewed by Head of Programs
6. **director_reviewed**: Reviewed by Director
7. **approved**: Approved by CEO and Patron
8. **rejected**: Rejected at any stage
9. **completed**: Request fully processed

## User Roles

The workflow system supports the following user roles:

1. **user**: Regular user who can submit requests
2. **assistant_project_officer**: Field Officer who reviews and processes requests
3. **project_manager**: Project Manager who reviews and processes requests
4. **head_of_programs**: Program Manager who oversees all requests and officers
5. **director**: Director who reviews and approves high-level requests
6. **ceo**: Chief Executive who provides final approval
7. **patron**: Patron who provides final approval
8. **admin**: Administrator with full system access

## Database Triggers and Functions

The workflow system includes several triggers and functions to ensure data integrity and synchronization:

1. **sync_workflow_stage_to_request_status**: Synchronizes workflow stages and request status
2. **sync_user_profile**: Synchronizes users and profiles tables
3. **sync_user_to_profile_trigger**: Trigger for the users table
4. **sync_profile_to_user_trigger**: Trigger for the profiles table

## Frontend Integration

The frontend uses the following utilities to integrate with the workflow system:

1. **status-formatter.ts**: Standardizes status format between frontend and backend
2. **StatusBadge.tsx**: Displays request status with appropriate styling

## API Endpoints

The workflow system exposes the following API endpoints:

1. **POST /api/workflow/:requestId/hop-initial-review**: Submit Head of Programs initial review
2. **POST /api/workflow/:requestId/assign-officer**: Assign a request to an officer
3. **POST /api/workflow/:requestId/officer-review**: Submit officer review
4. **POST /api/workflow/:requestId/hop-final-review**: Submit Head of Programs final review
5. **POST /api/workflow/:requestId/director-review**: Submit Director review
6. **POST /api/workflow/:requestId/executive-approval**: Submit executive approval

## Security Considerations

1. **Role-Based Access Control**: Different user roles have access to different parts of the workflow
2. **Data Integrity**: Foreign key and check constraints ensure data integrity
3. **Audit Trail**: Workflow comments and timestamps provide an audit trail

## Best Practices

1. **Use the workflow_stages view** for querying workflow data
2. **Use the status-formatter utilities** for converting between frontend and backend status formats
3. **Add comments to the workflow_comments table** with the appropriate stage
4. **Check user roles** before allowing access to workflow stages
