import React, { useEffect } from 'react';
import { config } from '@/config/environment';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Start your franchise journey with FranchiseHub. Discover profitable franchise opportunities in the Philippines with comprehensive support and proven business models.',
  keywords = 'franchise, business opportunity, Philippines, food franchise, investment, entrepreneur, business ownership',
  image = '/og-image.jpg',
  url,
  type = 'website',
  noIndex = false
}) => {
  const siteTitle = config.app.name;
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const fullUrl = url ? `${config.app.baseUrl}${url}` : config.app.baseUrl;
  const fullImage = image.startsWith('http') ? image : `${config.app.baseUrl}${image}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }

      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph meta tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', fullImage, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', siteTitle, true);

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImage);

    // Additional meta tags
    updateMetaTag('author', siteTitle);

    if (noIndex) {
      updateMetaTag('robots', 'noindex,nofollow');
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Add structured data
    let structuredData = document.querySelector('#structured-data');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.setAttribute('type', 'application/ld+json');
      structuredData.setAttribute('id', 'structured-data');
      document.head.appendChild(structuredData);
    }

    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": siteTitle,
      "url": config.app.baseUrl,
      "logo": `${config.app.baseUrl}/logo.png`,
      "description": description,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": config.contact.address,
        "addressCountry": "PH"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": config.contact.phone,
        "contactType": "customer service",
        "email": config.contact.email
      },
      "sameAs": [
        config.social.facebook,
        config.social.twitter,
        config.social.instagram,
        config.social.linkedin
      ]
    });
  }, [fullTitle, description, keywords, fullImage, fullUrl, type, noIndex, siteTitle]);

  return null;
};

export default SEO;
