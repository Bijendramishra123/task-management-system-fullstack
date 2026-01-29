# Task Management System - Deployment Guide

## Overview
This is a full-stack Task Management System built with:
- **Frontend**: Next.js 16 + React 19 + shadcn/ui
- **Backend**: Node.js + Express-style API routes
- **Database**: PostgreSQL (Neon)
- **Hosting**: Vercel (free)

## Quick Start - Deploy in 5 Minutes

### Step 1: Setup Neon Database (Free)
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy your connection string (looks like: `postgresql://user:password@...`)

### Step 2: Deploy to Vercel
1. Push code to GitHub (recommended)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Select your GitHub repository
5. In "Environment Variables" section, add:
   ```
   DATABASE_URL=<your_neon_connection_string>
   JWT_SECRET=<generate_random_secret>
   ```
   - Generate JWT_SECRET: Use `openssl rand -hex 32` in terminal
6. Click "Deploy"

### Step 3: Initialize Database
After deployment:
1. Run the setup script in Vercel CLI or manually execute SQL:
   ```sql
   -- Execute the contents of /scripts/setup-database.sql
   ```
2. Or use Neon's SQL editor to run the migration

**That's it! Your app is now live! 🎉**

## Environment Variables

### Required Variables
```env
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE_IN=900        # 15 minutes in seconds
JWT_REFRESH_EXPIRE_IN=604800  # 7 days in seconds
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-vercel-domain.vercel.app
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get user's tasks (paginated, filterable)
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

All task endpoints require `Authorization: Bearer <token>` header.

## Features

✅ User Authentication (JWT)
✅ Task CRUD Operations
✅ Task Status Management (Pending/Completed)
✅ Search & Filter Tasks
✅ Pagination
✅ Responsive Design
✅ Dark Mode Support
✅ Toast Notifications

## Database Schema

### Users Table
```sql
- id (string, primary key)
- email (string, unique)
- password (string, hashed)
- name (string, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tasks Table
```sql
- id (string, primary key)
- title (string)
- description (string, optional)
- status (enum: PENDING, COMPLETED)
- user_id (foreign key to users)
- created_at (timestamp)
- updated_at (timestamp)
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   └── tasks/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ProtectedRoute.tsx
│   ├── TaskCard.tsx
│   ├── TaskDialog.tsx
│   └── ui/
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── api-client.ts
├── prisma/
│   └── schema.prisma
└── scripts/
    └── setup-database.sql
```

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use Neon)

### Setup
```bash
# Clone repository
git clone <repo-url>
cd task-management-system

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local with your database URL and JWT_SECRET

# Run migrations
npm run db:push  # If using Prisma
# Or manually execute /scripts/setup-database.sql

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## Production Deployment Checklist

- [x] Database URL configured in Vercel
- [x] JWT_SECRET set (random, secure)
- [x] NEXT_PUBLIC_API_URL points to Vercel domain
- [x] Database migrations executed
- [x] CORS headers configured (if needed)
- [x] Error logging enabled
- [x] Rate limiting considered for APIs

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon firewall settings allow Vercel IPs
- Ensure SSL mode is set to `require` in connection string

### Authentication Not Working
- Check JWT_SECRET is set
- Verify token is sent in Authorization header
- Check token hasn't expired

### Tasks Not Loading
- Verify user is authenticated
- Check Authorization header is being sent
- View browser console for API errors

## Free Tier Limits

**Neon Database**:
- 3 projects
- 10 GB storage
- Unlimited databases per project
- Automatic suspensions after 7 days of inactivity (free tier)

**Vercel**:
- 100 Deployments/day
- 100 GB Bandwidth/month
- Unlimited serverless functions
- 6 Concurrent builds

## Support & Resources

- Neon Docs: https://neon.tech/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- PostgreSQL Docs: https://www.postgresql.org/docs

## License
MIT

---

**Built with v0 by Vercel**
