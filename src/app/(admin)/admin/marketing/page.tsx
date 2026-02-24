import { createServiceClient } from '@/lib/supabase/server';
import { saveAllMarketingContent } from './actions';

const CONTENT_FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: 'hero_headline', label: 'Hero Headline' },
  { key: 'hero_subheadline', label: 'Hero Subheadline', multiline: true },
  { key: 'trial_days', label: 'Free Trial Duration (days, e.g. 7)' },
  { key: 'pricing_subheadline', label: 'Pricing Section Subheadline' },
  { key: 'dfy_label', label: 'Done-For-You Badge Label' },
  { key: 'dfy_headline', label: 'Done-For-You Headline' },
  { key: 'dfy_subheadline', label: 'Done-For-You Subheadline', multiline: true },
  { key: 'cta_headline', label: 'Bottom CTA Headline' },
  { key: 'cta_subheadline', label: 'Bottom CTA Subheadline', multiline: true },
];

const DEFAULTS: Record<string, string> = {
  hero_headline: 'Build a Walking Tour App for Your Community',
  hero_subheadline:
    'Create branded, GPS-guided walking tour apps with stamp cards, AI audio narration, and offline support — in minutes, not months.',
  trial_days: '7',
  pricing_subheadline: 'Start with a 7-day free trial. No credit card required.',
  dfy_label: 'Tour Builder Concierge',
  dfy_headline: 'Rather Have Us Build It For You?',
  dfy_subheadline:
    'Our team handles everything — branding, content entry, audio narration, and launch. You provide the materials; we deliver a ready-to-share tour app.',
  cta_headline: 'Ready to Build Your Walking Tour?',
  cta_subheadline:
    'Join towns, museums, parks, and historical societies who use Walking Tour Builder to share their stories with the world.',
};

export default async function MarketingDashboard() {
  const supabase = createServiceClient();

  // Fetch leads
  const { data: leads } = await supabase
    .from('marketing_leads')
    .select('id, email, source, plan, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  // Fetch content overrides
  const { data: contentRows } = await supabase
    .from('marketing_content')
    .select('key, value, updated_at');

  const content: Record<string, string> = { ...DEFAULTS };
  contentRows?.forEach((row) => {
    content[row.key] = row.value;
  });

  return (
    <div className="p-6 space-y-10 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Edit homepage copy and view trial sign-up leads.
        </p>
      </div>

      {/* Content Editor */}
      <section>
        <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Homepage Content</h2>
        <form
          action={async (formData: FormData) => {
            'use server';
            const entries: Record<string, string> = {};
            CONTENT_FIELDS.forEach(({ key }) => {
              const val = formData.get(key);
              if (typeof val === 'string') entries[key] = val;
            });
            await saveAllMarketingContent(entries);
          }}
          className="space-y-5"
        >
          {CONTENT_FIELDS.map(({ key, label, multiline }) => (
            <div key={key} className="space-y-1.5">
              <label htmlFor={key} className="text-sm font-medium">
                {label}
              </label>
              {multiline ? (
                <textarea
                  id={key}
                  name={key}
                  defaultValue={content[key]}
                  rows={3}
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                />
              ) : (
                <input
                  id={key}
                  name={key}
                  type="text"
                  defaultValue={content[key]}
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Save All Changes
          </button>
        </form>
      </section>

      {/* Leads Table */}
      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h2 className="text-lg font-semibold">
            Trial Sign-Up Leads{' '}
            <span className="text-muted-foreground font-normal text-base">
              ({leads?.length ?? 0})
            </span>
          </h2>
          <a
            href="/api/marketing/leads/export"
            className="text-sm text-primary underline hover:opacity-80"
          >
            Export CSV
          </a>
        </div>

        {!leads || leads.length === 0 ? (
          <p className="text-muted-foreground text-sm">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Plan</th>
                  <th className="text-left px-4 py-3 font-medium">Source</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{lead.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.plan ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.source}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
