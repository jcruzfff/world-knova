import { Market } from '@/types/market';

export interface MarketCardProps {
  market: Market;
  variant?: 'compact' | 'large' | 'list';
  onClick?: () => void;
}

export interface MarketDetailProps {
  market: Market;
} 