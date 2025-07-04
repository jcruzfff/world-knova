import { Market, MarketOption } from '@/types/market';

export interface MarketCardProps {
  market: Market;
  variant?: 'compact' | 'large' | 'list';
  onClick?: () => void;
}

export interface MarketDetailProps {
  market: Market;
}

export interface PredictionData {
  userId: string;
  outcome: string;
  stake: number;
  potentialEarnings: number;
}

export interface PredictionWagerOverlayProps {
  isOpen: boolean;
  onCloseAction: () => void;
  market: Market | null;
  selectedOption: string | null;
  selectedOptionData?: MarketOption | null;
  onPredictionMade?: (predictionData: PredictionData) => void;
} 