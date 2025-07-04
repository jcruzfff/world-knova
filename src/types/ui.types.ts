// UI and component state types for Knova
// Handles form states, loading states, and component interfaces

import { CreateMarketRequest, UpdateUserRequest } from './index';

// Loading states for async operations
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: Date | null;
}

// Form validation state
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Generic form state
export interface FormState<T> extends FormValidationState {
  data: T;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Market creation form state (multi-step wizard)
export interface MarketCreationState {
  step: number;
  totalSteps: number;
  formData: Partial<CreateMarketRequest>;
  isValid: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
  uploadedImages: string[]; // URLs of uploaded images
}

// Profile completion state (multi-step)
export interface ProfileCompletionState {
  step: number;
  totalSteps: number;
  formData: Partial<UpdateUserRequest>;
  isValid: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
  progress: number; // Percentage completed
}

// Modal state management
export interface ModalState {
  isOpen: boolean;
  type?: string | null;
  data?: Record<string, unknown> | null;
}

// Toast/notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Navigation state
export interface NavigationState {
  currentTab: string;
  previousTab?: string;
  canGoBack: boolean;
}

// Search/filter UI state
export interface SearchState {
  query: string;
  filters: Record<string, string | number | boolean | null>;
  suggestions: string[];
  isSearching: boolean;
  results: unknown[];
  totalCount: number;
}

// Table/list UI state
export interface TableState {
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
  selectedItems: string[];
}

// Chart/visualization types
export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'scatter';
}

export interface ChartConfig {
  title?: string;
  xAxis: {
    label?: string;
    type: 'category' | 'number' | 'time';
  };
  yAxis: {
    label?: string;
    type: 'number';
    min?: number;
    max?: number;
  };
  legend?: boolean;
  grid?: boolean;
  responsive?: boolean;
}

// Component variants and sizes
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type InputVariant = 'default' | 'filled' | 'flushed' | 'unstyled';
export type InputSize = 'sm' | 'md' | 'lg';

// Theme and appearance
export type ColorScheme = 'light' | 'dark' | 'system';
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ThemeState {
  colorScheme: ColorScheme;
  primaryColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fontScale: number;
}

// Drawer/sheet state
export interface DrawerState {
  isOpen: boolean;
  placement: 'top' | 'right' | 'bottom' | 'left';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  overlay?: boolean;
}

// WebSocket connection state
export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  lastPingTime?: Date;
  reconnectAttempts: number;
  error?: string | null;
}

// Real-time update types for WebSocket
export interface MarketUpdate {
  type: 'market_update';
  marketId: string;
  data: {
    totalPool?: number;
    participantCount?: number;
    options?: Array<{
      id: string;
      odds?: number;
      percentage?: number;
    }>;
  };
}

export interface PredictionUpdate {
  type: 'prediction_update';
  predictionId: string;
  data: {
    status?: string;
    payout?: number;
  };
}

export interface UserUpdate {
  type: 'user_update';
  userId: string;
  data: {
    currentStreak?: number;
    longestStreak?: number;
  };
}

export type WebSocketMessage = MarketUpdate | PredictionUpdate | UserUpdate;

// Infinite scroll/pagination state
export interface InfiniteScrollState {
  hasMore: boolean;
  isLoading: boolean;
  items: unknown[];
  page: number;
  error?: string | null;
}

// File upload UI state
export interface FileUploadState {
  files: File[];
  uploadProgress: Record<string, number>;
  uploadedUrls: Record<string, string>;
  errors: Record<string, string>;
  isUploading: boolean;
}

// Responsive state
export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: Breakpoint;
  screenWidth: number;
  screenHeight: number;
}

// Accessibility state
export interface A11yState {
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  announcements: string[];
}

// Application-wide UI state
export interface AppUIState {
  theme: ThemeState;
  navigation: NavigationState;
  modals: Record<string, ModalState>;
  toasts: ToastMessage[];
  drawer: DrawerState;
  webSocket: WebSocketState;
  responsive: ResponsiveState;
  a11y: A11yState;
}

// Prediction UI specific types
export interface PredictionFormState {
  selectedOutcome?: string;
  stakeAmount: string;
  potentialPayout: number;
  isValidStake: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

// Market creation wizard step types
export type MarketCreationStep = 'details' | 'outcomes' | 'timing' | 'funding' | 'review';

export interface MarketCreationStepState {
  current: MarketCreationStep;
  completed: MarketCreationStep[];
  canProceed: boolean;
  canGoBack: boolean;
}

// Filter panel state
export interface FilterPanelState {
  isOpen: boolean;
  activeFilters: Record<string, string | number | boolean | null>;
  tempFilters: Record<string, string | number | boolean | null>; // For preview before applying
  hasChanges: boolean;
}

// Component ref types for imperative APIs
export interface ModalRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface ToastRef {
  show: (message: Omit<ToastMessage, 'id'>) => string;
  hide: (id: string) => void;
  clear: () => void;
}

export interface FormRef<T> {
  submit: () => Promise<void>;
  reset: () => void;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldError: (field: keyof T, error: string) => void;
  validate: () => boolean;
} 