import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getRequesterMembership } from '@/lib/auth/membership';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Previously trusted a client-supplied ?organizationId= and ran the
  // query through the service client (bypassing RLS) — any logged-in user
  // could list another org's media by passing its id. Always derive the
  // org from the caller's own membership instead.
  const membership = await getRequesterMembership(supabase, user.id);
  if (!membership) {
    return NextResponse.json({ error: 'No organization' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const fileType = searchParams.get('fileType');

  const serviceClient = createServiceClient();
  let query = serviceClient
    .from('media')
    .select('id, filename, storage_path, file_type, created_at')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false });

  if (fileType) {
    query = query.eq('file_type', fileType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Previously took organization_id straight from the request body with
  // no verification — any logged-in user could tag an upload to any org's
  // id. Always derive it from the caller's own membership instead.
  const membership = await getRequesterMembership(supabase, user.id);
  if (!membership) {
    return NextResponse.json({ error: 'No organization' }, { status: 403 });
  }

  const body = await request.json();

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from('media')
    .insert({
      filename: body.filename,
      storage_path: body.storage_path,
      file_type: body.file_type,
      file_size: body.file_size,
      organization_id: membership.organization_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
