'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Lightbulb, Save, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Site } from '@/types';

interface Step3Props {
  orgId: string;
  tourId: string;
  onComplete: () => void;
  onSkip: () => void;
  onSave?: () => void;
}

interface SiteFacts {
  siteId: string;
  siteName: string;
  facts: string[];
}

export function Step3FunFacts({ orgId, tourId, onComplete, onSkip, onSave }: Step3Props) {
  const [sitesFacts, setSitesFacts] = useState<SiteFacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSites() {
      try {
        const res = await fetch(`/api/sites?tourId=${tourId}`);
        if (res.ok) {
          const sites: Site[] = await res.json();
          // Also load existing facts
          const factsRes = await fetch(`/api/fun-facts?tourId=${tourId}`);
          const existingFacts = factsRes.ok ? await factsRes.json() : [];

          const factsBySite: Record<string, string[]> = {};
          for (const f of existingFacts) {
            if (!factsBySite[f.site_id]) factsBySite[f.site_id] = [];
            factsBySite[f.site_id].push(f.fact_text);
          }

          setSitesFacts(
            sites.map((s) => ({
              siteId: s.id,
              siteName: s.name,
              facts: factsBySite[s.id] || [''],
            }))
          );
        }
      } catch {
        // OK
      } finally {
        setLoading(false);
      }
    }
    loadSites();
  }, [tourId]);

  const addFact = (siteIndex: number) => {
    setSitesFacts((prev) =>
      prev.map((sf, i) =>
        i === siteIndex ? { ...sf, facts: [...sf.facts, ''] } : sf
      )
    );
  };

  const removeFact = (siteIndex: number, factIndex: number) => {
    setSitesFacts((prev) =>
      prev.map((sf, i) =>
        i === siteIndex
          ? { ...sf, facts: sf.facts.filter((_, fi) => fi !== factIndex) }
          : sf
      )
    );
  };

  const updateFact = (siteIndex: number, factIndex: number, value: string) => {
    setSitesFacts((prev) =>
      prev.map((sf, i) =>
        i === siteIndex
          ? {
              ...sf,
              facts: sf.facts.map((f, fi) => (fi === factIndex ? value : f)),
            }
          : sf
      )
    );
  };

  const [savingOnly, setSavingOnly] = useState(false);

  const saveData = async (advanceStep: boolean) => {
    if (advanceStep) {
      setSaving(true);
    } else {
      setSavingOnly(true);
    }
    setError('');

    try {
      // Save facts for each site
      for (const sf of sitesFacts) {
        const validFacts = sf.facts.filter((f) => f.trim());
        if (validFacts.length === 0) continue;

        // Delete existing facts for this site and re-insert
        await fetch(`/api/fun-facts?siteId=${sf.siteId}`, { method: 'DELETE' });

        for (let i = 0; i < validFacts.length; i++) {
          await fetch('/api/fun-facts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              site_id: sf.siteId,
              fact_text: validFacts[i],
              display_order: i + 1,
            }),
          });
        }
      }

      if (advanceStep) {
        // Update onboarding step
        await fetch(`/api/organizations/${orgId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ onboarding_step: 4 }),
        });
        onComplete();
      } else {
        onSave?.();
        toast({ title: 'Progress saved', description: 'Your fun facts have been saved.' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
      setSavingOnly(false);
    }
  };

  const handleSubmit = () => saveData(true);
  const handleSave = () => saveData(false);

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
        <h2 className="text-xl font-semibold mb-1">Add Fun Facts</h2>
        <p className="text-sm text-muted-foreground">
          &ldquo;Did You Know?&rdquo; pop-ups appear after visitors collect a stamp.
          Add interesting facts about each site to delight your visitors.
        </p>
      </div>

      <div className="space-y-6">
        {sitesFacts.map((sf, siteIndex) => (
          <Card key={sf.siteId}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                {sf.siteName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sf.facts.map((fact, factIndex) => (
                <div key={factIndex} className="flex items-start gap-2">
                  <Input
                    placeholder={`Fun fact #${factIndex + 1} about ${sf.siteName}...`}
                    value={fact}
                    onChange={(e) => updateFact(siteIndex, factIndex, e.target.value)}
                  />
                  {sf.facts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => removeFact(siteIndex, factIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addFact(siteIndex)}
                className="gap-1 text-muted-foreground"
              >
                <Plus className="w-3 h-3" />
                Add fact
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onSkip} className="gap-2 text-muted-foreground">
          <SkipForward className="w-4 h-4" />
          Skip for now
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSave} disabled={saving || savingOnly} size="lg">
            {savingOnly ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button onClick={handleSubmit} disabled={saving || savingOnly} size="lg">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue to Stamp Card'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
