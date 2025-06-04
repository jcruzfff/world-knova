'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { useState, useEffect } from 'react';
import { useProfileCompletion } from '@/providers/ProfileCompletionProvider';
import { useRouter } from 'next/navigation';

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
 * ProfileCompletionDrawer - A sliding bottom sheet for profile completion
 * Appears when users try to access restricted features
 */
export const ProfileCompletionDrawer = () => {
  const { isDrawerOpen, closeDrawer, user } = useProfileCompletion();
  const router = useRouter();

  const [formData, setFormData] = useState({
    age: user?.age?.toString() || '',
    countryCode: user?.countryCode || '',
    region: user?.region || '',
    termsAccepted: false,
    privacyAccepted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        age: user.age?.toString() || '',
        countryCode: user.countryCode || '',
        region: user.region || '',
        termsAccepted: false,
        privacyAccepted: false,
      });
    }
  }, [user]);

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
        closeDrawer();
        router.refresh();
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

  if (!isDrawerOpen || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
        isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <h2 className="text-xl font-bold">Complete Your Profile</h2>
              </div>
              <button 
                onClick={closeDrawer}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
            <p className="text-blue-100 text-sm">
              Hi {user.username}! Complete your profile to access prediction markets.
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Age Verification Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🎂</span>
                    <h3 className="text-lg font-semibold text-gray-900">Age Verification</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How old are you? *
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      placeholder="Enter your age"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span>ℹ️</span>
                      Must be {MIN_AGE} or older to participate
                    </p>
                  </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🌍</span>
                    <h3 className="text-lg font-semibold text-gray-900">Location Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region/State *
                      </label>
                      <input
                        type="text"
                        placeholder="California, Ontario, London..."
                        value={formData.region}
                        onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time eligibility check */}
                {formData.age && formData.countryCode && Number(formData.age) >= MIN_AGE && (
                  <div className={`p-4 rounded-xl border-2 ${
                    checkEligibility(Number(formData.age), formData.countryCode).eligible 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {checkEligibility(Number(formData.age), formData.countryCode).eligible ? '✅' : '❌'}
                      </span>
                      <p className={`text-sm font-medium ${
                        checkEligibility(Number(formData.age), formData.countryCode).eligible 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        {checkEligibility(Number(formData.age), formData.countryCode).reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Terms and Privacy Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📋</span>
                    <h3 className="text-lg font-semibold text-gray-900">Legal Requirements</h3>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          termsAccepted: e.target.checked 
                        }))}
                        className="h-5 w-5 text-blue-600 rounded border-2 border-gray-300 mt-1 focus:ring-blue-500"
                        required
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          I accept the <span className="font-semibold text-blue-600">Terms of Service</span> and understand the risks of prediction markets. 
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
                        className="h-5 w-5 text-blue-600 rounded border-2 border-gray-300 mt-1 focus:ring-blue-500"
                        required
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          I accept the <span className="font-semibold text-blue-600">Privacy Policy</span> and consent to the processing of my data.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-100 border-2 border-red-300 text-red-700 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 pb-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.termsAccepted || !formData.privacyAccepted}
                    className="w-full"
                    variant="primary"
                    size="lg"
                  >
                    <div className="flex items-center justify-center gap-2 py-2">
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>Completing Profile...</span>
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          <span>Complete Profile & Continue</span>
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 