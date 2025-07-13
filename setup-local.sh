#!/bin/bash

# Franchise Management System - Local Setup Script
echo "🚀 Setting up Franchise Management System locally..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Create project directory
PROJECT_NAME="franchising-management-system"
echo "📁 Creating project directory: $PROJECT_NAME"

if [ -d "$PROJECT_NAME" ]; then
    echo "⚠️  Directory $PROJECT_NAME already exists. Please remove it or choose a different name."
    exit 1
fi

mkdir $PROJECT_NAME
cd $PROJECT_NAME

# Initialize Vite React TypeScript project
echo "⚡ Initializing Vite React TypeScript project..."
npm create vite@latest . -- --template react-ts --yes

# Install core dependencies
echo "📦 Installing core dependencies..."
npm install @supabase/supabase-js @tanstack/react-query react-router-dom date-fns

# Install UI dependencies
echo "🎨 Installing UI dependencies..."
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toast

# Install utility dependencies
echo "🔧 Installing utility dependencies..."
npm install class-variance-authority clsx tailwind-merge lucide-react

# Install development dependencies
echo "🛠️  Installing development dependencies..."
npm install -D @types/node tailwindcss postcss autoprefixer tailwindcss-animate

# Initialize Tailwind CSS
echo "🎨 Setting up Tailwind CSS..."
npx tailwindcss init -p

# Create environment file
echo "🔐 Creating environment configuration..."
cat > .env << EOL
# Supabase Configuration
VITE_SUPABASE_URL=https://wbvmtialqbcveviphlsf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indidm10aWFscWJjdmV2aXBobHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDU0NzksImV4cCI6MjA2NTc4MTQ3OX0.ZB4U683r4jn_3pHI-KS3GxGQlvXcvVOAH9ZLke17e-8

# Development Configuration
VITE_APP_ENV=development
VITE_APP_NAME=Franchise Management System
EOL

# Update Vite config
echo "⚙️  Updating Vite configuration..."
cat > vite.config.ts << EOL
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
EOL

# Update TypeScript config
echo "📝 Updating TypeScript configuration..."
cat > tsconfig.json << EOL
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
EOL

# Create directory structure
echo "📂 Creating project structure..."
mkdir -p src/components/ui
mkdir -p src/components/auth
mkdir -p src/components/dashboard
mkdir -p src/components/franchisor
mkdir -p src/components/notifications
mkdir -p src/components/test
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/pages
mkdir -p src/services/database
mkdir -p src/services/notifications
mkdir -p src/config
mkdir -p src/lib

# Create a basic index.css with Tailwind
echo "🎨 Setting up Tailwind CSS..."
cat > src/index.css << EOL
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOL

echo "✅ Basic setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy all source files from the development environment to the src/ directory"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📁 Project created in: $(pwd)"
echo "🚀 Ready to start development!"
EOL
