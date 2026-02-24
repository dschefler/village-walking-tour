import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Walking Tour Builder',
  description: 'Privacy Policy for Walking Tour Builder.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <Link href="/" className="font-bold text-lg">Walking Tour Builder</Link>
          <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective date: March 1, 2025 &nbsp;·&nbsp; Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">Walking Tour Builder ("we," "us," or "our") operates the Walking Tour Builder platform and associated services (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and protect information when you use our Service. By using the Service, you agree to the collection and use of information as described in this policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>

            <h3 className="font-semibold mb-2 mt-4">2.1 Account and Subscription Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">When you register for an account or subscribe to the Service, we collect:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Name and contact information (email address, organization name);</li>
              <li>Billing information (processed and stored by our payment processor; we do not store full card numbers);</li>
              <li>Account credentials.</li>
            </ul>

            <h3 className="font-semibold mb-2 mt-4">2.2 Content You Provide</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">To build and publish walking tours, you may upload or provide:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Text descriptions, tour scripts, and narrative content;</li>
              <li>Images and media files;</li>
              <li>Location data (addresses, GPS coordinates of tour stops);</li>
              <li>Branding assets (logos, color schemes).</li>
            </ul>

            <h3 className="font-semibold mb-2 mt-4">2.3 Visitor Data (End-Users of Published Tours)</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">When members of the public use a walking tour you have published through the Service:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li><strong>Geolocation:</strong> Tour apps may request the visitor's device location to enable GPS-guided navigation. Location data is processed on-device and is not transmitted to or stored on our servers in a personally identifiable form.</li>
              <li><strong>Analytics:</strong> We may collect anonymized usage data such as pages viewed, tour starts and completions, and approximate geographic region. This data is aggregated and does not identify individual visitors.</li>
              <li><strong>No accounts required:</strong> Visitors using published tour apps are not required to create accounts, and we do not collect personal information from visitors unless they voluntarily submit it (e.g., a contact form you configure).</li>
            </ul>

            <h3 className="font-semibold mb-2 mt-4">2.4 Usage and Technical Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">We automatically collect certain technical information when you access the Service, including:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>IP address, browser type, and operating system;</li>
              <li>Pages visited, features used, and actions taken within the platform;</li>
              <li>Timestamps and session duration;</li>
              <li>Error logs and performance data used to maintain and improve the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Provide, operate, and maintain the Service;</li>
              <li>Process payments and manage subscriptions;</li>
              <li>Deliver Done-For-You build services when purchased;</li>
              <li>Send transactional communications (receipts, account notices, service updates);</li>
              <li>Respond to support requests and inquiries;</li>
              <li>Monitor and analyze usage to improve features and performance;</li>
              <li>Detect, prevent, and address fraud, abuse, or security incidents;</li>
              <li>Comply with applicable legal obligations.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">We do not sell your personal information or use it to serve third-party advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Geolocation and On-Device Processing</h2>
            <p className="text-muted-foreground leading-relaxed">The walking tour apps published through the Service use your device's GPS to display your location on the tour map and trigger proximity-based features. This geolocation data is processed entirely on your device. We do not transmit, record, or store your precise real-time location on our servers. You can revoke location permission through your device or browser settings at any time; core navigation features will not function without location access.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">We do not sell or rent your personal information. We may share information in the following limited circumstances:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li><strong>Service providers:</strong> We use trusted third-party vendors (e.g., cloud hosting, payment processing, email delivery, analytics) who process data on our behalf under confidentiality obligations.</li>
              <li><strong>Legal requirements:</strong> We may disclose information if required by law, court order, or government authority, or to protect the rights, property, or safety of Walking Tour Builder, our users, or the public.</li>
              <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of all or substantially all assets, your information may be transferred as part of that transaction. We will notify you via email or prominent notice before your data is transferred and becomes subject to a different privacy policy.</li>
              <li><strong>With your consent:</strong> We may share information in any other circumstance with your explicit prior consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">We retain your account information and uploaded content for as long as your subscription is active. Following account termination, your content and data are retained for 30 days to allow for reactivation or export, after which they are permanently deleted. Anonymized analytics data may be retained indefinitely in aggregated form. Billing records are retained as required by applicable tax and financial regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Security</h2>
            <p className="text-muted-foreground leading-relaxed">We implement industry-standard technical and organizational security measures to protect your information, including encrypted data transmission (TLS), access controls, and secure cloud infrastructure. However, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security, and you use the Service at your own risk.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">We use cookies and similar tracking technologies to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Maintain your authenticated session;</li>
              <li>Remember preferences;</li>
              <li>Collect anonymized analytics on Service usage.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">You can control cookies through your browser settings. Disabling cookies may affect your ability to log in and use certain features of the Service. We do not use cookies to serve third-party advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Access the personal information we hold about you;</li>
              <li>Request correction of inaccurate data;</li>
              <li>Request deletion of your personal information (subject to legal retention obligations);</li>
              <li>Object to or restrict certain processing;</li>
              <li>Data portability (receive your data in a machine-readable format).</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">To exercise these rights, contact us at <a href="mailto:hello@walkingtourbuilder.com" className="underline hover:text-foreground">hello@walkingtourbuilder.com</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">The Service is not directed at children under the age of 13, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13 without parental consent, we will delete it promptly. If you believe we have inadvertently collected such information, please contact us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">The Service integrates with third-party services such as mapping providers and AI voice generation APIs. These integrations may be subject to their own privacy policies. We are not responsible for the privacy practices of third-party services. We encourage you to review those policies when using features that rely on them.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">We may update this Privacy Policy from time to time. Material changes will be communicated via email or prominent notice on the Service at least 14 days before taking effect. Continued use of the Service after the effective date of changes constitutes acceptance of the revised policy. We encourage you to review this page periodically.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">This Privacy Policy is governed by the laws of the State of New York, consistent with our Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions or requests regarding this Privacy Policy may be directed to:{' '}
              <a href="mailto:hello@walkingtourbuilder.com" className="underline hover:text-foreground">hello@walkingtourbuilder.com</a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Walking Tour Builder. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="mailto:hello@walkingtourbuilder.com" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
