# Supabase Setup Guide

This document provides a comprehensive guide for setting up and using Supabase with the Franchise Management System.

## Prerequisites

- Supabase CLI installed (already done)
- Node.js and npm/yarn/bun for package management
- Access to the Supabase project dashboard

## Project Configuration

### Environment Variables

The following environment variables need to be configured in your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ktugncuiwjoatopnialp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Getting the Anon Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ktugncuiwjoatopnialp/settings/api)
2. Copy the "anon public" key
3. Replace the placeholder in your `.env` file

## Database Schema

The database includes the following main tables:

### Core Tables

1. **user_profiles** - Extended user information
2. **franchises** - Franchise listings and details
3. **franchise_applications** - Applications from potential franchisees
4. **franchise_locations** - Physical franchise locations
5. **franchise_documents** - Document storage references
6. **franchise_reviews** - User reviews and ratings
7. **franchise_analytics** - Performance metrics

### Key Features

- **Row Level Security (RLS)** enabled on all tables
- **UUID primary keys** for better security
- **Automatic timestamps** with triggers
- **Comprehensive indexing** for performance
- **Data validation** with CHECK constraints

## Authentication

The system uses Supabase Auth with the following features:

- Email/password authentication
- User profiles linked to auth.users
- Role-based access control
- Session management

### User Roles

- `user` - Regular users browsing franchises
- `franchisee` - Franchise owners/operators
- `franchisor` - Franchise brand owners
- `admin` - System administrators

## API Usage

### Authentication

```typescript
import { useSupabase } from '../contexts/SupabaseContext'

const { signIn, signUp, signOut, user } = useSupabase()

// Sign in
const { data, error } = await signIn(email, password)

// Sign up
const { data, error } = await signUp(email, password, { full_name: 'John Doe' })

// Sign out
await signOut()
```

### Database Operations

```typescript
import { FranchiseService, UserService } from '../lib/database'

// Get all franchises
const { data: franchises, error } = await FranchiseService.getFranchises()

// Create a franchise
const { data: franchise, error } = await FranchiseService.createFranchise({
  name: 'My Franchise',
  category: 'Food & Beverage',
  // ... other fields
})

// Get user profile
const { data: profile, error } = await UserService.getUserProfile(userId)
```

### File Storage

```typescript
import { StorageService } from '../lib/database'

// Upload file
const { data, error } = await StorageService.uploadFile(
  'franchise-documents',
  'path/to/file.pdf',
  file
)

// Get public URL
const url = StorageService.getPublicUrl('franchise-documents', 'path/to/file.pdf')
```

## Local Development

### Starting Local Supabase

```bash
# Start all services
~/bin/supabase.exe start

# Check status
~/bin/supabase.exe status

# Stop services
~/bin/supabase.exe stop
```

### Database Migrations

```bash
# Create a new migration
~/bin/supabase.exe migration new migration_name

# Apply migrations
~/bin/supabase.exe db push

# Reset database (careful!)
~/bin/supabase.exe db reset
```

### Generating Types

```bash
# Generate TypeScript types from database schema
~/bin/supabase.exe gen types typescript --local > src/types/database.ts
```

## Production Deployment

### Database Migrations

```bash
# Link to production project
~/bin/supabase.exe link --project-ref ktugncuiwjoatopnialp

# Push migrations to production
~/bin/supabase.exe db push
```

### Environment Setup

Ensure all environment variables are properly set in your production environment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Security Considerations

1. **Never expose service role key** in client-side code
2. **Use RLS policies** to protect sensitive data
3. **Validate user input** before database operations
4. **Use proper authentication** for all protected routes
5. **Regularly audit** database permissions

## Troubleshooting

### Common Issues

1. **Authentication errors**: Check if anon key is correct
2. **Permission denied**: Verify RLS policies
3. **Connection issues**: Ensure Supabase URL is correct
4. **Migration failures**: Check SQL syntax and dependencies

### Useful Commands

```bash
# Check Supabase CLI version
~/bin/supabase.exe --version

# View project status
~/bin/supabase.exe status

# View logs
~/bin/supabase.exe logs

# Open Supabase Studio
~/bin/supabase.exe studio
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Design](https://supabase.com/docs/guides/database/overview)
