import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRequesterMembership } from '@/lib/auth/membership';
import sharp from 'sharp';

// GET: list all uncompressed images for the caller's own org
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Previously trusted a client-supplied ?orgId= — always derive from
  // the caller's own membership instead.
  const membership = await getRequesterMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 });

  const { data, error } = await supabase
    .from('media')
    .select('id, filename, storage_path, file_size, file_type')
    .eq('file_type', 'image')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST: compress and re-upload a single image
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const membership = await getRequesterMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 });

  const { mediaId, storagePath: requestedStoragePath } = await request.json();
  if (!mediaId || !requestedStoragePath) {
    return NextResponse.json({ error: 'mediaId and storagePath required' }, { status: 400 });
  }

  // Previously downloaded/overwrote/deleted whatever storagePath the
  // client sent, keyed only on mediaId, with no check that either
  // belonged to the caller's org — a logged-in user of any org could
  // corrupt or delete another org's actual image file in shared storage,
  // regardless of what the final DB update below would have allowed.
  // Look the media row up ourselves and use its own storage_path, rather
  // than trusting the client's copy of it.
  const { data: mediaRow, error: mediaError } = await supabase
    .from('media')
    .select('id, storage_path, organization_id')
    .eq('id', mediaId)
    .single();

  if (mediaError || !mediaRow) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
  }
  if (mediaRow.organization_id !== membership.organization_id) {
    return NextResponse.json({ error: 'Not authorized for this file' }, { status: 403 });
  }

  const storagePath = mediaRow.storage_path;

  // Download original from Supabase storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('tour-media')
    .download(storagePath);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: `Download failed: ${downloadError?.message}` }, { status: 500 });
  }

  const originalBuffer = Buffer.from(await fileData.arrayBuffer());
  const originalSize = originalBuffer.length;

  // Skip if already small (under 300 KB)
  if (originalSize < 300 * 1024) {
    return NextResponse.json({ skipped: true, reason: 'already small', originalSize });
  }

  // Compress with sharp — max 1920px, 82% JPEG
  let compressed: Buffer;
  try {
    compressed = await sharp(originalBuffer)
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: 'Compression failed — may not be a supported image format' }, { status: 422 });
  }

  // Only replace if we actually saved space
  if (compressed.length >= originalSize) {
    return NextResponse.json({ skipped: true, reason: 'compression did not reduce size', originalSize });
  }

  // Replace file in Supabase storage
  const newPath = storagePath.replace(/\.[^.]+$/, '.jpg');
  const { error: uploadError } = await supabase.storage
    .from('tour-media')
    .upload(newPath, compressed, { contentType: 'image/jpeg', upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // Update media record with new path and size if path changed
  const updates: Record<string, unknown> = { file_size: compressed.length };
  if (newPath !== storagePath) {
    updates.storage_path = newPath;
    updates.filename = (storagePath.split('/').pop() ?? '').replace(/\.[^.]+$/, '.jpg');
    // Delete old file
    await supabase.storage.from('tour-media').remove([storagePath]);
  }

  const { error: updateError } = await supabase
    .from('media')
    .update(updates)
    .eq('id', mediaId)
    .eq('organization_id', membership.organization_id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    originalSize,
    compressedSize: compressed.length,
    savedBytes: originalSize - compressed.length,
    savedPct: Math.round((1 - compressed.length / originalSize) * 100),
  });
}
