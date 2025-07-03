import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { uploadImage } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabase-client';

// Configuration constants are defined inline where used

// GET /api/upload/image - Get uploaded images by option IDs
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const optionIds = url.searchParams.get('optionIds')?.split(',') || [];
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID required'
      }, { status: 400 });
    }

    // Get images for these option IDs from this user using Supabase
    const { data: images, error } = await supabaseService['client']
      .from('uploaded_images')
      .select('id, public_url, metadata, created_at')
      .eq('uploaded_by', userId)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .in('metadata->>optionId', optionIds);

    if (error) {
      console.error('❌ Get images database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve images'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: images
    });

  } catch (error) {
    console.error('❌ Get images API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve images'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session from cookies
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user-session')?.value;
    
    if (!userSession) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const user = JSON.parse(userSession);
    
    if (!user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user session'
      }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const optionId = formData.get('optionId') as string; // Optional: to associate with specific market option
    const marketId = formData.get('marketId') as string; // Optional: to associate with specific market
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File size exceeds 5MB limit'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed'
      }, { status: 400 });
    }

    console.log('📤 Uploading image:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type,
      userId: user.id,
      optionId: optionId || 'none',
      marketId: marketId || 'none'
    });

    // Upload to Supabase Storage
    const uploadResult = await uploadImage(file, user.id);
    
    console.log('✅ Image uploaded successfully:', {
      path: uploadResult.path,
      url: uploadResult.url
    });

    // Store image record in database using Supabase
    const { data: imageRecord, error } = await supabaseService['client']
      .from('uploaded_images')
      .insert([{
        file_name: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${file.type.split('/')[1]}`,
        original_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: uploadResult.path,
        public_url: uploadResult.url,
        upload_type: 'market-option',
        uploaded_by: user.id,
        // Associate with market if provided (will be set when market is created)
        market_id: marketId || null,
        metadata: {
          compression: 'auto',
          originalSize: file.size,
          optionId: optionId || null, // Store which option this image is for
          uploadContext: 'market-creation'
        },
        is_active: true,
        is_deleted: false
      }])
      .select()
      .single();

    if (error) {
      console.error('💾 Database insert error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to save image record'
      }, { status: 500 });
    }

    console.log('💾 Image record created in database:', imageRecord.id);

    return NextResponse.json({
      success: true,
      data: {
        id: imageRecord.id,
        url: uploadResult.url,
        path: uploadResult.path,
        fileName: file.name,
        fileSize: file.size,
        optionId: optionId || null
      }
    });

  } catch (error) {
    console.error('❌ Image upload API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 });
  }
}

// PATCH /api/upload/image - Update uploaded images with market ID
export async function PATCH(request: NextRequest) {
  try {
    const { marketId, optionIds, userId } = await request.json();

    if (!marketId || !Array.isArray(optionIds) || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Market ID, option IDs array, and user ID are required'
      }, { status: 400 });
    }

    // Update all images for these option IDs to associate with the market using Supabase
    let updatedCount = 0;
    for (const optionId of optionIds) {
      const { error, count } = await supabaseService['client']
        .from('uploaded_images')
        .update({ market_id: marketId })
        .eq('uploaded_by', userId)
        .eq('metadata->>optionId', optionId)
        .eq('is_active', true)
        .eq('is_deleted', false);

      if (error) {
        console.error('❌ Update images error:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to update images with market ID'
        }, { status: 500 });
      }

      updatedCount += count || 0;
    }

    console.log('🔗 Updated images with market ID:', {
      marketId,
      optionIds,
      updatedCount: updatedCount
    });

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: updatedCount,
        marketId
      }
    });

  } catch (error) {
    console.error('❌ Update images API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update images with market ID'
    }, { status: 500 });
  }
} 