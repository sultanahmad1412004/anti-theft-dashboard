import React, { createContext, useContext, useMemo } from 'react';
import { 
  SEO, 
  SEOProps, 
  sharedWebSiteSchema, 
  sharedOrganizationSchema, 
  computeCanonicalUrl 
} from './SEO';

export interface PublicPageWrapperProps extends Omit<SEOProps, 'includeWebSiteSchema' | 'includeOrganizationSchema'> {
  children?: React.ReactNode;
  /** Optional container class name when wrapping JSX */
  className?: string;
  /** Force disable Organization schema injection if explicitly requested */
  disableOrganizationSchema?: boolean;
  /** Force disable WebSite schema injection if explicitly requested */
  disableWebSiteSchema?: boolean;
}

interface SEOContextValue {
  title: string;
  description: string;
  canonicalUrl: string;
  webSiteSchema: typeof sharedWebSiteSchema;
  organizationSchema: typeof sharedOrganizationSchema;
  pageSchemas: Record<string, any>[];
}

const PublicSEOContext = createContext<SEOContextValue | null>(null);

/**
 * Hook to access current public SEO context and structured data properties
 */
export const usePublicSEO = (): SEOContextValue | null => {
  return useContext(PublicSEOContext);
};

/**
 * PublicPageWrapper: A production-grade SEO utility component that wraps all public pages.
 * 
 * - Injects a consistent, site-wide JSON-LD 'WebSite' schema.
 * - Injects a consistent, site-wide JSON-LD 'Organization' schema.
 * - Allows individual pages to inject their own specific schemas (such as FAQPage, HowTo, Product, SoftwareApplication)
 *   without conflicting or duplicating.
 * - Dynamically computes canonical tags based on the current URL path.
 * - Sets keyword-rich meta tags, OpenGraph social cards, and Twitter Cards.
 */
export const PublicPageWrapper: React.FC<PublicPageWrapperProps> = ({
  children,
  className,
  title,
  description,
  keywords,
  canonicalPath,
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://anti-theft.sultanahmad.site/og-image.png',
  ogImageAlt = 'Anti-Theft Android Mobile Security Dashboard & APK Download',
  robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  disableOrganizationSchema = false,
  disableWebSiteSchema = false,
  schemas = [],
}) => {
  // Resolve canonical URL for this page
  const resolvedCanonicalUrl = useMemo(
    () => computeCanonicalUrl(canonicalUrl, canonicalPath),
    [canonicalUrl, canonicalPath]
  );

  // Validate and deduplicate incoming page schemas so they don't collide with WebSite or Organization
  const sanitizedPageSchemas = useMemo(() => {
    return (schemas || []).map((schema) => {
      // Ensure schema has @context
      if (!schema['@context']) {
        return { '@context': 'https://schema.org', ...schema };
      }
      return schema;
    });
  }, [schemas]);

  const contextValue = useMemo<SEOContextValue>(() => ({
    title,
    description,
    canonicalUrl: resolvedCanonicalUrl,
    webSiteSchema: sharedWebSiteSchema,
    organizationSchema: sharedOrganizationSchema,
    pageSchemas: sanitizedPageSchemas,
  }), [title, description, resolvedCanonicalUrl, sanitizedPageSchemas]);

  return (
    <PublicSEOContext.Provider value={contextValue}>
      {/* Head & Meta Injection with WebSite & Organization structured data */}
      <SEO
        title={title}
        description={description}
        keywords={keywords}
        canonicalPath={canonicalPath}
        canonicalUrl={canonicalUrl}
        ogType={ogType}
        ogImage={ogImage}
        ogImageAlt={ogImageAlt}
        robots={robots}
        includeWebSiteSchema={!disableWebSiteSchema}
        includeOrganizationSchema={!disableOrganizationSchema}
        schemas={sanitizedPageSchemas}
      />

      {/* Render children or container wrapper */}
      {className ? (
        <div className={className}>
          {children}
        </div>
      ) : (
        children
      )}
    </PublicSEOContext.Provider>
  );
};

// Aliases for developer convenience
export const PublicSEO = PublicPageWrapper;
export const SEOWrapper = PublicPageWrapper;
export const PublicPageSEO = PublicPageWrapper;

export default PublicPageWrapper;
