import React from 'react';
import Image from 'next/image';
import { MarketCategory, MarketCategoryFilter } from '@/types/market';
import { MarketOption } from './types';

interface MarketDetailsStepProps {
  marketTitle: string;
  setMarketTitle: (title: string) => void;
  selectedCategory: MarketCategory | 'none';
  onCategoryChange: (category: MarketCategoryFilter) => void;
  options: MarketOption[];
  onOptionChange: (id: string, title: string) => void;
  onImageUpload: (id: string, file: File) => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
  onNext: () => void;
}

export const MarketDetailsStep: React.FC<MarketDetailsStepProps> = ({
  marketTitle,
  setMarketTitle,
  selectedCategory,
  onCategoryChange,
  options,
  onOptionChange,
  onImageUpload,
  onAddOption,
  onRemoveOption,
  onNext
}) => {
  const isValid = marketTitle.trim() && !options.some(opt => !opt.title.trim());

  return (
    <>
      {/* Market Title */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Market Question
        </label>
        <input
          type="text"
          value={marketTitle}
          onChange={(e) => setMarketTitle(e.target.value)}
          placeholder="What do you want to predict?"
          className="w-full px-4 py-3 bg-[#1D283B] border border-[#373a46] rounded-xl text-white placeholder-[#a0a0a0] focus:outline-none focus:border-[#e9ff74] transition-colors"
        />
      </div>

      {/* Add Images */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-white">
            Add Images
          </label>
          {/* Small Add Option Button */}
          <button
            onClick={onAddOption}
            className="px-3 py-1.5 border border-[#373a46] rounded-lg text-[#a0a0a0] hover:border-[#343445] hover:text-white hover:bg-gradient-to-br hover:from-[#343445] hover:to-[#2a2a3e]/60 transition-all duration-200 flex items-center gap-1.5 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Option
          </button>
        </div>
        
        {/* Grid layout for all options */}
        <div className="grid grid-cols-2 gap-4">
          {options.map((option, index) => (
            <div key={option.id} className="space-y-3">
              {/* Image Upload Area */}
              <div className="aspect-square bg-[#1D283B] border-2 border-dashed border-[#373a46] rounded-xl flex flex-col items-center justify-center p-6 hover:border-[#e9ff74] transition-colors relative">
                {option.imageUrl ? (
                  <Image
                    src={option.imageUrl}
                    alt={`Option ${index + 1}`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onImageUpload(option.id, file);
                        }
                      }}
                    />
                    <svg className="w-8 h-8 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-[#a0a0a0]">+ Add an image</span>
                  </label>
                )}
                
                {/* Remove Button - only show for options beyond the first 2 */}
                {index >= 2 && (
                  <button
                    onClick={() => onRemoveOption(option.id)}
                    className="absolute top-2 right-2 p-1 bg-[#1D283B] border border-[#373a46] rounded-full text-[#a0a0a0] hover:text-red-400 hover:border-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Option Text Input */}
              <input
                type="text"
                value={option.title}
                onChange={(e) => onOptionChange(option.id, e.target.value)}
                placeholder={`Selection ${index + 1}`}
                className="w-full px-4 py-3 bg-[#1D283B] border border-[#373a46] rounded-xl text-white placeholder-[#a0a0a0] focus:outline-none focus:border-[#e9ff74] transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-white mb-4">
          Select Category
        </label>
        <div className="h-[42px] p-1 bg-[#0f111a] rounded-[80px] outline outline-offset-[-1px] outline-[#262833] inline-flex justify-start items-start gap-px">
          {[
            { value: 'none', label: 'None' },
            { value: 'sports', label: 'Sports' },
            { value: 'crypto', label: 'Crypto' },
            { value: 'music', label: 'Music' }
          ].map((category) => {
            const isActive = selectedCategory === category.value;
            
            return (
              <button
                key={category.value}
                onClick={() => onCategoryChange(category.value as MarketCategoryFilter)}
                className={`h-[34px] px-[18px] py-3 rounded-[80px] inline-flex flex-col justify-center items-center gap-2.5 transition-all duration-200 ease-in-out ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#343445] to-[#2a2a3e]/60' 
                    : ''
                }`}
              >
                <div className="inline-flex justify-start items-center gap-4">
                  <div className="justify-center text-white text-base font-medium font-['Outfit'] leading-tight">
                    {category.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!isValid}
        className={`w-full py-4 rounded-full font-semibold text-lg transition-colors ${
          !isValid
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-[#e9ff74] text-black hover:bg-[#d4e668]'
        }`}
      >
        Next
      </button>
    </>
  );
}; 