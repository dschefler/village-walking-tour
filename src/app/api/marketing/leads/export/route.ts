import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  // Require admin auth
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const { data: leads, error } = await serviceClient
    .from('marketing_leads')
    .select('email, source, plan, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = 'Email,Source,Plan,Date\n';
  const rows = (leads ?? [])
    .map((l) =>
      [
        `"${l.email}"`,
        `"${l.source}"`,
        `"${l.plan ?? ''}"`,
        `"${new Date(l.created_at).toISOString()}"`,
      ].join(',')
    )
    .join('\n');

  return new NextResponse(header + rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="marketing-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
