'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Loader2, Lightbulb, Save, SkipForward, Volume2, Check, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Site, FunFact } from '@/types';

interface Step3Props {
  orgId: string;
  tourId: string;
  onComplete: () => void;
  onSkip: () => void;
  onSave?: () => void;
}

interface FactEntry {
  text: string;
  audioUrl: string | null;
}

interface SiteFacts {
  siteId: string;
  siteName: string;
  facts: FactEntry[];
}

export function Step3FunFacts({ orgId, tourId, onComplete, onSkip, onSave }: Step3Props) {
  const [sitesFacts, setSitesFacts] = useState<SiteFacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOnly, setSavingOnly] = useState(false);
  const [error, setError] = useState('');
  const [defaultVoiceId, setDefaultVoiceId] = useState<string | null>(null);

  // Per-fact audio generation state: keyed as `${siteIndex}-${factIndex}`
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load sites, existing facts, and org default voice
  useEffect(() => {
    async function loadData() {
      try {
        const [sitesRes, factsRes, orgRes] = await Promise.all([
          fetch(`/api/sites?tourId=${tourId}`),
          fetch(`/api/fun-facts?tourId=${tourId}`),
          fetch(`/api/organizations/${orgId}`),
        ]);

        const sites: Site[] = sitesRes.ok ? await sitesRes.json() : [];
        const existingFacts: FunFact[] = factsRes.ok ? await factsRes.json() : [];
        const org = orgRes.ok ? await orgRes.json() : null;

        if (org?.default_tts_voice) setDefaultVoiceId(org.default_tts_voice);

        const factsBySite: Record<string, FactEntry[]> = {};
        for (const f of existingFacts) {
          if (!factsBySite[f.site_id]) factsBySite[f.site_id] = [];
          factsBySite[f.site_id].push({ text: f.fact_text, audioUrl: f.audio_url || null });
        }

        setSitesFacts(
          sites.map((s) => ({
            siteId: s.id,
            siteName: s.name,
            facts: factsBySite[s.id]?.length ? factsBySite[s.id] : [{ text: '', audioUrl: null }],
          }))
        );
      } catch {
        // OK
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tourId, orgId]);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPlayingKey(null);
  };

  const addFact = (siteIndex: number) => {
    setSitesFacts((prev) =>
      prev.map((sf, i) =>
        i === siteIndex ? { ...sf, facts: [...sf.facts, { text: '', audioUrl: null }] } : sf
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

  const updateFactText = (siteIndex: number, factIndex: number, value: string) => {
    setSitesFacts((prev) =>
      prev.map((sf, i) =>
        i === siteIndex
          ? {
              ...sf,
              facts: sf.facts.map((f, fi) =>
                fi === factIndex ? { text: value, audioUrl: null } : f
              ),
            }
          : sf
      )
    );
  };

  const setFactAudio = (siteIndex: number, factIndex: number, audioUrl: string) => {
    setSitesFacts((prev) =>
      prev.map((sf, i) =>
        i === siteIndex
          ? {
              ...sf,
              facts: sf.facts.map((f, fi) =>
                fi === factIndex ? { ...f, audioUrl } : f
              ),
            }
          : sf
      )
    );
  };

  const handleGenerateAudio = async (siteIndex: number, factIndex: number, text: string) => {
    if (!defaultVoiceId || !text.trim()) return;
    const key = `${siteIndex}-${factIndex}`;
    stopPreview();
    setGeneratingKey(key);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), voice_id: defaultVoiceId, org_id: orgId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setFactAudio(siteIndex, factIndex, data.audio_url);
      // Auto-preview the generated audio
      const audio = new Audio(data.audio_url);
      audioRef.current = audio;
      setPlayingKey(key);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingKey(null);
      audio.onerror = () => setPlayingKey(null);
    } catch (err) {
      toast({
        title: 'Audio generation failed',
        description: err instanceof Error ? err.message : 'Try again.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingKey(null);
    }
  };

  const handleTogglePreview = (key: string, audioUrl: string) => {
    if (playingKey === key) {
      stopPreview();
      return;
    }
    stopPreview();
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingKey(key);
    audio.play().catch(() => {});
    audio.onended = () => setPlayingKey(null);
    audio.onerror = () => setPlayingKey(null);
  };

  const saveData = async (advanceStep: boolean) => {
    if (advanceStep) setSaving(true);
    else setSavingOnly(true);
    setError('');

    try {
      for (const sf of sitesFacts) {
        const validFacts = sf.facts.filter((f) => f.text.trim());
        if (validFacts.length === 0) continue;

        await fetch(`/api/fun-facts?siteId=${sf.siteId}`, { method: 'DELETE' });

        for (let i = 0; i < validFacts.length; i++) {
          await fetch('/api/fun-facts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              site_id: sf.siteId,
              fact_text: validFacts[i].text,
              audio_url: validFacts[i].audioUrl || null,
              display_order: i + 1,
            }),
          });
        }
      }

      if (advanceStep) {
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
          Add interesting facts and optionally generate audio using your default narration voice.
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
              {sf.facts.map((fact, factIndex) => {
                const key = `${siteIndex}-${factIndex}`;
                const isGenerating = generatingKey === key;
                const isPlaying = playingKey === key;
                return (
                  <div key={factIndex} className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Input
                        placeholder={`Fun fact #${factIndex + 1} about ${sf.siteName}…`}
                        value={fact.text}
                        onChange={(e) => updateFactText(siteIndex, factIndex, e.target.value)}
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

                    {/* Audio row */}
                    <div className="flex items-center gap-2 pl-0.5">
                      {fact.audioUrl ? (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 text-xs text-green-700 hover:text-green-800 px-2"
                            onClick={() => handleTogglePreview(key, fact.audioUrl!)}
                          >
                            {isPlaying ? (
                              <><Square className="w-3 h-3 fill-current" /> Stop</>
                            ) : (
                              <><Play className="w-3 h-3 fill-current" /> Play audio</>
                            )}
                          </Button>
                          <Check className="w-3 h-3 text-green-600" />
                          {defaultVoiceId && fact.text.trim() && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1.5 text-xs text-muted-foreground px-2"
                              disabled={isGenerating}
                              onClick={() => handleGenerateAudio(siteIndex, factIndex, fact.text)}
                            >
                              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                              Regenerate
                            </Button>
                          )}
                        </>
                      ) : defaultVoiceId ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 text-xs text-muted-foreground px-2"
                          disabled={isGenerating || !fact.text.trim()}
                          onClick={() => handleGenerateAudio(siteIndex, factIndex, fact.text)}
                        >
                          {isGenerating ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                          ) : (
                            <><Volume2 className="w-3 h-3" /> Generate audio</>
                          )}
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Set a default voice in the narration step to add audio.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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
          <Button variant="outline" onClick={() => saveData(false)} disabled={saving || savingOnly} size="lg">
            {savingOnly ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save</>
            )}
          </Button>
          <Button onClick={() => saveData(true)} disabled={saving || savingOnly} size="lg">
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              'Continue to Stamp Card'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
