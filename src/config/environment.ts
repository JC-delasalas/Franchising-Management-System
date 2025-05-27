// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.franchisehub.ph',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  },

  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'FranchiseHub',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.NODE_ENV || 'development',
    baseUrl: import.meta.env.VITE_APP_BASE_URL || 'https://franchisehub.ph',
  },

  // Contact Information
  contact: {
    phone: import.meta.env.VITE_CONTACT_PHONE || '+63 2 8123 4567',
    email: import.meta.env.VITE_CONTACT_EMAIL || 'info@franchisehub.ph',
    address: import.meta.env.VITE_CONTACT_ADDRESS || 'Ayala Avenue, Makati City, Metro Manila, Philippines 1226',
    coordinates: {
      lat: parseFloat(import.meta.env.VITE_CONTACT_LAT || '14.5547'),
      lng: parseFloat(import.meta.env.VITE_CONTACT_LNG || '121.0244')
    }
  },

  // Social Media
  social: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || 'https://facebook.com/franchisehub',
    twitter: import.meta.env.VITE_SOCIAL_TWITTER || 'https://twitter.com/franchisehub',
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM || 'https://instagram.com/franchisehub',
    linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN || 'https://linkedin.com/company/franchisehub',
  },

  // Feature Flags
  features: {
    chatAssistant: import.meta.env.VITE_FEATURE_CHAT_ASSISTANT !== 'false',
    analytics: import.meta.env.VITE_FEATURE_ANALYTICS !== 'false',
    errorReporting: import.meta.env.VITE_FEATURE_ERROR_REPORTING !== 'false',
  },

  // Third-party Services
  services: {
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  },

  // Security
  security: {
    maxFileUploadSize: parseInt(import.meta.env.VITE_MAX_FILE_UPLOAD_SIZE || '5242880'), // 5MB
    allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(','),
  },

  // Business Hours
  businessHours: {
    weekdays: import.meta.env.VITE_BUSINESS_HOURS_WEEKDAYS || 'Monday - Friday: 8AM - 6PM',
    saturday: import.meta.env.VITE_BUSINESS_HOURS_SATURDAY || 'Saturday: 9AM - 4PM',
    sunday: import.meta.env.VITE_BUSINESS_HOURS_SUNDAY || 'Sunday: Closed',
  },
};

// Validation function to ensure required environment variables are set
export const validateConfig = () => {
  const requiredVars = [
    'VITE_APP_NAME',
    'VITE_CONTACT_EMAIL',
    'VITE_CONTACT_PHONE',
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missing.length > 0 && config.app.environment === 'production') {
    console.warn('Missing required environment variables:', missing);
  }

  return missing.length === 0;
};

// Helper functions
export const isDevelopment = () => config.app.environment === 'development';
export const isProduction = () => config.app.environment === 'production';
export const isFeatureEnabled = (feature: keyof typeof config.features) => config.features[feature];

export default config;
