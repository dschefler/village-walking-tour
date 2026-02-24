'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';

export async function saveMarketingContent(key: string, value: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('marketing_content')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) throw new Error(error.message);
  revalidatePath('/product');
  revalidatePath('/');
}

export async function saveAllMarketingContent(entries: Record<string, string>) {
  const supabase = createServiceClient();
  const rows = Object.entries(entries).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('marketing_content')
    .upsert(rows, { onConflict: 'key' });

  if (error) throw new Error(error.message);
  revalidatePath('/product');
  revalidatePath('/');
}
