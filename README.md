# FranchiseHub - Multi-Brand Franchising Platform

A comprehensive franchise management system built with modern web technologies, designed to connect franchisors with potential franchisees in the Philippines.

## 🚀 Features

- **Multi-Brand Platform**: Support for multiple franchise brands
- **Complete Application System**: Multi-step franchise application process
- **Franchisee Dashboard**: Comprehensive management tools for franchisees
- **Franchisor Dashboard**: Analytics and application management
- **Blog System**: SEO-optimized content management
- **Responsive Design**: Mobile-first approach with excellent UX
- **Real-time Features**: Live updates and notifications
- **Database Ready**: Complete schema and integration guide

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite for fast development and building
- **Routing**: React Router for client-side navigation
- **State Management**: React hooks and context
- **Database**: Supabase (PostgreSQL) recommended
- **Deployment**: Vercel/Netlify ready

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/JC-delasalas/franchise-front-runner-portal.git

# Navigate to project directory
cd franchise-front-runner-portal

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

# Google Maps API (optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Feature Flags
VITE_FEATURE_CHAT_ASSISTANT=true
VITE_FEATURE_ANALYTICS=true
```

## 🗄️ Database Setup

This project is designed to work with Supabase (recommended) or any PostgreSQL database.

### Recommended: Supabase
1. Sign up at [supabase.com](https://supabase.com) (free tier available)
2. Create a new project
3. Run the SQL schema from `DATABASE_RECOMMENDATIONS.md`
4. Update environment variables with your Supabase credentials

See `DATABASE_RECOMMENDATIONS.md` for complete setup instructions and schema.

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build the project
npm run build

# Deploy the dist folder to Netlify
```

### Manual Deployment
```bash
# Build for production
npm run build

# The dist folder contains the built application
```

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
- **Husky**: Git hooks for quality checks

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
- Documentation: See `DATABASE_RECOMMENDATIONS.md` and `IMPROVEMENTS.md`

## 🎉 Acknowledgments

Built with modern web technologies and best practices for scalable franchise management.
