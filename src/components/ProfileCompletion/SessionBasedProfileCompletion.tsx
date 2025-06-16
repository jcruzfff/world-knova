'use client';

import { useState } from 'react';
import { Verify } from '@/components/Verify';

interface SessionBasedProfileCompletionProps {
  user: {
    id: string;
    isProfileComplete: boolean;
    isEligible: boolean;
    age?: number;
    countryCode?: string;
    region?: string;
    username?: string;
  };
  onCompleteAction: () => void;
  onSkip?: () => void; // Add optional skip callback
}

// Countries where prediction markets are generally restricted
const RESTRICTED_COUNTRIES = [
  'US', // United States (complex state-by-state laws)
  'FR', // France (strict gambling laws)
  'TR', // Turkey
  'CN', // China
  'KR', // South Korea
  'SG', // Singapore (strict regulation)
];

const MIN_AGE = 18;

/**
 * ProfileCompletion component with database integration
 * Handles compliance checking and calls the API for profile completion
 */
export const SessionBasedProfileCompletion = ({ user, onCompleteAction }: SessionBasedProfileCompletionProps) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: WorldID, 2: Profile
  const [formData, setFormData] = useState({
    age: user.age?.toString() || '',
    countryCode: user.countryCode || '',
    region: user.region || '',
    termsAccepted: false,
    privacyAccepted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = (age: number, countryCode: string) => {
    // Age check
    if (age < MIN_AGE) {
      return {
        eligible: false,
        reason: `You must be at least ${MIN_AGE} years old to participate in prediction markets.`
      };
    }

    // Country restriction check
    if (RESTRICTED_COUNTRIES.includes(countryCode.toUpperCase())) {
      return {
        eligible: false,
        reason: `Prediction markets are currently restricted in ${countryCode}. Please check your local regulations.`
      };
    }

    return {
      eligible: true,
      reason: 'You are eligible to participate in prediction markets!'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    const age = Number(formData.age);
    if (!formData.age || age < MIN_AGE) {
      setError(`You must be at least ${MIN_AGE} years old to participate in prediction markets.`);
      setIsSubmitting(false);
      return;
    }

    if (!formData.countryCode || !formData.region) {
      setError('Please provide your location information.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.termsAccepted || !formData.privacyAccepted) {
      setError('You must accept the terms of service and privacy policy.');
      setIsSubmitting(false);
      return;
    }

    // Check eligibility
    const eligibilityResult = checkEligibility(age, formData.countryCode);

    if (!eligibilityResult.eligible) {
      setError(eligibilityResult.reason);
      setIsSubmitting(false);
      return;
    }

    try {
      // Call the profile completion API
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: age,
          countryCode: formData.countryCode.toUpperCase(),
          region: formData.region,
          termsAccepted: formData.termsAccepted,
          privacyAccepted: formData.privacyAccepted,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Profile completed successfully:', data.user);
        onCompleteAction();
      } else {
        setError(data.message || 'Failed to complete profile');
      }
      
    } catch (_error) {
      console.error('Profile completion error:', _error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorldIdSuccess = () => {
    setCurrentStep(2);
  };

  return (
    <div className="bg-[#1D283B] text-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              {currentStep === 1 ? 'Verify Your Identity' : 'Complete Your Profile'}
            </h2>
            <p className="text-[#a0a0a0] font-['Outfit'] mt-1">
              {currentStep === 1 
                ? 'First, verify you\'re human with World ID to access prediction markets.'
                : `Hi ${user.username}! Let's set up your account to access prediction markets.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {currentStep === 1 ? (
          /* World ID Verification Step */
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#e9ff74] rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">World ID Verification Required</h3>
              <p className="text-[#a0a0a0] text-sm max-w-sm mx-auto">
                To ensure fair and secure predictions, we need to verify you&apos;re a unique human person using World ID.
              </p>
            </div>
            
            {/* World ID Component */}
            <Verify onSuccess={handleWorldIdSuccess} />
            
            {/* For development - skip button */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-4 border-t border-[#373a46]">
                <button
                  onClick={handleWorldIdSuccess}
                  className="w-full py-3 text-[#a0a0a0] hover:text-white transition-colors text-sm"
                >
                  Skip World ID (Development Only)
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Profile Completion Step */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Age Verification Section */}
          <div className="space-y-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-white font-['Outfit']">Age Verification</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#a0a0a0] mb-2 font-['Outfit']">
                How old are you? *
              </label>
              <input
                type="number"
                min="18"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full p-4 bg-[#0F111A] border border-[#373a46] rounded-xl focus:ring-2 focus:ring-[#e9ff74] focus:border-[#e9ff74] text-lg text-white placeholder-[#666] font-['Outfit']"
                placeholder="Enter your age"
                required
              />
              <p className="text-xs text-[#a0a0a0] mt-2 font-['Outfit']">
                Must be {MIN_AGE} or older to participate
              </p>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-white font-['Outfit']">Location Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-2 font-['Outfit']">
                  Country Code *
                </label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="US, CA, GB, DE..."
                  value={formData.countryCode}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    countryCode: e.target.value.toUpperCase() 
                  }))}
                  className="w-full p-4 bg-[#0F111A] border border-[#373a46] rounded-xl focus:ring-2 focus:ring-[#e9ff74] focus:border-[#e9ff74] text-lg uppercase text-white placeholder-[#666] font-['Outfit']"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-2 font-['Outfit']">
                  Region/State *
                </label>
                <input
                  type="text"
                  placeholder="California, Ontario, London..."
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full p-4 bg-[#0F111A] border border-[#373a46] rounded-xl focus:ring-2 focus:ring-[#e9ff74] focus:border-[#e9ff74] text-lg text-white placeholder-[#666] font-['Outfit']"
                  required
                />
              </div>
            </div>
          </div>

          {/* Real-time eligibility check */}
          {formData.age && formData.countryCode && Number(formData.age) >= MIN_AGE && (
            <div className={`p-4 rounded-xl border-2 ${
              checkEligibility(Number(formData.age), formData.countryCode).eligible 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-red-900/20 border-red-500/30'
            }`}>
              <p className={`text-sm font-medium font-['Outfit'] ${
                checkEligibility(Number(formData.age), formData.countryCode).eligible 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {checkEligibility(Number(formData.age), formData.countryCode).reason}
              </p>
            </div>
          )}

          {/* Terms and Privacy Section */}
          <div className="space-y-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-white font-['Outfit']">Legal Requirements</h3>
            </div>
            
            <div className="bg-[#0F111A] rounded-xl p-4 space-y-4 border border-[#373a46]">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    termsAccepted: e.target.checked 
                  }))}
                  className="h-5 w-5 text-[#e9ff74] rounded border-2 border-[#373a46] mt-1 focus:ring-[#e9ff74] bg-[#0F111A]"
                  required
                />
                <div className="flex-1">
                  <span className="text-sm text-[#a0a0a0] group-hover:text-white transition-colors font-['Outfit']">
                    I accept the <span className="font-semibold text-[#e9ff74]">Terms of Service</span> and understand the risks of prediction markets. 
                    I acknowledge this is a form of speculation and I may lose money.
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.privacyAccepted}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    privacyAccepted: e.target.checked 
                  }))}
                  className="h-5 w-5 text-[#e9ff74] rounded border-2 border-[#373a46] mt-1 focus:ring-[#e9ff74] bg-[#0F111A]"
                  required
                />
                <div className="flex-1">
                  <span className="text-sm text-[#a0a0a0] group-hover:text-white transition-colors font-['Outfit']">
                    I accept the <span className="font-semibold text-[#e9ff74]">Privacy Policy</span> and consent to the processing of my data.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border-2 border-red-500/30 text-red-400 rounded-xl">
              <span className="font-medium font-['Outfit']">{error}</span>
            </div>
          )}

          {/* Submit Button with proper bottom spacing */}
          <div className="pt-4 pb-6">
            <button
              type="submit"
              disabled={isSubmitting || !formData.termsAccepted || !formData.privacyAccepted}
              className={`w-full rounded-full transition-all duration-200 ease-in-out font-['Outfit'] ${
                isSubmitting || !formData.termsAccepted || !formData.privacyAccepted
                  ? 'bg-gray-600 cursor-not-allowed opacity-60' 
                  : 'bg-[#e9ff74] hover:bg-[#d4e668] active:bg-[#c1d35c] cursor-pointer'
              }`}
            >
              <div className="flex flex-row items-center justify-center relative w-full h-full">
                <div className="flex flex-row gap-2.5 items-center justify-center px-5 py-4 relative w-full h-full">
                  <div className="font-semibold text-[14px] text-black text-nowrap leading-normal">
                    {isSubmitting ? 'Completing Profile...' : 'Complete Profile & Continue'}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}; 