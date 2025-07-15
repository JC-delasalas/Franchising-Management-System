# FranchiseHub - Multi-Brand Franchising Platform

A comprehensive franchise management system built with React, TypeScript, and Supabase. This platform enables franchisors to manage multiple franchise brands and franchisees to operate their locations efficiently.

## Features

- **Multi-Brand Support**: Manage multiple franchise brands from a single platform
- **Real-time Analytics**: Live dashboard with KPIs, sales data, and performance metrics
- **Inventory Management**: Track stock levels, automate reordering, and manage suppliers
- **Order Management**: Complete order lifecycle from creation to delivery
- **Application Processing**: Streamlined franchise application and approval workflow
- **Role-Based Access**: Secure access control for franchisors, franchisees, and staff
- **Financial Tracking**: Revenue monitoring, royalty calculations, and payment processing

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time subscriptions)
- **State Management**: React Query (TanStack Query)
- **Authentication**: Supabase Auth with Row Level Security
- **Database**: PostgreSQL with 25+ tables and comprehensive relationships

## Getting Started

```bash
# Clone the repository
git clone https://github.com/JC-delasalas/Franchising-Management-System.git

# Navigate to project directory
cd Franchising-Management-System

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

## Environment Setup

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Demo Accounts

The system includes demo accounts for testing:

- **Franchisor**: `franchisor@demo.com` / `demo123`
- **Franchisee**: `franchisee@demo.com` / `demo123`
- **Admin**: `admin@demo.com` / `demo123`

## Database Schema

The system uses a comprehensive 25-table database schema including:

- **Core Tables**: Organizations, User Profiles, Franchises, Locations
- **Product Management**: Products, Inventory Levels, Warehouses, Stock Movements
- **Order Management**: Orders, Order Items, Shipments, Invoices, Payments
- **Analytics**: Performance Targets, Financial Transactions, Audit Logs
- **System**: Notifications, Settings, Organization Members

## Architecture

- **Frontend**: React with TypeScript for type safety
- **UI Components**: Shadcn/ui with Tailwind CSS for modern design
- **State Management**: React Query for server state and caching
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Database**: PostgreSQL with comprehensive relationships and constraints
- **Real-time**: Supabase real-time subscriptions for live updates

## Key Features

### For Franchisors
- Multi-brand franchise management
- Application review and approval workflow
- Network-wide analytics and reporting
- Inventory and order oversight
- Financial tracking and royalty management

### For Franchisees
- Location-specific dashboard and analytics
- Inventory management and automated reordering
- Order placement and tracking
- Performance monitoring against targets
- Financial reporting and payment tracking

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (RBAC)
- Secure API endpoints with proper authentication
- Data isolation between different user roles
- Audit logging for all critical operations

## Development

### Project Structure
```
src/
├── api/           # API layer with Supabase integration
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Application pages/routes
├── lib/           # Utility libraries and configurations
├── services/      # Business logic layer
└── types/         # TypeScript type definitions
```

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
```

## Testing

The system includes comprehensive testing utilities:

```javascript
// Run system integration tests in browser console
runSystemTests()
```

## Deployment

1. **Database Setup**: Deploy schema to Supabase
2. **Environment Variables**: Configure production environment
3. **Build**: Create production build
4. **Deploy**: Deploy to your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

**John Cedrick de las Alas**
- Email: jcedrick.delasalas@gmail.com
- GitHub: [@JC-delasalas](https://github.com/JC-delasalas)

## Support

For support and questions, please open an issue on GitHub or contact the author directly.

```
NODE_OPTIONS=--no-experimental-fetch yarn add supabase
```

> **Note**
For Bun versions below v1.0.17, you must add `supabase` as a [trusted dependency](https://bun.sh/guides/install/trusted) before running `bun add -D supabase`.

<details>
  <summary><b>macOS</b></summary>

  Available via [Homebrew](https://brew.sh). To install:

  ```sh
  brew install supabase/tap/supabase
  ```

  To install the beta release channel:
  
  ```sh
  brew install supabase/tap/supabase-beta
  brew link --overwrite supabase-beta
  ```
  
  To upgrade:

  ```sh
  brew upgrade supabase
  ```
</details>

<details>
  <summary><b>Windows</b></summary>

  Available via [Scoop](https://scoop.sh). To install:

  ```powershell
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

  To upgrade:

  ```powershell
  scoop update supabase
  ```
</details>

<details>
  <summary><b>Linux</b></summary>

  Available via [Homebrew](https://brew.sh) and Linux packages.

  #### via Homebrew

  To install:

  ```sh
  brew install supabase/tap/supabase
  ```

  To upgrade:

  ```sh
  brew upgrade supabase
  ```

  #### via Linux packages

  Linux packages are provided in [Releases](https://github.com/supabase/cli/releases). To install, download the `.apk`/`.deb`/`.rpm`/`.pkg.tar.zst` file depending on your package manager and run the respective commands.

  ```sh
  sudo apk add --allow-untrusted <...>.apk
  ```

  ```sh
  sudo dpkg -i <...>.deb
  ```

  ```sh
  sudo rpm -i <...>.rpm
  ```

  ```sh
  sudo pacman -U <...>.pkg.tar.zst
  ```
</details>

<details>
  <summary><b>Other Platforms</b></summary>

  You can also install the CLI via [go modules](https://go.dev/ref/mod#go-install) without the help of package managers.

  ```sh
  go install github.com/supabase/cli@latest
  ```

  Add a symlink to the binary in `$PATH` for easier access:

  ```sh
  ln -s "$(go env GOPATH)/bin/cli" /usr/bin/supabase
  ```

  This works on other non-standard Linux distros.
</details>

<details>
  <summary><b>Community Maintained Packages</b></summary>

  Available via [pkgx](https://pkgx.sh/). Package script [here](https://github.com/pkgxdev/pantry/blob/main/projects/supabase.com/cli/package.yml).
  To install in your working directory:

  ```bash
  pkgx install supabase
  ```

  Available via [Nixpkgs](https://nixos.org/). Package script [here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/tools/supabase-cli/default.nix).
</details>

### Run the CLI

<<<<<<< HEAD
```bash
supabase bootstrap
```

Or using npx:

```bash
npx supabase bootstrap
```

The bootstrap command will guide you through the process of setting up a Supabase project using one of the [starter](https://github.com/supabase-community/supabase-samples/blob/main/samples.json) templates.

## Docs

Command & config reference can be found [here](https://supabase.com/docs/reference/cli/about).

## Breaking changes

We follow semantic versioning for changes that directly impact CLI commands, flags, and configurations.

However, due to dependencies on other service images, we cannot guarantee that schema migrations, seed.sql, and generated types will always work for the same CLI major version. If you need such guarantees, we encourage you to pin a specific version of CLI in package.json.

## Developing

To run from source:

```sh
# Go >= 1.22
go run . help
```
=======
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
>>>>>>> d8c236e272e9ac681400e8e9183ffc31ac124827
