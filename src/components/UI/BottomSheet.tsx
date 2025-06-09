import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: 'auto' | 'half' | 'full';
  className?: string;
  showHandle?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnSwipeDown?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto',
  className = '',
  showHandle = true,
  closeOnBackdropClick = true,
  closeOnSwipeDown = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null); // Reference to the draggable header only

  // Show/hide sheet with proper animation timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Lock body scroll when sheet is open
      document.body.style.overflow = 'hidden';
      // Small delay to ensure DOM is ready then start animation
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
        setDragY(0); // Reset drag position
        // Unlock body scroll when sheet is closed
        document.body.style.overflow = 'unset';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Clean up body scroll lock on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle touch start (only on header)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!closeOnSwipeDown) return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    e.stopPropagation(); // Prevent event from bubbling
  }, [closeOnSwipeDown]);

  // Handle touch move (only when dragging started from header)
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !closeOnSwipeDown) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow downward dragging
    if (deltaY > 0) {
      setDragY(deltaY);
      e.preventDefault(); // Prevent scroll when dragging
      e.stopPropagation();
    }
  }, [isDragging, startY, closeOnSwipeDown]);

  // Handle touch end (complete the drag gesture)
  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !closeOnSwipeDown) return;
    
    setIsDragging(false);
    
    // Close if dragged down more than 100px
    if (dragY > 100) {
      onClose();
    } else {
      // Snap back to original position
      setDragY(0);
    }
  }, [isDragging, dragY, onClose, closeOnSwipeDown]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);

  // Calculate the maximum height for the sheet
  const getMaxHeight = () => {
    if (height === 'full') return '100vh';
    if (height === 'half') return '50vh';
    return '90vh'; // 'auto' case - max 90vh to leave some space at top
  };

  if (!isVisible) return null;

  const sheetContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[60] ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />
      
      {/* Sheet */}
      <div className="fixed inset-0 flex items-end justify-center z-[61] pointer-events-none">
        <div
          ref={sheetRef}
          className={`bg-[#1D283B] rounded-t-2xl shadow-2xl w-full max-w-lg pointer-events-auto transition-transform duration-300 ease-out flex flex-col ${className}`}
          style={{
            maxHeight: getMaxHeight(),
            transform: `translateY(${isAnimating ? dragY : '100%'}px)`,
          }}
        >
          {/* Draggable Header Area - ONLY this section handles touch events */}
          <div
            ref={headerRef}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-[#4a4f5e] rounded-full" />
              </div>
            )}
            
            {/* Header with title and close button */}
            {title && (
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#373a46]">
                <h3 className="text-lg font-semibold text-white font-['Outfit']">{title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Content Area - NO touch event handlers here */}
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
            {children}
          </div>
        </div>
      </div>
    </>
  );

  // Render in portal to ensure proper z-index stacking
  return createPortal(sheetContent, document.body);
}; 