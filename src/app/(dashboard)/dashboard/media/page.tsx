import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';

export default async function DashboardMediaPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) redirect('/dashboard/onboarding');

  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <p className="text-muted-foreground">Manage images and audio files for your tours</p>
      </div>

      {!media || media.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Media Yet</h3>
            <p className="text-muted-foreground">
              Upload images and audio files when editing your tour sites.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          {media.map((item) => {
            const url = item.storage_path.startsWith('http')
              ? item.storage_path
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tour-media/${item.storage_path}`;

            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square relative bg-muted flex items-center justify-center">
                  {item.file_type === 'image' ? (
                    <img src={url} alt={item.alt_text || item.filename} className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-2xl">🎵</span>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{item.filename}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
