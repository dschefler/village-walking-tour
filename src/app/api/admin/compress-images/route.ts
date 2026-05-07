import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp';

// GET: list all uncompressed images for an org
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = new URL(request.url).searchParams.get('orgId');

  let query = supabase
    .from('media')
    .select('id, filename, storage_path, file_size, file_type')
    .eq('file_type', 'image')
    .order('created_at', { ascending: false });

  if (orgId) query = query.eq('organization_id', orgId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST: compress and re-upload a single image
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { mediaId, storagePath } = await request.json();
  if (!mediaId || !storagePath) return NextResponse.json({ error: 'mediaId and storagePath required' }, { status: 400 });

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

  const { error: updateError } = await supabase.from('media').update(updates).eq('id', mediaId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    originalSize,
    compressedSize: compressed.length,
    savedBytes: originalSize - compressed.length,
    savedPct: Math.round((1 - compressed.length / originalSize) * 100),
  });
}
