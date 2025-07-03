import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'
import { supabaseService } from '@/lib/supabase-client'

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
  userInfo?: {
    username?: string
    profilePictureUrl?: string
  }
}

export async function POST(req: NextRequest) {
  console.log('🔐 Complete SIWE: Starting verification...')
  
  try {
    const { payload, nonce, userInfo } = (await req.json()) as IRequestPayload
    console.log('📝 Complete SIWE: Payload received', { 
      hasPayload: !!payload, 
      hasNonce: !!nonce,
      payloadStatus: payload?.status,
      hasUserInfo: !!userInfo,
      username: userInfo?.username,
      payloadAddress: payload?.address?.substring(0, 8) + '...'
    })
    
    const cookieStore = await cookies()
    const storedNonce = cookieStore.get('siwe')?.value
    
    console.log('🍪 Complete SIWE: Cookie debug', {
      siweValue: storedNonce?.substring(0, 8) + '...' || 'undefined',
      providedNonce: nonce?.substring(0, 8) + '...',
      hasSiweCookie: cookieStore.has('siwe'),
      allCookieNames: cookieStore.getAll().map(cookie => cookie.name)
    })
    
    if (nonce !== storedNonce) {
      console.error('❌ Complete SIWE: Invalid nonce', { provided: nonce, stored: storedNonce })
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'Invalid nonce',
      })
    }
    
    console.log('✅ Complete SIWE: Nonce validated')
    
    const validMessage = await verifySiweMessage(payload, nonce)
    
    if (!validMessage.isValid) {
      console.error('❌ Complete SIWE: SIWE message validation failed', validMessage)
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'Invalid signature',
      })
    }
    
    console.log('✅ Complete SIWE: SIWE message validated')
    
    // According to World docs, the wallet address comes from the payload directly
    const walletAddress = payload.address
    
    console.log('👤 Complete SIWE: User info', { 
      walletAddress: walletAddress?.substring(0, 8) + '...',
      username: userInfo?.username,
      hasProfilePicture: !!userInfo?.profilePictureUrl
    })
    
    if (!userInfo?.username) {
      console.error('❌ Complete SIWE: User info not available')
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'User info not available',
      })
    }
    
    if (!walletAddress) {
      console.error('❌ Complete SIWE: Wallet address not available from payload')
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'Wallet address not available',
      })
    }
    
    // Find or create user in database using Supabase
    let { data: user, error } = await supabaseService.getUserByWalletAddress(walletAddress)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('❌ Complete SIWE: Database error:', error)
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'Database error',
      })
    }
    
    if (!user) {
      console.log('👤 Complete SIWE: Creating new user...')
      const { data: newUser, error: createError } = await supabaseService.createUser({
        wallet_address: walletAddress,
        username: userInfo.username,
        profile_picture_url: userInfo.profilePictureUrl,
        name: userInfo.username,
        world_id_verified: false,
        is_profile_complete: false,
        is_eligible: false,
      })
      
      if (createError) {
        console.error('❌ Complete SIWE: User creation error:', createError)
        return NextResponse.json({
          status: 'error',
          isValid: false,
          message: 'Failed to create user',
        })
      }
      
      user = newUser!
      console.log('✅ Complete SIWE: New user created:', user.id)
    } else {
      console.log('👤 Complete SIWE: Updating existing user...')
      const { data: updatedUser, error: updateError } = await supabaseService.updateUser(user.id, {
        username: userInfo.username,
        profile_picture_url: userInfo.profilePictureUrl,
        name: userInfo.username,
      })
      
      if (updateError) {
        console.error('❌ Complete SIWE: User update error:', updateError)
        return NextResponse.json({
          status: 'error',
          isValid: false,
          message: 'Failed to update user',
        })
      }
      
      user = updatedUser!
      console.log('✅ Complete SIWE: User updated:', user.id)
    }
    
    // Clear the nonce cookie
    cookieStore.delete('siwe')
    
    // Set user session cookie
    const sessionData = {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      profilePictureUrl: user.profilePictureUrl,
      isProfileComplete: user.isProfileComplete,
      isEligible: user.isEligible,
      worldIdVerified: user.worldIdVerified,
    }
    
    cookieStore.set('user-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    console.log('✅ Complete SIWE: Session cookie set for user:', user.id)
    
    return NextResponse.json({
      status: 'success',
      isValid: true,
      user: sessionData,
    })
    
  } catch (error) {
    console.error('❌ Complete SIWE: Error in validation or processing', error)
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
} 