import React from 'react';
import { SEO, SEOProps, sharedWebSiteSchema } from './SEO';

export interface PublicPageSEOProps extends Omit<SEOProps, 'includeWebSiteSchema'> {
  customSchemas?: Record<string, any>[];
}

/**
 * Standardized Schema.org Organization JSON-LD definition.
 */
export const sharedOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Anti-Theft',
  url: 'https://anti-theft.sultanahmad.site',
  logo: 'https://anti-theft.sultanahmad.site/logo.png',
  founder: {
    '@type': 'Person',
    name: 'Sultan Ahmad',
    url: 'https://sultanahmad.site',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'sultanahmad.real1@gmail.com',
    contactType: 'technical support',
    availableLanguage: ['English'],
    areaServed: 'Global',
  },
  sameAs: [
    'https://sultanahmad.site',
    'https://twitter.com/sultanahmad'
  ],
};

/**
 * PublicPageSEO: Wraps public pages to inject consistent site-wide
 * WebSite and Organization schemas, alongside any page-specific schemas (FAQ, How-To, Product).
 */
export const PublicPageSEO: React.FC<PublicPageSEOProps> = ({
  customSchemas = [],
  schemas = [],
  ...props
}) => {
  // Combine core WebSite and Organization with page-level custom schemas
  const mergedSchemas = [
    sharedWebSiteSchema,
    sharedOrganizationSchema,
    ...customSchemas,
    ...schemas,
  ];

  return (
    <SEO
      {...props}
      includeWebSiteSchema={false} // Already merged explicitly
      schemas={mergedSchemas}
    />
  );
};
