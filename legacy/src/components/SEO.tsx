
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  canonical?: string;
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'FranchiseHub - Multi-Brand Franchising Platform',
  description = 'Start your franchise journey with proven business models. Explore opportunities in food, retail, and service franchises across the Philippines.',
  keywords = 'franchise, business opportunity, investment, Philippines, food franchise, retail franchise',
  image = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  noIndex = false,
  canonical,
  structuredData
}) => {
  const siteTitle = 'FranchiseHub';
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteTitle,
    "description": description,
    "url": url,
    "logo": image,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+63-2-8123-4567",
      "contactType": "customer service",
      "areaServed": "PH",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ayala Avenue",
      "addressLocality": "Makati City",
      "addressRegion": "Metro Manila",
      "addressCountry": "Philippines"
    },
    "sameAs": [
      "https://www.facebook.com/franchisehub",
      "https://www.linkedin.com/company/franchisehub",
      "https://twitter.com/franchisehub"
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Enhanced Meta Tags */}
      <meta name="application-name" content={siteTitle} />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@franchisehub" />
      <meta name="twitter:creator" content="@franchisehub" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="FranchiseHub Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

export default React.memo(SEO);
