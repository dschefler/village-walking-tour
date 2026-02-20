import Image from 'next/image';
import { Mail, Heart, MessageSquare, Phone, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { DonationSection } from '@/components/contact/DonationSection';
import { Card, CardContent } from '@/components/ui/card';

async function getOrg(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('organizations')
    .select('name, logo_url, contact_email, contact_phone, contact_address')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data;
}

export default async function TenantContactPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const org = await getOrg(params.orgSlug);
  const hasContactInfo = org?.contact_email || org?.contact_phone || org?.contact_address;

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader orgSlug={params.orgSlug} />

      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact & Support</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Have questions, suggestions, or want to support our mission? We&apos;d love to hear from you.
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Quick info cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {org?.contact_email ? (
            <a href={`mailto:${org.contact_email}`} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">Email Us</p>
                <p className="text-sm text-muted-foreground break-all">{org.contact_email}</p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Questions?</p>
                <p className="text-sm text-muted-foreground">Send us a message below</p>
              </div>
            </div>
          )}
          {org?.contact_phone ? (
            <a href={`tel:${org.contact_phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">Call Us</p>
                <p className="text-sm text-muted-foreground">{org.contact_phone}</p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Feedback</p>
                <p className="text-sm text-muted-foreground">Help us improve</p>
              </div>
            </div>
          )}
          {org?.contact_address ? (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">Visit Us</p>
                <p className="text-sm text-muted-foreground">{org.contact_address}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium">Support Us</p>
                <p className="text-sm text-muted-foreground">Donate to keep tours free</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <ContactForm orgSlug={params.orgSlug} />
          <div className="space-y-8">
            {/* Org info card with logo */}
            {(org?.logo_url || hasContactInfo) && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  {org?.logo_url && (
                    <div className="relative w-full h-24">
                      <Image
                        src={org.logo_url}
                        alt={org.name || 'Organization logo'}
                        fill
                        className="object-contain object-left"
                        sizes="300px"
                      />
                    </div>
                  )}
                  {org?.name && (
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                  )}
                  {org?.contact_address && (
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="whitespace-pre-line">{org.contact_address}</span>
                    </div>
                  )}
                  {org?.contact_phone && (
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <a href={`tel:${org.contact_phone.replace(/[^\d+]/g, '')}`} className="hover:text-foreground transition-colors">
                        {org.contact_phone}
                      </a>
                    </div>
                  )}
                  {org?.contact_email && (
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <a href={`mailto:${org.contact_email}`} className="hover:text-foreground transition-colors">
                        {org.contact_email}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            <DonationSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
