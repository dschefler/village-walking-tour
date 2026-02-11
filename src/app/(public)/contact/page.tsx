import { Mail, Heart, MessageSquare } from 'lucide-react';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { DonationSection } from '@/components/contact/DonationSection';

export const metadata = {
  title: 'Contact & Donate | Village Walking Tours',
  description: 'Get in touch with us or support our walking tours through donations.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />

      {/* Hero */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact & Support</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Have questions, suggestions, or want to support our mission? We&apos;d love to hear from you.
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Questions?</p>
              <p className="text-sm text-muted-foreground">Send us a message below</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Feedback</p>
              <p className="text-sm text-muted-foreground">Help us improve</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Heart className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium">Support Us</p>
              <p className="text-sm text-muted-foreground">Donate to keep tours free</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <ContactForm />

          {/* Donation Section */}
          <DonationSection />
        </div>

        {/* Additional Info */}
        <section className="mt-12 text-center py-8 border-t">
          <h2 className="text-xl font-semibold mb-4">About Village Walking Tours</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Village Walking Tours is a community project dedicated to preserving and sharing
            the rich history of our village. All tours are free to use, and your donations
            help us create new content, maintain the app, and keep everything accessible
            to everyone.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
