# Task Management System

A modern, full-stack task management application built with Next.js, React, and PostgreSQL.

## Features

- **User Authentication**: Secure JWT-based authentication with password hashing
- **Task Management**: Create, read, update, delete tasks
- **Task Status Tracking**: Mark tasks as pending or completed
- **Search & Filter**: Find tasks by title and filter by status
- **Pagination**: Efficiently load tasks (10 per page)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode**: Full dark mode support with proper contrast
- **Real-time Notifications**: Toast notifications for user actions

## Quick Start

### Prerequisites
- Node.js 18+
- A Neon PostgreSQL database (free at [neon.tech](https://neon.tech))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd task-management-system

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your database URL and JWT secret to .env.local
# DATABASE_URL=postgresql://...
# JWT_SECRET=your-secret-key

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000` and start managing your tasks!

## Tech Stack

### Frontend
- **Next.js 16**: Modern React framework with App Router
- **React 19**: Latest React features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built, customizable components
- **SWR**: Data fetching with caching
- **React Hook Form**: Efficient form handling
- **Sonner**: Beautiful toast notifications

### Backend
- **Next.js API Routes**: Serverless backend
- **PostgreSQL**: Reliable relational database
- **JWT**: Secure authentication tokens
- **Bcrypt**: Password hashing

### Hosting
- **Vercel**: Automatic deployments, free tier included
- **Neon**: PostgreSQL database hosting

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy to Vercel:**
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add `DATABASE_URL` and `JWT_SECRET` environment variables
4. Deploy!

## API Documentation

### Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Tasks

All task endpoints require authentication header:
```
Authorization: Bearer <access_token>
```

#### Get Tasks
```
GET /api/tasks?page=1&limit=10&status=PENDING&search=query
```

#### Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title",
  "description": "Optional description"
}
```

#### Update Task
```
PATCH /api/tasks/{id}
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "COMPLETED"
}
```

#### Delete Task
```
DELETE /api/tasks/{id}
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── TaskCard.tsx
│   ├── TaskDialog.tsx
│   └── ProtectedRoute.tsx
├── contexts/             # React Context
│   └── AuthContext.tsx
├── lib/                  # Utility functions
│   ├── auth.ts
│   ├── db.ts
│   └── api-client.ts
├── prisma/              # Database schema
└── scripts/             # Database setup
```

## Key Files

- **`/app/api/auth/`**: Authentication endpoints
- **`/app/api/tasks/`**: Task management endpoints
- **`/app/dashboard/page.tsx`**: Main dashboard interface
- **`/contexts/AuthContext.tsx`**: Global auth state management
- **`/lib/auth.ts`**: JWT and password utilities
- **`/lib/db.ts`**: Database connection management
- **`/.env.local`**: Environment variables (create from example)

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRE_IN=900                    # 15 minutes
JWT_REFRESH_EXPIRE_IN=604800         # 7 days

# Application
NODE_ENV=development|production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © 2026

## Support

For issues and questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
2. Review API documentation above
3. Check browser console for errors
4. Verify environment variables are set correctly

---

**Built with ❤️ using v0 by Vercel**
