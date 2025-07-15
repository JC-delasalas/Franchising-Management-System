# FranchiseHub Deployment Guide

This guide covers the complete deployment process for the FranchiseHub franchise management system.

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Git repository access
- Domain name (for production)

## Database Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down your project URL and anon key
4. Wait for the project to be fully provisioned

### 2. Deploy Database Schema

✅ **COMPLETED**: The database schema has been deployed to production Supabase instance.

For new deployments:
1. Copy all SQL commands from `supabase/migrations/` files
2. Run them in Supabase SQL Editor in order
3. Verify all 25 tables are created with proper relationships
4. Confirm all RLS policies are enabled
5. Test all database views are functional

### 3. Create Demo Users

**CRITICAL**: Follow these steps exactly:

#### Step 3.1: Create Auth Users
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" and create:
   ```
   User 1: franchisor@demo.com / demo123 (Email Confirm: true)
   User 2: franchisee@demo.com / demo123 (Email Confirm: true)
   User 3: admin@demo.com / demo123 (Email Confirm: true)
   ```

#### Step 3.2: Get Auth User IDs
1. In the Users table, copy the UUID for each user
2. Note them down:
   ```
   Franchisor ID: [copy from dashboard]
   Franchisee ID: [copy from dashboard]
   Admin ID: [copy from dashboard]
   ```

#### Step 3.3: Update and Run Setup Script
1. Open `scripts/create-demo-users.sql`
2. Replace all instances of:
   - `REPLACE_WITH_FRANCHISOR_AUTH_ID` → actual franchisor UUID
   - `REPLACE_WITH_FRANCHISEE_AUTH_ID` → actual franchisee UUID
   - `REPLACE_WITH_ADMIN_AUTH_ID` → actual admin UUID
3. Run the updated script in Supabase SQL Editor
4. Run `scripts/verify-demo-setup.sql` to confirm success

#### Step 3.4: Verification
Expected results from verification script:
- ✅ 3 demo auth users created
- ✅ 3 user profiles with correct roles
- ✅ Organization memberships established
- ✅ Franchise ownership assigned
- ✅ Location assignments completed

## Environment Configuration

### 1. Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase Configuration

Ensure the following settings in your Supabase project:

- **Authentication**: Email/Password enabled
- **RLS**: Enabled on all tables (already configured)
- **API**: Auto-generated API documentation enabled
- **Storage**: Configured if you plan to use file uploads

### 3. Security Configuration

✅ **Database Security** (Completed):
- [x] RLS policies on all 25 tables
- [x] Database functions with proper search_path
- [x] Performance indexes on all foreign keys
- [x] Secure views with security_invoker

🔧 **Authentication Security** (Manual Configuration Required):
- [ ] **OTP Expiry**: Go to Dashboard → Authentication → Settings → Set OTP expiry to 1800 seconds (30 minutes)
- [ ] **Password Protection**: Go to Dashboard → Authentication → Settings → Enable "Leaked Password Protection"

See `docs/SUPABASE_SECURITY_FIXES.md` for detailed instructions.

## Application Deployment

### 1. Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Deploy to Hosting Platform

#### Option A: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Option B: Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

#### Option C: Traditional Hosting

1. Upload the `dist` folder contents to your web server
2. Configure your web server to serve the SPA correctly
3. Ensure environment variables are properly set

### 3. Domain Configuration

1. Point your domain to your hosting platform
2. Configure SSL certificate
3. Update CORS settings in Supabase if needed

## Post-Deployment Verification

### 1. System Health Check

Run the system tests in the browser console:

```javascript
// Open browser console and run:
runSystemTests()
```

### 2. Manual Testing

1. **Authentication**: Test login with demo accounts
2. **Dashboard**: Verify data loads correctly
3. **Navigation**: Test all major routes
4. **API Integration**: Verify real-time data updates
5. **Responsive Design**: Test on mobile devices

### 3. Performance Monitoring

- Monitor Supabase dashboard for API usage
- Check application performance metrics
- Monitor error rates and user feedback

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] API keys not exposed in client code
- [ ] User input validation in place
- [ ] Audit logging enabled

## Maintenance

### Regular Tasks

1. **Database Maintenance**
   - Monitor query performance
   - Review and optimize slow queries
   - Clean up old audit logs periodically

2. **Security Updates**
   - Keep dependencies updated
   - Review and update RLS policies as needed
   - Monitor for security vulnerabilities

3. **Backup Strategy**
   - Supabase provides automatic backups
   - Consider additional backup strategies for critical data
   - Test restore procedures regularly

### Monitoring

1. **Application Monitoring**
   - Set up error tracking (e.g., Sentry)
   - Monitor application performance
   - Track user engagement metrics

2. **Database Monitoring**
   - Monitor Supabase dashboard for usage patterns
   - Set up alerts for high resource usage
   - Review slow query logs

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure user profiles exist

2. **Data Loading Issues**
   - Check network connectivity
   - Verify API endpoints
   - Review browser console for errors

3. **Performance Issues**
   - Optimize database queries
   - Implement proper caching
   - Review component re-rendering

### Support

For technical support:
- Check the GitHub repository issues
- Review the documentation
- Contact: jcedrick.delasalas@gmail.com

## Scaling Considerations

As your application grows, consider:

1. **Database Optimization**
   - Add database indexes for frequently queried columns
   - Implement database connection pooling
   - Consider read replicas for heavy read workloads

2. **Application Optimization**
   - Implement code splitting
   - Add service worker for offline functionality
   - Optimize bundle size

3. **Infrastructure**
   - Consider CDN for static assets
   - Implement proper caching strategies
   - Monitor and scale hosting resources

## Author

**John Cedrick de las Alas**
- Email: jcedrick.delasalas@gmail.com
- GitHub: [@JC-delasalas](https://github.com/JC-delasalas)

---

*This deployment guide is part of the FranchiseHub project. For the latest updates, please refer to the GitHub repository.*
