import React from 'react';
import Image from 'next/image';

interface FundingDetailsStepProps {
  selectedToken: string;
  setSelectedToken: (token: string) => void;
  showTokenDropdown: boolean;
  setShowTokenDropdown: (show: boolean) => void;
  fundAmount: string;
  setFundAmount: (amount: string) => void;
  customAmount: string;
  setCustomAmount: (amount: string) => void;
  selectedDuration: string;
  setSelectedDuration: (duration: string) => void;
  onLaunch: () => void;
  isCreating: boolean;
}

export const FundingDetailsStep: React.FC<FundingDetailsStepProps> = ({
  selectedToken,
  setSelectedToken,
  showTokenDropdown,
  setShowTokenDropdown,
  fundAmount,
  setFundAmount,
  customAmount,
  setCustomAmount,
  selectedDuration,
  setSelectedDuration,
  onLaunch,
  isCreating
}) => {
  return (
    <>
      {/* Token Selection */}
      <div>
        <label className="block text-sm font-medium text-[#d0d0d0] mb-4">
          Select token
        </label>
        <div className="relative">
          <button
            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
            className="w-full h-12 rounded-[109px] border border-[#272933] bg-[#0f111a] flex items-center justify-between px-4 hover:border-[#e9ff74] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
                <Image
                  src={selectedToken === 'WRLD' ? "/world-icon.svg" : "/usdc-icon.svg"}
                  alt={selectedToken}
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
              </div>
              <span className="text-white text-sm font-medium font-['Outfit']">
                {selectedToken}
              </span>
            </div>
            <svg className="w-3 h-2 text-[#959dad]" fill="currentColor" viewBox="0 0 12 8">
              <path d="M6 8L0 2h12L6 8z"/>
            </svg>
          </button>
          
          {showTokenDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1D283B] border border-[#373a46] rounded-xl overflow-hidden z-10">
              <button
                onClick={() => {
                  setSelectedToken('WRLD');
                  setShowTokenDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#373a46] transition-colors"
              >
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <Image
                    src="/world-icon.svg"
                    alt="WRLD"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </div>
                <span className="text-white font-medium">WRLD</span>
              </button>
              <button
                onClick={() => {
                  setSelectedToken('USDC');
                  setShowTokenDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#373a46] transition-colors"
              >
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <Image
                    src="/usdc-icon.svg"
                    alt="USDC"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </div>
                <span className="text-white font-medium">USDC</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fund Amount */}
      <div>
        <label className="block text-sm font-medium text-[#d0d0d0] mb-4">
          Fund amount
        </label>
        <div className="flex gap-2">
          {['0.50', '1', '10', 'Custom'].map((amount) => (
            <button
              key={amount}
              onClick={() => setFundAmount(amount)}
              className={`h-[34px] rounded-[80px] flex items-center gap-2.5 transition-colors duration-200 ${
                fundAmount === amount
                  ? 'bg-gradient-to-br from-[#373a46] to-[#464c68]/30'
                  : 'border border-[#272934]'
              }`}
              style={{ paddingLeft: '6px', paddingRight: '16px' }}
            >
              <Image
                src={selectedToken === 'WRLD' ? "/world-icon.svg" : "/usdc-icon.svg"}
                alt={selectedToken}
                width={16}
                height={16}
                className="w-4 h-4"
              />
              <span className="text-white text-base font-medium font-['Outfit']">
                {amount}
              </span>
            </button>
          ))}
        </div>
        {fundAmount === 'Custom' && (
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full mt-3 px-4 py-3 bg-[#1D283B] border border-[#373a46] rounded-xl text-white placeholder-[#a0a0a0] focus:outline-none focus:border-[#e9ff74] transition-colors"
          />
        )}
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-[#d0d0d0] mb-4">
          Duration
        </label>
        <div className="h-[42px] p-1 bg-[#0f111a] rounded-[80px] outline outline-offset-[-1px] outline-[#262833] inline-flex justify-start items-start gap-px">
          {['24 hour', '1 week', '1 month'].map((duration) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={`h-[34px] px-[18px] py-3 rounded-[80px] inline-flex flex-col justify-center items-center gap-2.5 transition-all duration-200 ease-in-out ${
                selectedDuration === duration
                  ? 'bg-gradient-to-br from-[#343445] to-[#2a2a3e]/60'
                  : ''
              }`}
            >
              <div className="inline-flex justify-start items-center gap-4">
                <div className="justify-center text-white text-base font-medium font-['Outfit'] leading-tight">
                  {duration}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Launch Button */}
      <button
        onClick={onLaunch}
        disabled={isCreating}
        className={`w-full py-4 rounded-full font-semibold text-lg transition-colors ${
          isCreating
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-[#e9ff74] text-black hover:bg-[#d4e668]'
        }`}
      >
        {isCreating ? 'Launching...' : 'Launch'}
      </button>
    </>
  );
}; 