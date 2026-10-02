import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string | string[];
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  ogImageAlt?: string;
  robots?: string;
  includeWebSiteSchema?: boolean;
  includeOrganizationSchema?: boolean;
  schemas?: Record<string, any>[];
}

/**
 * Standardized Schema.org Organization JSON-LD definition
 * highlighting creator authority and portfolio links to sultanahmad.site
 */
export const sharedOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://anti-theft.sultanahmad.site/#organization',
  name: 'Anti-Theft',
  alternateName: ['Anti-Theft Security Systems', 'Android Anti-Theft App', 'Project-101 Anti-Theft'],
  url: 'https://anti-theft.sultanahmad.site',
  logo: {
    '@type': 'ImageObject',
    url: 'https://anti-theft.sultanahmad.site/anti-theft-logo.png',
    width: 512,
    height: 512,
    caption: 'Anti-Theft Android Mobile Security Platform',
  },
  founder: {
    '@type': 'Person',
    name: 'Sultan Ahmad',
    url: 'https://sultanahmad.site',
    jobTitle: 'Founder & Lead Security Systems Engineer',
    sameAs: ['https://sultanahmad.site'],
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      email: 'support@sultanahmad.site',
      contactType: 'customer support',
      availableLanguage: ['English'],
      areaServed: 'Worldwide',
    },
    {
      '@type': 'ContactPoint',
      email: 'support@sultanahmad.site',
      contactType: 'technical support',
      availableLanguage: ['English'],
    },
  ],
  sameAs: [
    'https://sultanahmad.site',
  ],
};

/**
 * Standardized Schema.org WebSite JSON-LD definition
 */
export const sharedWebSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://anti-theft.sultanahmad.site/#website',
  name: 'Anti-Theft App',
  alternateName: ['Android Anti-Theft', 'Remote Phone Control System', 'Anti-Theft APK'],
  url: 'https://anti-theft.sultanahmad.site',
  description: 'Real-time anti theft app and remote phone control system for Android with live GPS tracking, lockscreen shutdown protection, and optical screenshots.',
  publisher: {
    '@id': 'https://anti-theft.sultanahmad.site/#organization',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://anti-theft.sultanahmad.site/download?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'en-US',
};

/**
 * Standardized SoftwareApplication Schema
 */
export const sharedSoftwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Anti-Theft: Android Anti Theft & Remote Phone Control',
  operatingSystem: 'Android 8.0, Android 9.0, Android 10, Android 11, Android 12, Android 13, Android 14, Android 15, Android 16',
  applicationCategory: 'SecurityApplication',
  softwareVersion: '1.0.0',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free basic plan with physical device protection; Pro defense annual license at $1.00/year.'
  },
  author: {
    '@type': 'Person',
    name: 'Sultan Ahmad',
    url: 'https://sultanahmad.site'
  },
  downloadUrl: 'https://anti-theft.sultanahmad.site/download'
};

/**
 * Dynamically computes a canonical URL based on the current origin and normalized path
 */
export function computeCanonicalUrl(explicitUrl?: string, explicitPath?: string): string {
  const fallbackOrigin = 'https://anti-theft.sultanahmad.site';
  
  if (typeof window === 'undefined') {
    const rawPath = explicitPath || (explicitUrl && explicitUrl.startsWith('/') ? explicitUrl : '/');
    const normalized = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
    return `${fallbackOrigin}${normalized}`;
  }

  const origin = window.location.origin || fallbackOrigin;
  let rawPath = window.location.pathname;

  if (explicitPath) {
    rawPath = explicitPath;
  } else if (explicitUrl) {
    if (explicitUrl.startsWith('http://') || explicitUrl.startsWith('https://')) {
      try {
        const parsed = new URL(explicitUrl);
        rawPath = parsed.pathname;
      } catch {
        rawPath = explicitUrl;
      }
    } else {
      rawPath = explicitUrl;
    }
  }

  const cleanPathOnly = rawPath.split('?')[0].split('#')[0];
  const normalizedPath = cleanPathOnly.length > 1 ? cleanPathOnly.replace(/\/+$/, '') : cleanPathOnly || '/';

  return `${origin}${normalizedPath}`;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://anti-theft.sultanahmad.site/og-image.png',
  ogImageAlt = 'Anti-Theft Android Mobile Security Dashboard & APK Download',
  robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  includeWebSiteSchema = true,
  includeOrganizationSchema = true,
  schemas = [],
}) => {
  const resolvedCanonical = useMemo(
    () => computeCanonicalUrl(canonicalUrl, canonicalPath),
    [canonicalUrl, canonicalPath]
  );

  const keywordStr = useMemo(() => {
    const baseKeywords = ['anti theft app', 'android anti theft', 'remote phone control'];
    if (!keywords) return baseKeywords.join(', ');
    const userKeywords = Array.isArray(keywords) ? keywords : [keywords];
    const set = new Set([...userKeywords, ...baseKeywords]);
    return Array.from(set).join(', ');
  }, [keywords]);

  // Aggregate structured data schemas
  const aggregatedSchemas = useMemo(() => {
    const finalSchemas: Record<string, any>[] = [];

    const hasSchemaType = (type: string) =>
      schemas.some((s) => {
        const t = s['@type'];
        return Array.isArray(t) ? t.includes(type) : t === type;
      });

    if (includeWebSiteSchema && !hasSchemaType('WebSite')) {
      finalSchemas.push(sharedWebSiteSchema);
    }

    if (includeOrganizationSchema && !hasSchemaType('Organization')) {
      finalSchemas.push(sharedOrganizationSchema);
    }

    finalSchemas.push(...schemas);
    return finalSchemas;
  }, [includeWebSiteSchema, includeOrganizationSchema, schemas]);

  return (
    <Helmet prioritizeSeoTags>
      {/* 1. Page Title */}
      <title>{title}</title>

      {/* 2. Primary Meta Tags */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordStr} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="bingbot" content={robots} />
      <meta name="author" content="Sultan Ahmad (https://sultanahmad.site)" />

      {/* 3. Canonical Link */}
      <link rel="canonical" href={resolvedCanonical} />

      {/* 4. OpenGraph Social Cards */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:site_name" content="Anti-Theft" />
      <meta property="og:locale" content="en_US" />

      {/* 5. Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={resolvedCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      <meta name="twitter:creator" content="@sultanahmad" />

      {/* 6. JSON-LD Structured Data */}
      {aggregatedSchemas.map((schema, index) => (
        <script key={`json-ld-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
