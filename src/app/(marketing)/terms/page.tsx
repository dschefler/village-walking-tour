import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — Walking Tour Builder',
  description: 'Terms of Service for Walking Tour Builder.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <Link href="/" className="font-bold text-lg">Walking Tour Builder</Link>
          <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective date: March 1, 2025 &nbsp;·&nbsp; Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">By accessing or using the Walking Tour Builder platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you are entering into these Terms on behalf of an organization, you represent that you have authority to bind that organization. If you do not agree to these Terms, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">Walking Tour Builder provides software-as-a-service (SaaS) tools that allow organizations to create, publish, and manage GPS-guided walking tour web applications ("Tours"). The Service includes tour-building tools, audio narration generation, visitor-facing tour apps, analytics, and optional Done-For-You setup services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Single-Tenant Use / No Subscription Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Each subscription is granted to a <strong>single organization</strong> for that organization's own use only. The following are expressly prohibited:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Using a single subscription to create, host, or manage Tours on behalf of multiple unrelated organizations, businesses, or entities;</li>
              <li>Reselling, sublicensing, or sharing subscription access with any third party;</li>
              <li>Operating the Service as a bureau, managed service, or white-label agency offering without a separate written agreement with Walking Tour Builder;</li>
              <li>Using one account to service multiple paying clients without a separate subscription for each client's organization.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">Violations of this section may result in immediate account termination without refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Intellectual Property Rights</h2>

            <h3 className="font-semibold mb-2 mt-4">4.1 Walking Tour Builder's Intellectual Property</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">The Service, including all software, source code, algorithms, user interfaces, design elements, features, documentation, and underlying technology, is the exclusive intellectual property of Walking Tour Builder and is protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            <p className="text-muted-foreground leading-relaxed">You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service solely as permitted by these Terms. No other rights are granted. Nothing in these Terms transfers any ownership interest in the Service to you.</p>

            <h3 className="font-semibold mb-2 mt-4">4.2 Prohibited Acts</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">You agree not to, and not to permit any third party to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Copy, reproduce, distribute, republish, download, display, post, or transmit any portion of the Service in any form or by any means;</li>
              <li>Modify, translate, adapt, or create derivative works based on the Service;</li>
              <li>Reverse engineer, disassemble, decompile, or otherwise attempt to derive the source code or underlying structure of the Service;</li>
              <li>Scrape, crawl, or use automated tools to extract data from the Service;</li>
              <li>Remove or alter any proprietary notices, labels, or marks on the Service;</li>
              <li>Frame, mirror, or otherwise simulate the appearance or functionality of the Service;</li>
              <li>Build a competing product or service using or based on the Service or its confidential information.</li>
            </ul>

            <h3 className="font-semibold mb-2 mt-4">4.3 Your Content</h3>
            <p className="text-muted-foreground leading-relaxed">You retain all rights to the text, images, audio, and other materials you upload to the Service ("Your Content"). By uploading Your Content, you grant Walking Tour Builder a worldwide, non-exclusive, royalty-free license to host, store, display, and process Your Content solely for the purpose of providing the Service. You represent and warrant that you own or have all necessary rights to Your Content and that it does not infringe any third-party rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Subscriptions and Billing</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Subscriptions are billed monthly or annually in advance. By providing payment information, you authorize Walking Tour Builder to charge the applicable fees on a recurring basis until cancelled.</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li><strong>Monthly subscriptions:</strong> Cancel anytime. Cancellation takes effect at the end of the current billing period. No partial-month refunds.</li>
              <li><strong>Annual subscriptions:</strong> A pro-rated refund of unused months is available within 30 days of the annual renewal date. No refunds after 30 days.</li>
              <li><strong>Free trial:</strong> No charge until the trial period ends. Cancel before the trial ends to avoid any charges.</li>
              <li><strong>Plan changes:</strong> Upgrades take effect immediately; downgrades take effect at the next billing cycle.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Done-For-You Setup Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Done-For-You build packages are one-time professional services subject to the following terms:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li><strong>Full refund</strong> if the project is cancelled before work has commenced.</li>
              <li><strong>50% refund</strong> if cancelled within 3 business days of the project kickoff date.</li>
              <li><strong>No refund</strong> once more than 3 business days have elapsed since project kickoff, regardless of completion status.</li>
              <li>The client is responsible for providing all required content, images, branding materials, and approvals in a timely manner. Delivery timelines are estimates and commence upon receipt of all required materials.</li>
              <li>Build packages are delivered for a single organization's use only and may not be transferred or resold.</li>
              <li>Walking Tour Builder reserves the right to decline or discontinue a project if the client fails to provide required materials within 30 days of project kickoff, in which case a 50% refund will be issued.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Upload or distribute malicious code, malware, or harmful content;</li>
              <li>Violate any applicable law, regulation, or third-party rights;</li>
              <li>Transmit unsolicited commercial communications;</li>
              <li>Impersonate any person or entity or misrepresent your affiliation;</li>
              <li>Interfere with or disrupt the integrity or performance of the Service or its infrastructure;</li>
              <li>Attempt to gain unauthorized access to any portion of the Service or its related systems.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">Either party may terminate these Terms at any time. Walking Tour Builder may suspend or terminate your account immediately and without notice for material breach of these Terms, including unauthorized use of subscriptions, IP violations, or non-payment. Upon termination, your license to use the Service ceases immediately. Your Content will be retained for 30 days following termination, after which it will be permanently deleted.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed uppercase text-xs tracking-wide">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WALKING TOUR BUILDER DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed uppercase text-xs tracking-wide">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WALKING TOUR BUILDER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF WALKING TOUR BUILDER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL WALKING TOUR BUILDER'S TOTAL LIABILITY EXCEED THE AMOUNTS PAID BY YOU IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">You agree to indemnify, defend, and hold harmless Walking Tour Builder and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or related to your use of the Service, Your Content, your violation of these Terms, or your violation of any rights of a third party.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">These Terms are governed by the laws of the State of New York, without regard to its conflict of law provisions. Any dispute arising under these Terms shall be resolved exclusively in the state or federal courts located in Suffolk County, New York. You consent to personal jurisdiction in such courts.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">Walking Tour Builder reserves the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice on the Service at least 14 days before taking effect. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these Terms may be directed to:{' '}
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
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="mailto:hello@walkingtourbuilder.com" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
