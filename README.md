# BGF Dashboard

This is the Bridging Gaps Foundation (BGF) Dashboard application, built with [Next.js](https://nextjs.org) and [Supabase](https://supabase.com).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Features

- **User Authentication**: Regular users can sign up and log in using email and password
- **Staff Authentication**: Staff members can log in using their full name and access code
- **Role-Based Access Control**: Different user roles have access to different parts of the application
- **Request Management**: Users can submit requests and track their status
- **Workflow Management**: Staff members can process requests through a 5-stage workflow
- **Dashboard**: Different dashboards for different user roles

## Authentication

The application supports two types of authentication:

1. **Regular User Authentication**: Using Supabase Auth with email and password
2. **Staff Authentication**: Using a secure JWT-based authentication system

For more information about the staff authentication system, see the [Staff Authentication Flow](./docs/staff-auth-flow.md) document.

## Staff Access Codes

Staff access codes are stored in the `staff_access_codes` table in the Supabase database. Each access code is associated with a staff role, which determines the staff member's permissions in the application.

For more information about the staff access codes database, see the [Staff Access Codes Database](./docs/staff-access-codes-db.md) document.

## Deployment

The application can be deployed on [Vercel](https://vercel.com) or any other platform that supports Next.js applications.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
