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
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const supabase = createClient();

  // Fetch media library when opened
  useEffect(() => {
    if (!showLibrary || !organizationId) return;

    async function fetchLibrary() {
      setLibraryLoading(true);
      const isImageOnly = accept === 'image/*';
      let query = supabase
        .from('media')
        .select('id, filename, storage_path, file_type, created_at')
        .eq('organization_id', organizationId!)
        .order('created_at', { ascending: false });

      if (isImageOnly) {
        query = query.eq('file_type', 'image');
      }

      const { data } = await query;
      setLibraryItems(data || []);
      setLibraryLoading(false);
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

      // Create media record
      const fileType = file.type.startsWith('image/') ? 'image' : 'audio';
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          filename: file.name,
          storage_path: storagePath,
          file_type: fileType,
          file_size: file.size,
          ...(organizationId ? { organization_id: organizationId } : {}),
        })
        .select()
        .single();

      if (mediaError) {
        console.error('Failed to create media record:', mediaError);
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
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`);
        return;
      }

      uploadFile(file);
    },
    [maxSize]
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
    maxFiles: 1,
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
                ? 'Drop the file here'
                : 'Drag & drop a file, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">Max size: {maxSize}MB</p>
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
