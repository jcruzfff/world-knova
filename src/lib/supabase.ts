import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables at build time
function validateEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Only validate if we're in a browser environment or have actual values
  if (typeof window !== 'undefined' || (supabaseUrl && supabaseAnonKey)) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Basic URL validation
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
      throw new Error('Invalid Supabase URL format');
    }
  }
  
  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Get Supabase client instance (anon key)
 */
export function getSupabaseClient(): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = validateEnvironmentVariables();
  
  // Fallback values for build time
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || 'placeholder-key';
  
  return createClient(url, key);
}

/**
 * Get Supabase admin client (service role key) for bypassing RLS
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(`Missing Supabase admin environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseServiceKey}`);
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Storage bucket name for market images
export const STORAGE_BUCKET = 'knova-project-images';

/**
 * Generate a unique file path for uploaded images
 */
export function generateImagePath(userId: string, originalFileName: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const fileExtension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${timestamp}-${randomId}.${fileExtension}`;
  
  return `market-options/${userId}/${fileName}`;
}

/**
 * Upload an image file to Supabase Storage
 */
export async function uploadImage(
  file: File, 
  userId: string
): Promise<{ url: string; path: string }> {
  try {
    const client = getSupabaseAdminClient();
    const imagePath = generateImagePath(userId, file.name);
    
    // Upload file to storage
    const { data, error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(imagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = client.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(imagePath);

    return {
      url: publicUrlData.publicUrl,
      path: imagePath
    };

  } catch (error) {
    console.error('❌ Image upload error:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(imagePath: string): Promise<void> {
  try {
    const client = getSupabaseAdminClient();
    
    const { error } = await client.storage
      .from(STORAGE_BUCKET)
      .remove([imagePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Image delete error:', error);
    throw error;
  }
} 