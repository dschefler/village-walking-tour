'use client';

import { useState, useEffect } from 'react';
import { Loader2, Stamp, MapPin, Smartphone, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StampCard } from '@/components/tour/StampCard';
import type { Organization, Site } from '@/types';

interface Step4Props {
  org: Organization;
  tourId: string;
  onComplete: () => void;
}

export function Step4StampCard({ org, tourId, onComplete }: Step4Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoVisited, setDemoVisited] = useState<string[]>([]);

  useEffect(() => {
    async function loadSites() {
      try {
        const res = await fetch(`/api/sites?tourId=${tourId}`);
        if (res.ok) {
          const data = await res.json();
          setSites(data);
        }
      } catch {
        // OK
      } finally {
        setLoading(false);
      }
    }
    loadSites();
  }, [tourId]);

  const handleDemoStamp = () => {
    if (sites.length === 0) return;
    const unvisited = sites.filter((s) => !demoVisited.includes(s.id));
    if (unvisited.length > 0) {
      setDemoVisited((prev) => [...prev, unvisited[0].id]);
    }
  };

  const handleContinue = async () => {
    try {
      await fetch(`/api/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_step: 5 }),
      });
    } catch {
      // OK
    }
    onComplete();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Stamp Card Preview</h2>
        <p className="text-sm text-muted-foreground">
          Every tour includes a digital stamp card that makes exploring fun and rewarding.
          This is automatically generated from your sites — no setup needed.
        </p>
      </div>

      {/* How it works explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Walk to a site</p>
            <p className="text-xs text-muted-foreground">
              When visitors arrive at a tour location, the app detects they&apos;re nearby using GPS.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Stamp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Earn a stamp</p>
            <p className="text-xs text-muted-foreground">
              A stamp fills in on their card with a fun animation. Each site = one stamp.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Complete the tour</p>
            <p className="text-xs text-muted-foreground">
              When all stamps are collected, visitors see a celebration screen.
            </p>
          </div>
        </div>
      </div>

      {/* Stamp Card Preview */}
      <div>
        <p className="text-sm font-medium mb-2">
          Your stamp card with {sites.length} site{sites.length !== 1 ? 's' : ''}:
        </p>
        <div className="border rounded-lg p-4 bg-background">
          <StampCard
            sites={sites}
            visitedSiteIds={demoVisited}
            justStampedSiteId={null}
          />
        </div>
      </div>

      {/* Interactive demo */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium">Try it out</p>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Click the button below to simulate what happens when a visitor arrives at each site.
          Watch the stamps fill in one by one.
        </p>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleDemoStamp}
            disabled={demoVisited.length >= sites.length}
            className="gap-2"
          >
            <Stamp className="w-4 h-4" />
            {demoVisited.length >= sites.length
              ? 'All stamps collected!'
              : demoVisited.length === 0
                ? 'Simulate First Visit'
                : 'Simulate Next Visit'}
          </Button>
          <p className="text-sm text-muted-foreground">
            {demoVisited.length} / {sites.length} stamps
          </p>
        </div>
      </div>

      {demoVisited.length >= sites.length && sites.length > 0 && (
        <div className="border rounded-lg p-4 bg-primary/5 text-center">
          <Trophy className="w-6 h-6 mx-auto text-primary mb-1" />
          <p className="font-semibold text-primary">Tour Complete!</p>
          <p className="text-sm text-muted-foreground">
            This is the moment visitors have been working toward. They see a celebration overlay with your branding.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleContinue} size="lg">
          Continue to Preview
        </Button>
      </div>
    </div>
  );
}
