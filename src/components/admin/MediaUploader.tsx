'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, X, ImageIcon, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn, generateId } from '@/lib/utils';

interface MediaItem {
  id: string;
  filename: string;
  storage_path: string;
  file_type: string;
  created_at: string;
}

interface MediaUploaderProps {
  onUpload: (url: string, mediaId?: string) => void;
  accept?: string;
  bucket?: string;
  path?: string;
  maxSize?: number; // in MB
  className?: string;
  organizationId?: string;
  multiple?: boolean;
}

function getMediaUrl(storagePath: string): string {
  if (storagePath.startsWith('http') || storagePath.startsWith('/')) {
    return storagePath;
  }
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${storagePath}`;
}

export function MediaUploader({
  onUpload,
  accept = 'image/*,audio/*',
  bucket = 'tour-media',
  path = '',
  maxSize = 10,
  className,
  organizationId,
  multiple = false,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolutionWarning, setResolutionWarning] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const MIN_WIDTH = 1200;
  const MIN_HEIGHT = 800;

  const checkImageResolution = (file: File): Promise<{ ok: boolean; width: number; height: number }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ ok: img.width >= MIN_WIDTH && img.height >= MIN_HEIGHT, width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ ok: true, width: 0, height: 0 }); // allow upload if check fails
      };
      img.src = url;
    });
  };

  const supabase = createClient();

  // Fetch media library when opened
  useEffect(() => {
    if (!showLibrary || !organizationId) return;

    async function fetchLibrary() {
      setLibraryLoading(true);
      const isImageOnly = accept === 'image/*';
      const params = new URLSearchParams({ organizationId: organizationId! });
      if (isImageOnly) params.set('fileType', 'image');

      try {
        const res = await fetch(`/api/media?${params}`);
        if (res.ok) {
          const data = await res.json();
          setLibraryItems(data || []);
        }
      } catch {
        // Library fetch failed, user can still upload
      } finally {
        setLibraryLoading(false);
      }
    }

    fetchLibrary();
  }, [showLibrary, organizationId, accept]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Generate unique filename
      const ext = file.name.split('.').pop();
      const filename = `${generateId()}.${ext}`;
      const storagePath = path ? `${path}/${filename}` : filename;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Create media record via API (bypasses RLS)
      const fileType = file.type.startsWith('image/') ? 'image' : 'audio';
      let mediaData: { id: string } | null = null;
      try {
        const mediaRes = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            storage_path: storagePath,
            file_type: fileType,
            file_size: file.size,
            ...(organizationId ? { organization_id: organizationId } : {}),
          }),
        });
        if (mediaRes.ok) {
          mediaData = await mediaRes.json();
        }
      } catch {
        // Media record creation failed, but upload still succeeded
      }

      setProgress(100);
      onUpload(urlData.publicUrl, mediaData?.id);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setResolutionWarning(null);
      const files = multiple ? acceptedFiles : [acceptedFiles[0]];
      for (const file of files) {
        if (!file) continue;
        if (file.size > maxSize * 1024 * 1024) {
          setError(`File size must be less than ${maxSize}MB`);
          continue;
        }
        // Check resolution for images
        if (file.type.startsWith('image/')) {
          const { ok, width, height } = await checkImageResolution(file);
          if (!ok) {
            setResolutionWarning(
              `"${file.name}" is ${width}×${height}px — below the recommended ${MIN_WIDTH}×${MIN_HEIGHT}px minimum. It may appear blurry. Uploading anyway.`
            );
          }
        }
        uploadFile(file);
      }
    },
    [maxSize, multiple]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      const trimmed = type.trim();
      if (trimmed.startsWith('image/')) {
        acc['image/*'] = [];
      } else if (trimmed.startsWith('audio/')) {
        acc['audio/*'] = [];
      }
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: multiple ? 10 : 1,
    multiple,
    disabled: uploading,
  });

  const handleLibrarySelect = (item: MediaItem) => {
    const url = getMediaUrl(item.storage_path);
    onUpload(url, item.id);
    setShowLibrary(false);
  };

  // Library picker view
  if (showLibrary) {
    return (
      <div className={className}>
        <div className="border-2 border-dashed rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Media Library</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLibrary(false)}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>

          {libraryLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : libraryItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No images in library yet</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowLibrary(false)}
              >
                Upload a new one
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
              {libraryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLibrarySelect(item)}
                  className="relative aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-primary transition-colors group"
                >
                  <Image
                    src={getMediaUrl(item.storage_path)}
                    alt={item.filename}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default upload view
  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-2">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? 'Drop the files here'
                : multiple
                ? 'Drag & drop files, or click to select multiple'
                : 'Drag & drop a file, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">Max size: {maxSize}MB</p>
            {accept.includes('image') && (
              <p className="text-xs text-muted-foreground">Recommended: at least 1200×800px for best quality</p>
            )}
          </div>
        )}
      </div>

      {organizationId && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 gap-2"
          onClick={(e) => {
            e.stopPropagation();
            setShowLibrary(true);
          }}
        >
          <FolderOpen className="w-4 h-4" />
          Choose from Library
        </Button>
      )}

      {resolutionWarning && (
        <div className="mt-2 p-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded flex items-start justify-between gap-2">
          <span>⚠️ {resolutionWarning}</span>
          <button onClick={() => setResolutionWarning(null)} className="flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 text-sm text-destructive bg-destructive/10 rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
