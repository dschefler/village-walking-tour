import { Mail, MessageSquare } from 'lucide-react';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata = {
  title: 'Contact | Village Walking Tours',
  description: 'Get in touch with us with questions, feedback, or suggestions.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <Breadcrumb items={[{ label: 'Contact' }]} />

      {/* Hero */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Have questions, suggestions, or feedback? We&apos;d love to hear from you.
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 mb-8 max-w-lg">
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
        </div>

        <div className="max-w-lg">
          <ContactForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
