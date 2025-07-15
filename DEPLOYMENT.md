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

The database schema has already been deployed to the production Supabase instance. If you need to deploy to a new instance:

1. Copy all the SQL commands from the migration files in `supabase/migrations/`
2. Run them in the Supabase SQL Editor in the following order:
   - Core tables (organizations, user_profiles, etc.)
   - Franchise tables (franchises, packages, applications, locations)
   - Product and inventory tables
   - Order management tables
   - Analytics and performance tables
   - Views and functions
   - RLS policies

### 3. Create Demo Users

1. Go to Supabase Dashboard > Authentication > Users
2. Create three users manually:
   - Email: `franchisor@demo.com`, Password: `demo123`
   - Email: `franchisee@demo.com`, Password: `demo123`
   - Email: `admin@demo.com`, Password: `demo123`
3. Copy their auth user IDs
4. Update the `scripts/create-demo-users.sql` file with the actual IDs
5. Run the updated script in Supabase SQL Editor

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
