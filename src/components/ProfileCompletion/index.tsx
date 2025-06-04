'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';

interface ProfileCompletionProps {
  user: {
    id: string;
    isProfileComplete: boolean;
    isEligible: boolean;
    age?: number;
    countryCode?: string;
    region?: string;
    termsAcceptedAt?: Date;
    privacyAcceptedAt?: Date;
    username?: string;
  };
  onComplete: () => void;
}

/**
 * ProfileCompletion component handles compliance checking for prediction market access
 * Includes age verification, region eligibility, and terms acceptance
 */
export const ProfileCompletion = ({ user, onComplete }: ProfileCompletionProps) => {
  const [formData, setFormData] = useState({
    age: user.age || '',
    countryCode: user.countryCode || '',
    region: user.region || '',
    termsAccepted: !!user.termsAcceptedAt,
    privacyAccepted: !!user.privacyAcceptedAt,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!formData.age || Number(formData.age) < 18) {
      setError('You must be at least 18 years old to participate in prediction markets.');
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

    try {
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: Number(formData.age),
          countryCode: formData.countryCode,
          region: formData.region,
          termsAccepted: formData.termsAccepted,
          privacyAccepted: formData.privacyAccepted,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onComplete();
      } else {
        setError(data.message || 'Failed to complete profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
      <p className="text-gray-600 mb-6">
        Welcome {user.username}! Please complete your profile to access prediction markets.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Age Verification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age *
          </label>
          <input
            type="number"
            min="18"
            max="120"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Country/Region */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country Code *
            </label>
            <input
              type="text"
              maxLength={2}
              placeholder="US, CA, GB..."
              value={formData.countryCode}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                countryCode: e.target.value.toUpperCase() 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region/State *
            </label>
            <input
              type="text"
              placeholder="California, Ontario..."
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                termsAccepted: e.target.checked 
              }))}
              className="h-4 w-4 text-blue-600 rounded"
              required
            />
            <span className="text-sm text-gray-700">
              I accept the Terms of Service and understand the risks of prediction markets
            </span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.privacyAccepted}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                privacyAccepted: e.target.checked 
              }))}
              className="h-4 w-4 text-blue-600 rounded"
              required
            />
            <span className="text-sm text-gray-700">
              I accept the Privacy Policy
            </span>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Completing Profile...' : 'Complete Profile'}
        </Button>
      </form>
    </div>
  );
}; 