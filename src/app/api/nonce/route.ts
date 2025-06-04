import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();
  const nonce = crypto.randomUUID().replace(/-/g, '');
  
  console.log('🔑 Nonce API: Generated nonce at', timestamp, ':', nonce.substring(0, 8) + '...');
  console.log('🔧 Nonce API: Request details:', {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...',
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer')
  });
  
  // Store nonce in cookie for later verification
  const cookieStore = await cookies()
  
  // Set cookies with different configurations to handle ngrok
  const cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'none' | 'lax' | 'strict';
    maxAge: number;
    path: string;
  } = {
    httpOnly: true,
    secure: false, // Set to false for development with ngrok
    sameSite: 'none', // Allow cross-site cookies for ngrok
    maxAge: 60 * 10, // 10 minutes
    path: '/', // Ensure cookie is available site-wide
  }
  
  // For production, use secure cookies
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true
    cookieOptions.sameSite = 'lax'
  }
  
  cookieStore.set('siwe', nonce, cookieOptions)
  
  console.log('✅ Nonce API: Cookie set with value:', nonce.substring(0, 8) + '...', 'options:', cookieOptions)
  
  // Also include nonce in response headers for debugging
  const response = NextResponse.json({ nonce })
  response.headers.set('X-Nonce-Debug', nonce.substring(0, 8) + '...')
  
  return response
} 