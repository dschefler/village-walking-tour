'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, Rocket, CheckCircle } from 'lucide-react';
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
    return (
      <div className="space-y-6 text-center py-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Your Tour is Live!</h2>
          <p className="text-muted-foreground">
            Visitors can now access your walking tour at:
          </p>
          <Link
            href={tourUrl}
            className="text-primary font-medium text-lg hover:underline mt-2 inline-block"
          >
            {tourUrl}
            <ExternalLink className="w-4 h-4 inline ml-1" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-lg mx-auto">
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
