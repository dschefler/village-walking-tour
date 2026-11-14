/**
 * Tenants that narrate on their own ElevenLabs account. Their key lives in a
 * Vercel env var named after the slug (state-street → ELEVENLABS_API_KEY_STATE_STREET);
 * everyone else uses the platform key.
 */
export function elevenLabsKeyFor(orgSlug: string | null | undefined): string | undefined {
  const envName = orgSlug ? `ELEVENLABS_API_KEY_${orgSlug.toUpperCase().replace(/[^A-Z0-9]/g, '_')}` : null;
  return (envName && process.env[envName]) || process.env.ELEVENLABS_API_KEY;
}

/**
 * Voices that only exist on a tenant's own ElevenLabs account (e.g. a
 * professional voice clone). Every narration for that tenant uses it, and the
 * voice picker is hidden.
 */
const ORG_LOCKED_VOICES: Record<string, string> = {
  southampton: '2RSrGXhRlTEUFC0nwaNn', // Chuck Newsworthy
  // 'state-street': '<voice id from the client's ElevenLabs account>',
};

export function lockedVoiceFor(orgSlug: string | null | undefined): string | undefined {
  return orgSlug ? ORG_LOCKED_VOICES[orgSlug] : undefined;
}
