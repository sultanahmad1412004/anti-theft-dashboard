import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';

export const NotFoundPage: React.FC = () => {
  return (
    <PublicPageWrapper
      title="404 — Signal Lost | Anti-Theft"
      description="The requested page coordinate was not found on Anti-Theft."
      robots="noindex, nofollow"
      canonicalPath="/404"
    >
      <div className="min-h-screen bg-[#0F172A] text-[#E2E8F0] flex flex-col justify-between">
        <Navbar />

        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold font-heading text-[#E2E8F0] mb-2">
              404 — Signal Lost
            </h1>
            <p className="text-sm text-[#94A3B8] mb-8 leading-relaxed">
              The telemetry coordinate or page path you requested does not exist or has been relocated by the security perimeter.
            </p>
            <Link to="/">
              <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Safe Ground
              </Button>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </PublicPageWrapper>
  );
};
