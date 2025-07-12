# 🏠 Local Development Setup Guide

## Prerequisites

Make sure you have these installed on your local machine:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Step 1: Create Project Directory

```bash
mkdir franchising-management-system
cd franchising-management-system
```

## Step 2: Initialize the Project

```bash
# Initialize npm project
npm init -y

# Install Vite and React
npm create vite@latest . -- --template react-ts

# Install all dependencies
npm install
```

## Step 3: Install Required Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install react-router-dom
npm install date-fns

# UI Dependencies
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label
npm install @radix-ui/react-popover
npm install @radix-ui/react-scroll-area
npm install @radix-ui/react-select
npm install @radix-ui/react-separator
npm install @radix-ui/react-slot
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast

# Utility dependencies
npm install class-variance-authority
npm install clsx
npm install tailwind-merge
npm install lucide-react

# Development dependencies
npm install -D @types/node
npm install -D tailwindcss
npm install -D postcss
npm install -D autoprefixer
```

## Step 4: Setup Tailwind CSS

```bash
# Initialize Tailwind
npx tailwindcss init -p
```

## Step 5: Environment Configuration

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://wbvmtialqbcveviphlsf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indidm10aWFscWJjdmV2aXBobHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDU0NzksImV4cCI6MjA2NTc4MTQ3OX0.ZB4U683r4jn_3pHI-KS3GxGQlvXcvVOAH9ZLke17e-8

# Optional: Service Role Key (for admin operations)
# VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Development Configuration
VITE_APP_ENV=development
VITE_APP_NAME=Franchise Management System
```

## Step 6: Project Structure

Create the following directory structure:

```
src/
├── components/
│   ├── ui/
│   ├── auth/
│   ├── dashboard/
│   ├── franchisor/
│   ├── notifications/
│   └── test/
├── contexts/
├── hooks/
├── pages/
├── services/
│   ├── database/
│   └── notifications/
├── config/
└── lib/
```

## Step 7: Configuration Files

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
})
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Step 8: Package.json Scripts

Update your package.json scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

## Step 9: Install Additional Dependencies

```bash
# Install missing dependencies
npm install tailwindcss-animate
npm install @vitejs/plugin-react
```

## Step 10: Run the Development Server

```bash
npm run dev
```

The application will be available at:
- **http://localhost:3000** (default Vite port)

## Step 11: Test the Application

Once running, test these routes:
- `http://localhost:3000/` - Home page
- `http://localhost:3000/test` - System test page
- `http://localhost:3000/diagnostic` - Diagnostic page
- `http://localhost:3000/franchisor-dashboard` - Main dashboard

## Troubleshooting

### Common Issues:

1. **Port already in use:**
   ```bash
   npm run dev -- --port 3001
   ```

2. **Module not found errors:**
   ```bash
   npm install
   npm run dev
   ```

3. **TypeScript errors:**
   ```bash
   npm run build
   ```

4. **Tailwind styles not loading:**
   - Check tailwind.config.js
   - Verify CSS imports in main.tsx

### Getting the Source Code

Since you're working with a development environment, you'll need to recreate the project structure and copy the source files. The key files you need are:

1. All files in `src/` directory
2. Configuration files (package.json, vite.config.ts, etc.)
3. Environment variables (.env)

## Next Steps

1. **Create the project structure** as shown above
2. **Copy all source files** from the development environment
3. **Install dependencies** using the commands provided
4. **Configure environment variables**
5. **Run the development server**

The application will then be running locally on your machine and you can access all the features we've built!
