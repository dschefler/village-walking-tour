'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn, generateId } from '@/lib/utils';

interface MediaUploaderProps {
  onUpload: (url: string, mediaId?: string) => void;
  accept?: string;
  bucket?: string;
  path?: string;
  maxSize?: number; // in MB
  className?: string;
  organizationId?: string;
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

  const supabase = createClient();

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
