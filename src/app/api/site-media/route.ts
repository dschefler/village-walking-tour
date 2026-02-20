import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const records: { site_id: string; media_id: string; display_order: number; is_primary: boolean }[] = body.records;

  if (!records || records.length === 0) {
    return NextResponse.json({ error: 'No records provided' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('site_media')
    .insert(records)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { site_id, media_id } = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!site_id || !media_id) {
    return NextResponse.json({ error: 'site_id and media_id are required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('site_media')
    .delete()
    .eq('site_id', site_id)
    .eq('media_id', media_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
