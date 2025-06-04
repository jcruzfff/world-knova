import { MarketCategory } from './CategoryFilter';

export interface MarketOutcome {
  name: string;
  odds: number;
  percentage: number;
}

export interface Market {
  id: string;
  title: string;
  subtitle: string;
  category: MarketCategory;
  endTime: Date;
  totalVolume: string;
  outcomes: MarketOutcome[];
  isFeatured?: boolean;
  image?: string;
}

export interface MarketCardProps {
  market: Market;
  variant?: 'compact' | 'large' | 'list';
  onClick?: () => void;
} 