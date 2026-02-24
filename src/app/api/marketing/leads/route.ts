import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = 'trial_cta', plan } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('marketing_leads')
      .insert({ email: email.toLowerCase().trim(), source, plan: plan ?? null });

    if (error) {
      // Duplicate email is fine — don't fail the user
      if (error.code !== '23505') {
        console.error('marketing_leads insert error:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('leads route error:', err);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function GET() {
  // Only service role can list leads — protect with admin auth via the page layer
  return NextResponse.json({ error: 'Use the admin dashboard' }, { status: 403 });
}
