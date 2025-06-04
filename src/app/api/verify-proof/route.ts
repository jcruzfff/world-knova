import {
  ISuccessResult,
  IVerifyResponse,
  verifyCloudProof,
  VerificationLevel,
} from '@worldcoin/minikit-js';
import { NextRequest, NextResponse } from 'next/server';

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal?: string;
  verification_level?: VerificationLevel;
}

/**
 * This route verifies World ID proofs for Knova
 * It is critical that all proofs are verified server-side for security
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */
export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal, verification_level } = (await req.json()) as IRequestPayload;
    
    // Validate required parameters
    if (!payload) {
      return NextResponse.json({ 
        error: 'Missing payload',
        verifyRes: { success: false },
        status: 400 
      });
    }

    if (!action) {
      return NextResponse.json({ 
        error: 'Missing action',
        verifyRes: { success: false },
        status: 400 
      });
    }

    const app_id = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;
    
    if (!app_id) {
      console.error('Missing NEXT_PUBLIC_APP_ID environment variable');
      return NextResponse.json({ 
        error: 'Server configuration error',
        verifyRes: { success: false },
        status: 500 
      });
    }

    console.log(`🔍 Verifying World ID proof for action: ${action}`);
    console.log(`📱 App ID: ${app_id}`);
    console.log(`🔧 Signal: ${signal || 'none'}`);
    console.log(`🔒 Verification Level: ${verification_level || 'not specified'}`);
    console.log(`📦 Payload fields:`, Object.keys(payload));

    // The payload from MiniKit should already contain all necessary fields
    // including merkle_root, nullifier_hash, proof, verification_level, etc.
    // We should NOT reconstruct it, just pass it through as-is
    
    // Verify the proof with Worldcoin
    const verifyRes = (await verifyCloudProof(
      payload, // Pass the original payload as-is
      app_id,
      action,
      signal || '', // Ensure signal is a string
    )) as IVerifyResponse;

    if (verifyRes.success) {
      console.log('✅ World ID verification successful');
      
      // This is where you would typically:
      // 1. Mark user as verified in database
      // 2. Grant access to restricted features
      // 3. Update user permissions
      // 4. Log verification event
      
      // For now, we'll just return success
      return NextResponse.json({ 
        verifyRes, 
        status: 200,
        message: 'Verification successful' 
      });
    } else {
      console.log('❌ World ID verification failed:', verifyRes);
      
      // Common failure reasons:
      // - User already verified for this action
      // - Invalid proof
      // - Replay attack detected
      // - Action not found in developer portal
      
      return NextResponse.json({ 
        verifyRes, 
        status: 400,
        message: 'Verification failed',
        error: verifyRes.detail || 'Unknown verification error'
      });
    }
  } catch (error) {
    console.error('Error in World ID verification endpoint:', error);
    
    return NextResponse.json({ 
      error: 'Internal server error during verification',
      verifyRes: { success: false },
      status: 500 
    });
  }
}
