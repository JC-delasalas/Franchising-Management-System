
# Franchise Management System

A comprehensive multi-tenant franchise management platform built with modern web technologies, designed to support franchise operations across multiple brands and networks. The system implements 10 primary objectives to ensure scalable, secure, and efficient franchise management.

## 🎯 Primary Objectives

1. **Centralized Brand & Product Management** - Maintain brand consistency and control product catalogs
2. **Scalable Multi-Tenant Architecture** - Securely host multiple independent franchisor networks
3. **Secure Role-Based Access Control** - Granular permissions and user management
4. **Efficient Inventory & Supply Chain Monitoring** - Real-time visibility and optimization
5. **Data-Driven Performance Analytics** - Transform operational data into business intelligence
6. **Automated Financial Management & Billing** - Complete revenue cycle automation
7. **Comprehensive Franchisee Lifecycle Management** - End-to-end franchisee journey management
8. **Standardized Training & Development** - Consistent, high-quality training programs
9. **Streamlined Customer Relationship Management** - Centralized customer data and loyalty programs
10. **Robust Auditing & System Integrity** - Complete audit trail for security and compliance

## 🚀 Key Features

- **Multi-Tenant Architecture**: Complete data isolation between franchisors
- **Brand Management**: Support for multiple brands per franchisor
- **Role-Based Access Control**: Granular permissions and security
- **Real-time Analytics**: Performance dashboards and KPI tracking
- **Inventory Management**: Supply chain optimization and tracking
- **Training Platform**: Comprehensive learning management system
- **Contract Management**: Digital agreements and lifecycle tracking
- **Financial Management**: Automated billing and subscription management
- **Audit Logging**: Complete security and compliance tracking
- **API-First Design**: RESTful APIs with real-time capabilities

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** with shadcn/ui components for modern UI
- **React Router v6** for client-side routing
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Lucide React** for consistent iconography

### Backend & Database
- **Supabase** for backend-as-a-service
- **PostgreSQL** with advanced features (JSONB, RLS, etc.)
- **Row-Level Security (RLS)** for multi-tenant data isolation
- **Real-time subscriptions** for live updates
- **Edge Functions** for serverless computing

### Development & Deployment
- **Vite** for fast development and building
- **TypeScript** for type safety across the stack
- **ESLint & Prettier** for code quality
- **Supabase CLI** for database management
- **Vercel/Netlify** ready deployment

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/your-username/franchisehub.git

# Navigate to project directory
cd franchisehub

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Application Configuration
VITE_APP_NAME=FranchiseHub
VITE_APP_BASE_URL=https://franchisehub.ph

# Contact Information
VITE_CONTACT_PHONE=+63 2 8123 4567
VITE_CONTACT_EMAIL=info@franchisehub.ph
VITE_CONTACT_ADDRESS=Ayala Avenue, Makati City, Metro Manila, Philippines

# Google Maps API (optional - fallback map active by default)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Feature Flags
VITE_FEATURE_CHAT_ASSISTANT=true
VITE_FEATURE_ANALYTICS=true
```

## 📊 Analytics Dashboard

Comprehensive analytics and KPI tracking with advanced charting capabilities:

- **Multi-Period Analysis**: Month-to-Date, Quarter-to-Date, Year-to-Date views
- **Interactive Charts**: Line, bar, area, and pie charts with Recharts
- **KPI Tracking**: Sales trends, target achievement, growth metrics
- **Performance Insights**: Automated alerts and actionable recommendations
- **Responsive Design**: Mobile-friendly charts and dashboards
- **Documentation**: See `docs/ANALYTICS_DASHBOARD.md` for detailed guide

Features include sales trend analysis, franchisee performance tracking, and revenue distribution by brand.

## 🗺️ Maps Integration

The platform includes Google Maps integration with an intelligent fallback system:

- **Fallback Map (Active)**: Beautiful custom map design with navigation links
- **Google Maps API (Optional)**: Interactive maps with full functionality
- **Setup Guide**: See `docs/GOOGLE_MAPS_SETUP.md` for detailed instructions

The fallback map provides excellent user experience without API costs.

## 🗄️ Database Setup

This project is designed to work with Supabase (recommended) or any PostgreSQL database.

### Recommended: Supabase
1. Sign up at [supabase.com](https://supabase.com) (free tier available)
2. Create a new project
3. Run the SQL schema from `DATABASE_RECOMMENDATIONS.md`
4. Update environment variables with your Supabase credentials

See `DATABASE_RECOMMENDATIONS.md` for complete setup instructions and schema.

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Platforms
- **Vercel**: Connect your repository for automatic deployments
- **Netlify**: Deploy the `dist` folder after building
- **Manual**: Upload the `dist` folder to any static hosting service

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── apply/          # Application form components
├── pages/              # Page components
│   └── franchisee/     # Franchisee dashboard pages
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── assets/             # Static assets
```

## 🎯 Key Features

### For Franchisees
- **Dashboard**: Complete management interface
- **Sales Reporting**: Upload and track daily sales
- **Inventory Management**: Order supplies and track stock
- **Marketing Assets**: Download promotional materials
- **Support System**: Submit and track support requests
- **Contract Management**: View agreements and upgrade options

### For Franchisors
- **Application Management**: Review and approve applications
- **Analytics Dashboard**: Monitor franchise performance
- **Content Management**: Update marketing materials
- **Support Oversight**: Manage support tickets

### Public Features
- **Multi-Brand Showcase**: Display multiple franchise opportunities
- **Application System**: Complete multi-step application process
- **Blog System**: SEO-optimized content marketing
- **Contact System**: Lead generation and inquiries

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Git Hooks**: Quality checks on commit

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: Optimized with code splitting
- **Loading Speed**: Fast initial load with lazy loading
- **SEO**: Comprehensive meta tags and structured data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: info@franchisehub.ph
- Phone: +63 2 8123 4567
- Documentation: See `DATABASE_RECOMMENDATIONS.md` for setup instructions

## 🎉 Acknowledgments

Built with modern web technologies and best practices for scalable franchise management.
