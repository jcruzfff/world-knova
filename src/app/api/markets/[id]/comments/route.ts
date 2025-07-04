import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Comment interface for database operations
interface CommentRow {
  id: string;
  market_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Comment with user data for responses
interface CommentWithUser {
  id: string;
  marketId: string;
  userId: string;
  content: string;
  author: string;
  avatar?: string | null;
  timeAgo: string;
  createdAt: Date;
}

// GET /api/markets/[id]/comments - Fetch comments for a market
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = params.id;
    
    if (!marketId) {
      return NextResponse.json({
        success: false,
        error: 'Market ID is required'
      }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Fetch comments with user data
    const { data: comments, error } = await supabase
      .from('market_comments')
      .select(`
        id,
        market_id,
        user_id,
        content,
        created_at,
        updated_at,
        users (
          username,
          display_name,
          profile_picture_url
        )
      `)
      .eq('market_id', marketId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching comments:', error);
      // If table doesn't exist or other DB issues, return empty comments instead of failing
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.log('📝 Comments table not found, returning empty comments array');
        return NextResponse.json({
          success: true,
          data: {
            comments: [],
            count: 0
          }
        });
      }
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch comments'
      }, { status: 500 });
    }

    // Transform comments for response
    const transformedComments: CommentWithUser[] = comments?.map((comment: any) => {
      const user = comment.users;
      const createdAt = new Date(comment.created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      let timeAgo = 'now';
      if (diffMins >= 60) {
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours >= 24) {
          const diffDays = Math.floor(diffHours / 24);
          timeAgo = `${diffDays}d ago`;
        } else {
          timeAgo = `${diffHours}h ago`;
        }
      } else if (diffMins > 0) {
        timeAgo = `${diffMins}m ago`;
      }

      return {
        id: comment.id,
        marketId: comment.market_id,
        userId: comment.user_id,
        content: comment.content,
        author: user?.display_name || user?.username || 'Anonymous',
        avatar: user?.profile_picture_url,
        timeAgo,
        createdAt
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: {
        comments: transformedComments,
        count: transformedComments.length
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error fetching comments:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/markets/[id]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = params.id;
    
    if (!marketId) {
      return NextResponse.json({
        success: false,
        error: 'Market ID is required'
      }, { status: 400 });
    }

    // Get user from session (using same pattern as profile API)
    const cookieStore = cookies();
    const userSession = cookieStore.get('user-session')?.value;
    
    if (!userSession) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Parse session to get user ID
    let sessionUser;
    try {
      sessionUser = JSON.parse(userSession);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid session format'
      }, { status: 401 });
    }

    const userId = sessionUser.id;
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID not found in session'
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Comment content is required'
      }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({
        success: false,
        error: 'Comment content cannot exceed 500 characters'
      }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Verify market exists
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('id')
      .eq('id', marketId)
      .single();

    if (marketError || !market) {
      return NextResponse.json({
        success: false,
        error: 'Market not found'
      }, { status: 404 });
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('market_comments')
      .insert({
        market_id: marketId,
        user_id: userId,
        content: content.trim()
      })
      .select(`
        id,
        market_id,
        user_id,
        content,
        created_at,
        users (
          username,
          display_name,
          profile_picture_url
        )
      `)
      .single();

    if (commentError) {
      console.error('❌ Error creating comment:', commentError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create comment'
      }, { status: 500 });
    }

    // Transform comment for response
    const user = comment.users;
    const transformedComment: CommentWithUser = {
      id: comment.id,
      marketId: comment.market_id,
      userId: comment.user_id,
      content: comment.content,
      author: user?.display_name || user?.username || 'Anonymous',
      avatar: user?.profile_picture_url,
      timeAgo: 'now',
      createdAt: new Date(comment.created_at)
    };

    return NextResponse.json({
      success: true,
      data: {
        comment: transformedComment
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error creating comment:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 