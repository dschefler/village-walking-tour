import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');
  const fileType = searchParams.get('fileType');

  const serviceClient = createServiceClient();
  let query = serviceClient
    .from('media')
    .select('id, filename, storage_path, file_type, created_at')
    .order('created_at', { ascending: false });

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

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

  const body = await request.json();

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from('media')
    .insert({
      filename: body.filename,
      storage_path: body.storage_path,
      file_type: body.file_type,
      file_size: body.file_size,
      ...(body.organization_id ? { organization_id: body.organization_id } : {}),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
