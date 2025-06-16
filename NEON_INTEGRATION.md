# Neon.tech + Clerk Integration

This project demonstrates a complete integration between Clerk authentication and Neon.tech PostgreSQL database in a Next.js App Router application.

## 🚀 Features Implemented

### Database Integration
- ✅ **Neon PostgreSQL** connection with serverless driver
- ✅ **Drizzle ORM** for type-safe database operations
- ✅ **Database migrations** with automatic schema generation
- ✅ **Connection testing** and health checks

### User Management
- ✅ **User profiles** synced with Clerk user data
- ✅ **User preferences** storage and management
- ✅ **Activity logging** for user actions
- ✅ **Subscription tracking** (ready for billing integration)

### Application Features
- ✅ **Dashboard** with user stats and message management
- ✅ **Profile management** with preferences
- ✅ **Message storage** (quotes/notes) per user
- ✅ **Activity history** tracking
- ✅ **Real-time data** with server actions

## 📊 Database Schema

### Tables Created

1. **user_profiles** - Extended user information
   - `user_id` (Primary Key) - Clerk user ID
   - `email`, `firstName`, `lastName`, `imageUrl`
   - `preferences` (JSON) - User settings
   - `createdAt`, `updatedAt` timestamps

2. **user_messages** - User-specific messages/quotes
   - `user_id` (Primary Key) - Clerk user ID
   - `message` - User's saved message
   - `createTs` - Creation timestamp

3. **user_subscriptions** - Subscription tracking
   - `id` (Primary Key)
   - `user_id` - Clerk user ID
   - `plan_name`, `status` - Subscription details
   - Stripe integration fields
   - Period tracking

4. **user_activity_log** - Activity tracking
   - `id` (Primary Key)
   - `user_id` - Clerk user ID
   - `action` - Action performed
   - `details` (JSON) - Additional data
   - `ip_address`, `user_agent` - Request info

## 🛠️ Technical Implementation

### Database Connection
```typescript
// src/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

### Server Actions
```typescript
// src/lib/actions.ts
'use server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';

export async function createUserMessage(formData: FormData) {
  const user = await currentUser();
  // Database operations with user.id
}
```

### Data Queries
```typescript
// src/lib/queries.ts
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';

export async function getUserProfile() {
  const user = await currentUser();
  return db.query.UserProfiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.user_id, user.id),
  });
}
```

## 🔧 Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon Database
DATABASE_URL=postgresql://neondb_owner:...@ep-....neon.tech/neondb?sslmode=require
```

## 📱 Pages and Features

### `/dashboard` - Main Dashboard
- User statistics and overview
- Message management (CRUD operations)
- Recent activity display
- Database connection status
- Quick navigation links

### `/profile` - Profile Management
- User information display (synced from Clerk)
- Preferences management (theme, notifications)
- Activity history
- Quick action buttons

### `/api/test-db` - Database Health Check
- Connection testing endpoint
- Database version information
- Table listing
- Error handling and diagnostics

## 🔄 Data Flow

1. **User Authentication** - Handled by Clerk
2. **Profile Sync** - Automatic profile creation/update on dashboard visit
3. **Data Operations** - Server actions with Clerk user context
4. **Activity Logging** - Automatic logging of user actions
5. **Real-time Updates** - Using Next.js revalidation

## 🚀 Getting Started

### 1. Database Setup
```bash
# Generate migrations
npx drizzle-kit generate

# Apply to database
npx drizzle-kit push
```

### 2. Test Connection
Visit `/api/test-db` to verify database connectivity

### 3. Use the Application
1. Sign in with Clerk
2. Visit `/dashboard` to see your data
3. Manage profile at `/profile`
4. All data is automatically synced with your Clerk user ID

## 🔍 Key Integration Points

### Clerk User ID as Primary Key
- All database tables use Clerk's `user.id` as the primary key
- Ensures data isolation between users
- Automatic cleanup when users are deleted

### Automatic Profile Sync
- User profiles are created/updated automatically
- Syncs email, name, and image from Clerk
- Maintains additional preferences in database

### Activity Tracking
- All user actions are logged automatically
- Includes action type, details, and metadata
- Useful for analytics and debugging

### Type Safety
- Full TypeScript support with Drizzle ORM
- Type-safe database queries and mutations
- Compile-time error checking

## 🔐 Security Features

- **Row-level security** through Clerk user ID filtering
- **Server-side validation** in all actions
- **Error handling** with proper error messages
- **Input sanitization** in form processing

## 📈 Performance Optimizations

- **Serverless database** connection with Neon
- **Connection pooling** built into Neon
- **Efficient queries** with Drizzle ORM
- **Minimal data fetching** with targeted queries

## 🧪 Testing

### Database Connection Test
```bash
curl http://localhost:3001/api/test-db
```

### Manual Testing
1. Sign up/sign in with different users
2. Create and manage messages
3. Update preferences
4. Check activity logs
5. Verify data isolation between users

## 🚀 Next Steps

1. **Add more features** - Extend the schema for your use case
2. **Implement caching** - Add Redis for performance
3. **Add analytics** - Track user behavior patterns
4. **Backup strategy** - Implement data backup procedures
5. **Monitoring** - Add database performance monitoring

## 📚 Resources

- [Neon Documentation](https://neon.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
