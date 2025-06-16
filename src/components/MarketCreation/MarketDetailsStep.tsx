import React, { useState } from 'react';
import Image from 'next/image';
import { MarketCategory, MarketCategoryFilter, MarketOption } from '@/types/market';

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

// Image compression utility
const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.warn('Canvas context not available, using original file');
        resolve(file);
        return;
      }

      const img = new window.Image(); // Use window.Image explicitly
      
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg', // Always convert to JPEG for better compression
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                console.warn('Canvas blob creation failed, using original file');
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          console.warn('Image compression failed:', error);
          resolve(file); // Fallback to original file
        }
      };
      
      img.onerror = () => {
        console.warn('Image loading failed, using original file');
        resolve(file); // Fallback to original file
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.warn('Image compression setup failed:', error);
      resolve(file); // Fallback to original file
    }
  });
};

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
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Record<string, string>>({});
  
  const isValid = marketTitle.trim() && !options.some(opt => !opt.title.trim());

  // Remove image function
  const handleRemoveImage = (optionId: string) => {
    // Clean up the object URL
    if (imagePreviewUrls[optionId]) {
      URL.revokeObjectURL(imagePreviewUrls[optionId]);
    }
    
    // Remove from all state
    setImagePreviewUrls(prev => {
      const newUrls = { ...prev };
      delete newUrls[optionId];
      return newUrls;
    });
    

    
    console.log('🗑️ Image removed for option:', optionId);
  };

  const handleImageSelection = async (optionId: string, file: File) => {
    // Set loading state
    setUploadingImages(prev => new Set(prev).add(optionId));

    try {
      let processedFile = file;
      
      // Check if file needs compression
      if (file.size > 2 * 1024 * 1024) { // If larger than 2MB, compress it
        console.log(`📦 Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        
        // Apply compression
        processedFile = await compressImage(file, 800, 600, 0.8);
        
        console.log(`🗜️ Compressed file size: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
        
        // If still too large, apply more aggressive compression
        if (processedFile.size > 4 * 1024 * 1024) {
          processedFile = await compressImage(file, 600, 400, 0.6);
          console.log(`🗜️ More aggressive compression: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
        }
      }

      // Create a local URL for preview first
      const previewUrl = URL.createObjectURL(processedFile);
      
      // Store the preview URL locally for immediate preview
      setImagePreviewUrls(prev => ({ ...prev, [optionId]: previewUrl }));
      
      // Upload to server and get permanent URL
      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('optionId', optionId); // Include option ID for tracking
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Image uploaded successfully:', {
          optionId,
          imageId: result.data.id,
          url: result.data.url
        });
        
        // Call the parent's onImageUpload with the processed file for storage
        onImageUpload(optionId, processedFile);
      } else {
        console.error('❌ Image upload failed:', result.error);
        // Clean up on failure
        handleRemoveImage(optionId);
        alert(`Image upload failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Image processing/upload error:', error);
      // Clean up on failure
      handleRemoveImage(optionId);
      alert('Image processing failed. Please try again.');
    } finally {
      // Remove loading state
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(optionId);
        return newSet;
      });
    }
  };

  // Handle file selection with validation
  const handleFileSelect = async (optionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Show file size warning for very large files
    if (file.size > 10 * 1024 * 1024) { // 10MB
      const proceed = window.confirm(
        `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. Large images will be compressed automatically. Continue?`
      );
      if (!proceed) return;
    }

    await handleImageSelection(optionId, file);
  };

  // Clean up object URLs when component unmounts or images change
  React.useEffect(() => {
    return () => {
      Object.values(imagePreviewUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviewUrls]);

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
          {options.map((option, index) => {
            const isUploading = uploadingImages.has(option.id);
            const previewUrl = imagePreviewUrls[option.id];
            
            return (
              <div key={option.id} className="space-y-3">
                {/* Image Upload Area - Made perfect square */}
                <div className={`aspect-square bg-[#1D283B] border-2 border-dashed border-[#373a46] rounded-xl hover:border-[#e9ff74] transition-colors relative overflow-hidden ${
                  isUploading || previewUrl ? '' : 'flex flex-col items-center justify-center p-6'
                }`}>
                  {isUploading ? (
                    /* Loading State */
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-2 border-[#e9ff74] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-[#a0a0a0]">Processing...</span>
                    </div>
                  ) : previewUrl ? (
                    /* Image Preview - Fill entire square area with no padding */
                    <div className="w-full h-full relative">
                      <Image
                        src={previewUrl}
                        alt={`Option ${index + 1}`}
                        fill
                        className="object-cover rounded-xl"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      
                      {/* Remove Image Button - Top Right */}
                      <button
                        onClick={() => handleRemoveImage(option.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors z-20 shadow-lg"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      
                      {/* Replace Image Button - Center overlay */}
                      <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center rounded-xl">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileSelect(option.id, e)}
                        />
                        <div className="text-white text-center">
                          <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs">Replace</span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    /* Upload Placeholder */
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(option.id, e)}
                      />
                      <svg className="w-8 h-8 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-[#a0a0a0]">+ Add an image</span>
                    </label>
                  )}
                  
                  {/* Remove Button - only show for options beyond the first 2 */}
                  {index >= 2 && !isUploading && !previewUrl && (
                    <button
                      onClick={() => onRemoveOption(option.id)}
                      className="absolute top-2 right-2 p-1 bg-[#1D283B] border border-[#373a46] rounded-full text-[#a0a0a0] hover:text-red-400 hover:border-red-400 transition-colors z-10"
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
            );
          })}
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