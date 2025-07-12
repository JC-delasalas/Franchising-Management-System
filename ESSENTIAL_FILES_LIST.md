# 📁 Essential Files for Local Setup

## 🚀 Quick Start - Copy These Files First

### **Core Application Files**
```
src/
├── main.tsx                           # Application entry point
├── App.tsx                           # Main app component with routing
├── index.css                         # Global styles (create with Tailwind)
└── vite-env.d.ts                     # Vite type definitions
```

### **Configuration Files**
```
src/config/
└── environment.ts                    # Environment configuration

src/integrations/supabase/
├── client.ts                         # Supabase client setup
└── types.ts                          # Database type definitions
```

### **Essential Services (Core Functionality)**
```
src/services/database/
├── index.ts                          # Service exports
├── base.service.ts                   # Multi-tenant foundation
├── brand.service.ts                  # Brand management
├── auth.service.ts                   # Authentication
├── inventory.service.ts              # Inventory management
├── analytics.service.ts              # Performance analytics
├── audit.service.ts                  # System integrity
├── financial.service.ts              # Financial management
├── franchisee.service.ts             # Franchisee lifecycle
├── training.service.ts               # Training & development
├── crm.service.ts                    # Customer relationship
├── product.service.ts                # Product management
└── flexible-data.service.ts          # Multi-format data handling

src/services/notifications/
└── notification.service.ts           # Real-time notifications
```

### **Essential Hooks**
```
src/hooks/
├── useAuth.tsx                       # Authentication hook
├── useDatabase.ts                    # Database operations hooks
└── useRealtimeNotifications.ts       # Notification hooks
```

### **Key Components**
```
src/components/auth/
└── ProtectedRoute.tsx                # Route protection

src/components/dashboard/
└── DashboardOverview.tsx             # Main dashboard

src/components/franchisor/
├── FranchisorDashboard.tsx           # Franchisor command center
└── ProductManagement.tsx             # Product management interface

src/components/notifications/
└── NotificationCenter.tsx            # Notification center

src/components/test/
└── SupabaseConnectionTest.tsx        # System testing
```

### **Essential UI Components**
```
src/components/ui/
├── button.tsx                        # Button component
├── card.tsx                          # Card component
├── badge.tsx                         # Badge component
├── input.tsx                         # Input component
├── label.tsx                         # Label component
├── select.tsx                        # Select component
├── textarea.tsx                      # Textarea component
├── dialog.tsx                        # Dialog component
├── tabs.tsx                          # Tabs component
├── popover.tsx                       # Popover component
├── scroll-area.tsx                   # Scroll area component
├── separator.tsx                     # Separator component
└── toast.tsx                         # Toast notifications
```

### **Essential Pages**
```
src/pages/
├── Index.tsx                         # Home page
├── SupabaseTest.tsx                  # System test page
├── Diagnostic.tsx                    # Diagnostic page
├── FranchisorDashboard.tsx           # Franchisor dashboard page
├── SupabaseLogin.tsx                 # Login page
└── NotFound.tsx                      # 404 page
```

### **Utility Files**
```
src/lib/
└── utils.ts                          # Utility functions
```

## 📋 Step-by-Step Setup Process

### **1. Create Project Structure**
```bash
mkdir franchising-management-system
cd franchising-management-system
npm create vite@latest . -- --template react-ts
```

### **2. Install Dependencies**
```bash
# Core dependencies
npm install @supabase/supabase-js @tanstack/react-query react-router-dom date-fns

# UI dependencies
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toast

# Utility dependencies
npm install class-variance-authority clsx tailwind-merge lucide-react

# Development dependencies
npm install -D @types/node tailwindcss postcss autoprefixer tailwindcss-animate
```

### **3. Setup Tailwind CSS**
```bash
npx tailwindcss init -p
```

### **4. Create Environment File**
Create `.env` with:
```env
VITE_SUPABASE_URL=https://wbvmtialqbcveviphlsf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indidm10aWFscWJjdmV2aXBobHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDU0NzksImV4cCI6MjA2NTc4MTQ3OX0.ZB4U683r4jn_3pHI-KS3GxGQlvXcvVOAH9ZLke17e-8
VITE_APP_ENV=development
VITE_APP_NAME=Franchise Management System
```

### **5. Copy Essential Files**
Copy the files listed above from the development environment to your local project.

### **6. Update Configuration Files**

**vite.config.ts:**
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

**tsconfig.json:** (Add paths)
```json
{
  "compilerOptions": {
    // ... existing config
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### **7. Start Development Server**
```bash
npm run dev
```

## 🎯 Priority Order for File Copying

### **Phase 1: Core Setup (Get it running)**
1. Configuration files (environment.ts, supabase client)
2. Main app files (App.tsx, main.tsx)
3. Essential UI components
4. Basic pages (Index, Diagnostic)

### **Phase 2: Authentication & Services**
1. Auth hooks and components
2. Database services
3. Protected routes

### **Phase 3: Full Features**
1. Dashboard components
2. Franchisor interface
3. Notification system
4. Test components

## 🔧 Troubleshooting

### **Common Issues:**

1. **Missing UI Components:**
   - Copy all files from `src/components/ui/`
   - Install missing Radix UI packages

2. **Import Errors:**
   - Check file paths match exactly
   - Verify all dependencies are installed

3. **TypeScript Errors:**
   - Copy `src/integrations/supabase/types.ts`
   - Install `@types/node`

4. **Styling Issues:**
   - Setup Tailwind CSS properly
   - Copy the complete `index.css` with Tailwind directives

## 🎉 Success Indicators

When setup correctly, you should be able to:
- ✅ Access `http://localhost:3000/`
- ✅ Navigate to `/diagnostic` and see system status
- ✅ Visit `/test` for comprehensive testing
- ✅ Use `/franchisor-dashboard` for the main interface

The application will be fully functional with all the enhanced features we built!
