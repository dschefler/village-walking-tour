'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Mic, Users, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TenantUsage {
  name: string;
  slug: string;
  tier: string;
  count: number;
}

interface UsageData {
  elevenLabs: { used: number; limit: number; resetDate: string | null } | null;
  tenantUsage: TenantUsage[];
  totalNarrations: number;
}

const PLAN_LIMITS: Record<string, number> = {
  starter: 20,
  pro: 100,
  enterprise: 999999,
};

export default function PlatformUsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/platform-usage');
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load');
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={load}>Retry</Button>
      </div>
    );
  }

  const el = data?.elevenLabs;
  const elPct = el && el.limit > 0 ? Math.round((el.used / el.limit) * 100) : null;
  const elRemaining = el ? el.limit - el.used : null;
  const elStatus = elPct === null ? 'unknown' : elPct >= 90 ? 'critical' : elPct >= 70 ? 'warning' : 'ok';
  const resetDate = el?.resetDate ? new Date(el.resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Usage</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your ElevenLabs account quota and per-tenant narration usage this month
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* ElevenLabs Quota */}
      <Card className={elStatus === 'critical' ? 'border-destructive' : elStatus === 'warning' ? 'border-amber-400' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mic className="w-4 h-4" />
            ElevenLabs Account Quota
          </CardTitle>
          <CardDescription>
            All tenants share this pool. Resets {resetDate ?? 'monthly'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {el ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {el.used.toLocaleString()} / {el.limit.toLocaleString()} characters used
                </span>
                <span className={`font-bold ${elStatus === 'critical' ? 'text-destructive' : elStatus === 'warning' ? 'text-amber-600' : 'text-green-700'}`}>
                  {elPct}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${elStatus === 'critical' ? 'bg-destructive' : elStatus === 'warning' ? 'bg-amber-400' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(elPct ?? 0, 100)}%` }}
                />
              </div>
              <div className="flex items-start gap-2 text-sm">
                {elStatus === 'critical' ? (
                  <><AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <span className="text-destructive font-medium">Critical — upgrade your ElevenLabs plan now to avoid failed narrations</span></>
                ) : elStatus === 'warning' ? (
                  <><AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-amber-700">Getting low — consider upgrading before the reset date</span></>
                ) : (
                  <><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{elRemaining?.toLocaleString()} characters remaining — you&apos;re good</span></>
                )}
              </div>
              <a
                href="https://elevenlabs.io/subscription"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                Manage ElevenLabs subscription <ExternalLink className="w-3 h-3" />
              </a>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Could not reach ElevenLabs API. Check that ELEVENLABS_API_KEY is set.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Per-tenant usage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4" />
            Tenant Narration Usage This Month
          </CardTitle>
          <CardDescription>
            {data?.totalNarrations ?? 0} total narrations generated across all tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.tenantUsage.length === 0 ? (
            <p className="text-sm text-muted-foreground">No narrations generated yet this month.</p>
          ) : (
            <div className="space-y-3">
              {data?.tenantUsage.map((t) => {
                const limit = PLAN_LIMITS[t.tier] ?? 20;
                const pct = limit === 999999 ? 0 : Math.round((t.count / limit) * 100);
                return (
                  <div key={t.slug} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-muted-foreground text-xs capitalize">
                        {t.count} / {limit === 999999 ? '∞' : limit} · {t.tier}
                      </span>
                    </div>
                    {limit !== 999999 && (
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-amber-400' : 'bg-primary'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade guidance */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-5 space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">When to upgrade ElevenLabs</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Starter (~30k chars):</strong> up to ~3 tenants generating full tours/month</li>
            <li><strong>Creator (~100k chars, ~$22/mo):</strong> up to ~10 tenants</li>
            <li><strong>Pro (~500k chars, ~$99/mo):</strong> up to ~50 tenants</li>
          </ul>
          <p className="pt-1">
            ElevenLabs also sends its own usage alerts — enable them in your{' '}
            <a href="https://elevenlabs.io/app/account/settings" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              ElevenLabs account settings
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
