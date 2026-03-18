import type { Metadata } from 'next';
import { Montserrat, Inter } from 'next/font/google';
import './globals.css';
import SiteShell from '@/components/SiteShell';
import { SITE } from '@/lib/config';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600', '700', '800', '900'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE.url,
  },
};

const businessSchema = {
  '@context': 'https://schema.org',
  '@type': 'RoofingContractor',
  name: 'Trust Proof Roofing LLC',
  description: "Trust Proof Roofing is Connecticut's only local roofer combining instant online pricing, detailed written documentation, and a standalone 20-year workmanship warranty.",
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  founder: { '@type': 'Person', name: SITE.owner },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Suffield',
    addressLocality: 'Suffield',
    addressRegion: 'CT',
    postalCode: '06078',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Hartford County, CT' },
    { '@type': 'AdministrativeArea', name: 'Tolland County, CT' },
    { '@type': 'AdministrativeArea', name: 'Fairfield County, CT' },
    { '@type': 'AdministrativeArea', name: 'New Haven County, CT' },
    { '@type': 'AdministrativeArea', name: 'Middlesex County, CT' },
    { '@type': 'AdministrativeArea', name: 'Windham County, CT' },
    { '@type': 'AdministrativeArea', name: 'Litchfield County, CT' },
    { '@type': 'AdministrativeArea', name: 'New London County, CT' },
  ],
  openingHours: 'Mo-Sa 08:00-20:00',
  image: `${SITE.url}/logo.png`,
  priceRange: '$',
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Trust Proof Roofing LLC',
  url: SITE.url,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-body bg-white text-gray-900 antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
