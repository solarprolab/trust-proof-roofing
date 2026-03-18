import type { Metadata } from 'next';
import { SITE } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${SITE.name}. Learn how we collect, use, and protect your personal information.`,
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'November 24, 2025';

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-brand-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-brand-200 text-sm">Effective Date: {EFFECTIVE_DATE}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto prose prose-gray prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline">

          <p className="text-gray-600 leading-relaxed">
            {SITE.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard information when you
            visit our website (<strong>trustproofroofing.com</strong>) or submit a contact or estimate request.
            Please read this policy carefully.
          </p>

          {/* 1 */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed">
            We collect information you voluntarily provide when you submit a contact form or
            request a free estimate. This may include:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Project details (e.g., service type, property address, description of work)</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            We do not collect payment information through this website. No account registration
            is required to use our site.
          </p>

          {/* 2 */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed">
            The information you provide is used solely to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
            <li>Respond to your inquiry or estimate request</li>
            <li>Schedule consultations, inspections, or roofing services</li>
            <li>Communicate with you about your project</li>
            <li>Improve our customer service and site experience</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            We will not use your information to send unsolicited marketing emails or
            add you to any mailing list without your consent.
          </p>

          {/* 3 */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">3. Information Sharing &amp; Third Parties</h2>
          <p className="text-gray-600 leading-relaxed">
            <strong>We do not sell, rent, or trade your personal information to any third party.</strong>{' '}
            We do not share your data with advertisers or data brokers.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            To operate this website and deliver our services, we use the following trusted
            third-party service providers:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
            <li>
              <strong>Resend</strong> &mdash; used to deliver transactional emails (e.g., form
              submission confirmations). Resend processes message content only as needed to
              route and deliver email. See{' '}
              <a
                href="https://resend.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline"
              >
                Resend&apos;s Privacy Policy
              </a>.
            </li>
            <li>
              <strong>Supabase</strong> &mdash; used to securely store form submissions in a
              hosted database. Data is stored in the United States. See{' '}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline"
              >
                Supabase&apos;s Privacy Policy
              </a>.
            </li>
            <li>
              <strong>Vercel</strong> &mdash; our website is hosted on Vercel&apos;s infrastructure.
              Vercel may log standard server access data (IP address, browser type, pages
              visited) for security and performance purposes. See{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline"
              >
                Vercel&apos;s Privacy Policy
              </a>.
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            These providers are contractually obligated to use your data only as directed by
            us and in accordance with applicable privacy laws.
          </p>

          {/* 4 */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">4. Cookies &amp; Analytics</h2>
          <p className="text-gray-600 leading-relaxed">
            Our website may use essential cookies required for basic functionality (e.g.,
            session management). We do not currently use third-party advertising or tracking
            cookies, nor do we run behavioral advertising campaigns.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            If we add analytics tools in the future (such as Google Analytics), we will update
            this policy to reflect that use. You can control cookie preferences through your
            browser settings at any time.
          </p>

          {/* 5 */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">5. Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            This site is served exclusively over <strong>HTTPS</strong>, encrypting all data
            in transit between your browser and our server. Form submissions are stored in a
            secured, access-controlled database hosted by Supabase. While we take reasonable
            measures to protect your information, no method of electronic transmission or
            storage is 100% secure. We encourage you to avoid sending sensitive personal or
            financial information through web forms.
          </p>

          {/* 6 */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">6. Your Rights &amp; Data Deletion</h2>
          <p className="text-gray-600 leading-relaxed">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
            <li>Request access to the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal data</li>
            <li>Withdraw consent for future communications</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            To exercise any of these rights, please email us at{' '}
            <a href="mailto:info@trustproofroofing.com" className="text-brand-600 hover:underline">
              info@trustproofroofing.com
            </a>{' '}
            with the subject line <em>&ldquo;Privacy Request.&rdquo;</em> We will respond within
            30 days and complete all reasonable requests at no charge.
          </p>

          {/* 7 */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">7. Children&apos;s Privacy</h2>
          <p className="text-gray-600 leading-relaxed">
            Our website is not directed to children under the age of 13, and we do not
            knowingly collect personal information from children. If you believe a child has
            submitted information through our site, please contact us and we will promptly
            delete it.
          </p>

          {/* 8 */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">8. Links to Other Websites</h2>
          <p className="text-gray-600 leading-relaxed">
            Our website may contain links to third-party websites (e.g., review platforms,
            supplier pages). We are not responsible for the privacy practices of those sites
            and encourage you to review their policies independently.
          </p>

          {/* 9 */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">9. Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. When we do, we will revise
            the effective date at the top of this page. Continued use of the website after
            changes are posted constitutes your acceptance of the updated policy. We encourage
            you to review this page periodically.
          </p>

          {/* 10 */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">10. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have questions, concerns, or requests regarding this Privacy Policy or our
            data practices, please contact us:
          </p>
          <address className="not-italic mt-4 text-gray-600 leading-relaxed space-y-1">
            <div className="font-semibold text-gray-900">{SITE.name}</div>
            <div>Suffield, CT 06078</div>
            <div>
              Phone:{' '}
              <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="text-brand-600 hover:underline">
                {SITE.phone}
              </a>
            </div>
            <div>
              Email:{' '}
              <a href="mailto:info@trustproofroofing.com" className="text-brand-600 hover:underline">
                info@trustproofroofing.com
              </a>
            </div>
            <div>CT HIC #{SITE.license}</div>
          </address>

          <hr className="my-10 border-gray-200" />
          <p className="text-gray-400 text-sm">
            Effective Date: {EFFECTIVE_DATE}. This policy applies to information collected on
            trustproofroofing.com only.
          </p>
        </div>
      </section>
    </main>
  );
}
