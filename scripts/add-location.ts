/**
 * Script to add a new location to the Southampton Village Walking Tour
 *
 * Usage: npx tsx scripts/add-location.ts
 *
 * Before running:
 * 1. Update the LOCATION_DATA below with your new location info
 * 2. Place images in the public/images folder
 * 3. Run the script
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================
// UPDATE THIS SECTION WITH YOUR NEW LOCATION DATA
// ============================================================

const LOCATION_DATA = {
  // Basic Information
  name: 'Your Location Name',
  description: `
    Enter your location description here.
    You can use multiple lines.
    This will appear in the "About this Location" section.
  `.trim(),
  address: '123 Main Street, Southampton, NY 11968',

  // Coordinates (get from Google Maps - right click on location)
  latitude: 40.88621,
  longitude: -72.39332,

  // Optional: Audio file URL (leave empty if no audio yet)
  audioUrl: '',

  // Images - place files in public/images/ folder first
  // The first image will be the hero/primary image
  images: [
    {
      filename: 'your-location-main.jpg',
      path: '/images/your-location-main.jpg',
      altText: 'Main view of Your Location',
      caption: 'Your Location - Main Image',
    },
    // Add more gallery images as needed:
    // {
    //   filename: 'your-location-interior.jpg',
    //   path: '/images/your-location-interior.jpg',
    //   altText: 'Interior of Your Location',
    //   caption: 'Interior view',
    // },
  ],
};

// ============================================================
// DO NOT MODIFY BELOW THIS LINE
// ============================================================

async function addLocation() {
  console.log(`\nAdding location: ${LOCATION_DATA.name}\n`);

  // Step 1: Get the tour ID
  const { data: tour } = await supabase
    .from('tours')
    .select('id')
    .eq('slug', 'southampton-village')
    .single();

  if (!tour) {
    console.error('Tour not found. Please ensure the Southampton Village tour exists.');
    process.exit(1);
  }

  const tourId = tour.id;
  console.log('✓ Found tour:', tourId);

  // Step 2: Generate slug from name
  const slug = LOCATION_DATA.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Step 3: Check if location already exists
  const { data: existingSite } = await supabase
    .from('sites')
    .select('id')
    .eq('slug', slug)
    .single();

  let siteId: string;

  if (existingSite) {
    console.log('! Location already exists, updating...');
    siteId = existingSite.id;

    const { error: updateError } = await supabase
      .from('sites')
      .update({
        name: LOCATION_DATA.name,
        description: LOCATION_DATA.description,
        address: LOCATION_DATA.address,
        latitude: LOCATION_DATA.latitude,
        longitude: LOCATION_DATA.longitude,
        audio_url: LOCATION_DATA.audioUrl || null,
        is_published: true,
      })
      .eq('id', siteId);

    if (updateError) {
      console.error('Error updating site:', updateError);
      process.exit(1);
    }
    console.log('✓ Updated site');
  } else {
    // Get the next display order
    const { data: sites } = await supabase
      .from('sites')
      .select('display_order')
      .eq('tour_id', tourId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (sites?.[0]?.display_order || 0) + 1;

    const { data: newSite, error: siteError } = await supabase
      .from('sites')
      .insert({
        tour_id: tourId,
        name: LOCATION_DATA.name,
        slug: slug,
        description: LOCATION_DATA.description,
        address: LOCATION_DATA.address,
        latitude: LOCATION_DATA.latitude,
        longitude: LOCATION_DATA.longitude,
        audio_url: LOCATION_DATA.audioUrl || null,
        is_published: true,
        display_order: nextOrder,
      })
      .select('id')
      .single();

    if (siteError || !newSite) {
      console.error('Error creating site:', siteError);
      process.exit(1);
    }

    siteId = newSite.id;
    console.log('✓ Created site:', siteId);
  }

  // Step 4: Add images
  for (let i = 0; i < LOCATION_DATA.images.length; i++) {
    const image = LOCATION_DATA.images[i];
    const isPrimary = i === 0;

    // Check if media already exists
    const { data: existingMedia } = await supabase
      .from('media')
      .select('id')
      .eq('filename', image.filename)
      .single();

    let mediaId: string;

    if (existingMedia) {
      console.log(`! Image already exists: ${image.filename}`);
      mediaId = existingMedia.id;
    } else {
      const { data: newMedia, error: mediaError } = await supabase
        .from('media')
        .insert({
          filename: image.filename,
          storage_path: image.path,
          file_type: 'image',
          alt_text: image.altText,
          caption: image.caption,
        })
        .select('id')
        .single();

      if (mediaError || !newMedia) {
        console.error('Error creating media:', mediaError);
        continue;
      }

      mediaId = newMedia.id;
      console.log(`✓ Added image: ${image.filename}`);
    }

    // Link media to site
    const { data: existingLink } = await supabase
      .from('site_media')
      .select('id')
      .eq('site_id', siteId)
      .eq('media_id', mediaId)
      .single();

    if (!existingLink) {
      const { error: linkError } = await supabase
        .from('site_media')
        .insert({
          site_id: siteId,
          media_id: mediaId,
          display_order: i + 1,
          is_primary: isPrimary,
        });

      if (linkError) {
        console.error('Error linking media:', linkError);
      } else {
        console.log(`✓ Linked image to site${isPrimary ? ' (primary)' : ''}`);
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`Location added successfully!`);
  console.log(`View at: http://localhost:3000/location/${slug}`);
  console.log(`========================================\n`);
}

addLocation().catch(console.error);
