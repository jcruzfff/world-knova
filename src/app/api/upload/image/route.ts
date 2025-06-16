import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { uploadImage } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

// Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

    // Get images for these option IDs from this user
    const images = await prisma.uploadedImage.findMany({
      where: {
        uploadedBy: userId,
        isActive: true,
        isDeleted: false,
        metadata: {
          path: ['optionId'],
          in: optionIds
        }
      },
      select: {
        id: true,
        publicUrl: true,
        metadata: true,
        createdAt: true
      }
    });

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
    const uploadResult = await uploadImage(file, user.id, 'market-option');
    
    console.log('✅ Image uploaded successfully:', {
      path: uploadResult.path,
      url: uploadResult.url
    });

    // Store image record in database
    const imageRecord = await prisma.uploadedImage.create({
      data: {
        fileName: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${file.type.split('/')[1]}`,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath: uploadResult.path,
        publicUrl: uploadResult.url,
        uploadType: 'market-option',
        uploadedBy: user.id,
        // Associate with market if provided (will be set when market is created)
        marketId: marketId || null,
        metadata: {
          compression: 'auto',
          originalSize: file.size,
          optionId: optionId || null, // Store which option this image is for
          uploadContext: 'market-creation'
        }
      }
    });

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

    // Update all images for these option IDs to associate with the market
    const updateResult = await prisma.uploadedImage.updateMany({
      where: {
        uploadedBy: userId,
        metadata: {
          path: ['optionId'],
          in: optionIds
        },
        isActive: true,
        isDeleted: false
      },
      data: {
        marketId: marketId
      }
    });

    console.log('🔗 Updated images with market ID:', {
      marketId,
      optionIds,
      updatedCount: updateResult.count
    });

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: updateResult.count,
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