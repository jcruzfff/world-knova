'use client';
import { Button, LiveFeedback } from '@/components/UI';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useState, useEffect } from 'react';

/**
 * This component handles World ID verification for Knova
 * Users must verify they are human before participating in prediction markets
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */
export const Verify = () => {
  const { isInstalled } = useMiniKit();
  const [isWorldApp, setIsWorldApp] = useState(false);
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [whichVerification, setWhichVerification] = useState<VerificationLevel>(
    VerificationLevel.Device,
  );
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    setIsWorldApp(isInstalled && MiniKit.isInstalled());
  }, [isInstalled]);

  const onClickVerify = async (verificationLevel: VerificationLevel) => {
    // Double check we're in World App
    if (!isWorldApp) {
      console.log('World ID verification only available in World App');
      return;
    }

    setButtonState('pending');
    setWhichVerification(verificationLevel);
    setDebugInfo('Starting verification...');
    
    try {
      // Use environment variable for action, with fallback
      const action = process.env.NEXT_PUBLIC_ACTION || 'knova-verify';
      console.log('Starting World ID verification with action:', action);
      console.log('Verification level:', verificationLevel);
      console.log('MiniKit installed status:', MiniKit.isInstalled());
      console.log('Current environment check:', {
        isWorldApp,
        isInstalled,
        miniKitInstalled: MiniKit.isInstalled()
      });
      
      const verifyPayload = {
        action: action,
        verification_level: verificationLevel,
      };
      console.log('Sending MiniKit verify command with payload:', verifyPayload);
      
      const result = await MiniKit.commandsAsync.verify(verifyPayload);
      
      console.log('World ID verification result:', result);
      console.log('Final payload:', result.finalPayload);
      console.log('Payload fields:', Object.keys(result.finalPayload || {}));
      console.log('Full payload content:', JSON.stringify(result.finalPayload, null, 2));
      
      // Check if verification was successful before sending to backend
      if (result.finalPayload?.status === 'error') {
        const errorCode = result.finalPayload.error_code;
        const fullError = result.finalPayload;
        
        console.error('❌ MiniKit verification failed - Full error object:', fullError);
        console.error('❌ Error code specifically:', errorCode);
        
        let errorMsg = 'World ID verification failed';
        
        // Provide specific guidance for known errors
        if (errorCode === 'inclusion_proof_failed') {
          errorMsg = '🔄 Network issue with World sequencer. Please tap to try again.';
        } else if (errorCode === 'credential_unavailable') {
          errorMsg = 'Device verification required. Please verify your device in World App first.';
        } else if (errorCode === 'max_verifications_reached') {
          errorMsg = 'You have already verified for this action.';
        } else if (errorCode === 'verification_rejected') {
          errorMsg = 'Verification was rejected. Please try again if this was a mistake.';
        } else if (errorCode === 'malformed_request') {
          errorMsg = 'Configuration error. Check app ID and action settings.';
        } else if (errorCode === 'invalid_network') {
          errorMsg = 'Network environment mismatch. Contact support.';
        } else if (!errorCode) {
          errorMsg = 'Unknown verification error. Check console for details.';
        } else {
          errorMsg = `MiniKit Error: ${errorCode}`;
        }
        
        setDebugInfo(errorMsg);
        setButtonState('failed');
        setTimeout(() => {
          setButtonState(undefined);
          setDebugInfo('');
        }, 7000); // Longer timeout to read error
        return;
      }
      
      // Only proceed if we have a valid proof payload
      if (!result.finalPayload?.proof || !result.finalPayload?.merkle_root) {
        const errorMsg = `Invalid payload - missing: ${!result.finalPayload?.proof ? 'proof ' : ''}${!result.finalPayload?.merkle_root ? 'merkle_root' : ''}`;
        console.error('❌ Invalid proof payload - missing required fields');
        console.log('Expected: proof, merkle_root, nullifier_hash, verification_level');
        console.log('Received:', Object.keys(result.finalPayload || {}));
        setDebugInfo(errorMsg);
        setButtonState('failed');
        setTimeout(() => {
          setButtonState(undefined);
          setDebugInfo('');
        }, 5000);
        return;
      }
      
      setDebugInfo('Verifying with backend...');
      
      // Verify the proof on our backend
      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: result.finalPayload,
          action: action,
          signal: '', // Can be used for additional verification context
        }),
      });

      const data = await response.json();
      console.log('Backend verification result:', data);

      if (data.verifyRes.success) {
        setButtonState('success');
        setDebugInfo('✅ Verification successful!');
        console.log('✅ World ID verification successful!');
        
        // Here you could trigger additional actions like:
        // - Update user profile as verified
        // - Enable additional features
        // - Show success message
        
        // Keep success state for 3 seconds, then reset
        setTimeout(() => {
          setButtonState(undefined);
          setDebugInfo('');
        }, 3000);
      } else {
        setButtonState('failed');
        const errorMsg = `Backend Error: ${data.verifyRes.code || 'unknown'} - ${data.verifyRes.detail || 'verification failed'}`;
        setDebugInfo(errorMsg);
        console.error('❌ World ID verification failed:', data.verifyRes);

        // Reset the button state after 5 seconds
        setTimeout(() => {
          setButtonState(undefined);
          setDebugInfo('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error during World ID verification:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setButtonState('failed');
      
      // Reset the button state after 5 seconds
      setTimeout(() => {
        setButtonState(undefined);
        setDebugInfo('');
      }, 5000);
    }
  };

  if (!isWorldApp) {
    // Show development-friendly UI in browser
    return (
      <div className="grid w-full gap-4 p-4 border-2 border-dashed border-gray-400 rounded-lg">
        <p className="text-lg font-semibold">🔧 Development Mode - World ID Verification</p>
        <p className="text-sm text-gray-600">
          World ID verification is only available in World App. 
          This component will work when the app is opened in World App.
        </p>
        <div className="text-xs text-gray-500 mt-2">
          <p><strong>Action:</strong> {process.env.NEXT_PUBLIC_ACTION || 'knova-verify'}</p>
          <p><strong>App ID:</strong> {process.env.NEXT_PUBLIC_APP_ID}</p>
        </div>
        <Button
          onClick={() => console.log('Mock World ID verification (Device level)')}
          size="lg"
          variant="tertiary"
          className="w-full"
        >
          Mock Verify (Device) - Dev Only
        </Button>
        <Button
          onClick={() => console.log('Mock World ID verification (Orb level)')}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Mock Verify (Orb) - Dev Only
        </Button>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-4">
      <div>
        <p className="text-lg font-semibold">Verify Your Humanity</p>
        <p className="text-sm text-gray-600 mt-1">
          Prove you're a real person to participate in prediction markets
        </p>
        <div className="text-xs text-gray-500 mt-2">
          <p><strong>Action:</strong> {process.env.NEXT_PUBLIC_ACTION || 'knova-verify'}</p>
        </div>
      </div>
      
      {debugInfo && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{debugInfo}</p>
        </div>
      )}
      
      <LiveFeedback
        label={{
          failed: 'Verification failed',
          pending: 'Verifying your identity...',
          success: 'Verified! You are human ✅',
        }}
        state={
          whichVerification === VerificationLevel.Device
            ? buttonState
            : undefined
        }
        className="w-full"
      >
        <Button
          onClick={() => onClickVerify(VerificationLevel.Device)}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="tertiary"
          className="w-full"
        >
          Verify (Device)
        </Button>
      </LiveFeedback>
      
      <LiveFeedback
        label={{
          failed: 'Verification failed',
          pending: 'Verifying with Orb...',
          success: 'Orb verified! Highest trust level ✅',
        }}
        state={
          whichVerification === VerificationLevel.Orb ? buttonState : undefined
        }
        className="w-full"
      >
        <Button
          onClick={() => onClickVerify(VerificationLevel.Orb)}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Verify (Orb)
        </Button>
      </LiveFeedback>
      
      <div className="text-xs text-gray-500 mt-2">
        <p><strong>Device:</strong> Verify using your device's biometrics</p>
        <p><strong>Orb:</strong> Highest verification level using World ID Orb</p>
      </div>
    </div>
  );
};
