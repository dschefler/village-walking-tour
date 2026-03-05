'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, Rocket, CheckCircle, Navigation, Star, Lightbulb, MessageSquare, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Organization } from '@/types';

interface Step5Props {
  org: Organization;
  tourId: string;
  onPublish: () => void;
}

export function Step5Preview({ org, tourId, onPublish }: Step5Props) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');

  const tourUrl = `/t/${org.slug}`;

  const handlePublish = async () => {
    setPublishing(true);
    setError('');

    try {
      // Publish the tour
      await fetch(`/api/tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: true }),
      });

      // Mark onboarding as complete
      await fetch(`/api/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_completed: true,
          onboarding_step: 5,
        }),
      });

      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  if (published) {
    const features = [
      {
        icon: <Navigation className="w-4 h-4" />,
        title: 'In-App Navigation',
        desc: 'Start Walking button guides walkers to each stop with live distance and walk time. GPS auto-stamps arrival within 50m.',
      },
      {
        icon: <Lightbulb className="w-4 h-4" />,
        title: 'Did You Know? Facts',
        desc: 'Fun facts pop up after each stamp — with optional audio narration. Add them anytime in the dashboard.',
      },
      {
        icon: <Trophy className="w-4 h-4" />,
        title: 'Stamp Card & Completion',
        desc: 'Walkers collect stamps at each stop. A celebration overlay and thank-you screen appear when the tour is complete.',
      },
      {
        icon: <MessageSquare className="w-4 h-4" />,
        title: 'Feedback & Star Ratings',
        desc: `Walkers can rate and leave suggestions anytime. Submissions are emailed to ${org.contact_email || 'your contact email (set in Settings → Contact)'}`,
      },
      {
        icon: <Star className="w-4 h-4" />,
        title: 'Fully Branded',
        desc: 'Your colors, logo, and org name appear throughout. Update anytime in Dashboard → Settings.',
      },
    ];

    return (
      <div className="space-y-6 py-4">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-1">Your Tour is Live!</h2>
          <p className="text-muted-foreground text-sm">Share this link with your visitors:</p>
          <Link
            href={tourUrl}
            className="text-primary font-medium text-lg hover:underline mt-1 inline-block"
          >
            {tourUrl}
            <ExternalLink className="w-4 h-4 inline ml-1" />
          </Link>
        </div>

        {/* What's included */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What your walkers get</CardTitle>
            <CardDescription>Every tour includes these features out of the box</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next steps */}
        {!org.contact_email && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="py-4 flex gap-3 items-start">
              <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Set your contact email</p>
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  Walker feedback won&apos;t be delivered until you add a contact email.{' '}
                  <Link href="/dashboard/settings" className="underline font-medium">Go to Settings →</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <Button asChild size="lg">
            <Link href={tourUrl}>View Your Tour</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Preview & Publish</h2>
        <p className="text-sm text-muted-foreground">
          Everything looks good! Preview your tour, then publish it for the world to see.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full"
                style={{ backgroundColor: org.primary_color }}
              />
              <div>
                <p className="font-medium">{org.name}</p>
                <p className="text-sm text-muted-foreground">/{org.slug}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tour URL</CardTitle>
            <CardDescription>Share this link with visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="text-sm bg-muted px-2 py-1 rounded">{tourUrl}</code>
          </CardContent>
        </Card>
      </div>

      {/* Preview Link */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium mb-1">Preview your tour</p>
              <p className="text-sm text-muted-foreground">
                Open in a new tab to see exactly what visitors will experience.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={tourUrl} target="_blank" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Open Preview
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Publish */}
      <div className="flex justify-end">
        <Button onClick={handlePublish} disabled={publishing} size="lg" className="gap-2">
          {publishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Publish Tour
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
