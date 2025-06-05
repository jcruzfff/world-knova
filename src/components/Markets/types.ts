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
  description?: string;
  category: MarketCategory;
  endTime: Date;
  totalVolume: string;
  outcomes: MarketOutcome[];
  isFeatured?: boolean;
  image?: string;
  totalStakers?: number;
  createdAt?: Date;
  creator?: string;
  tags?: string[];
  resolutionSource?: string;
  rules?: string[];
}

export interface MarketCardProps {
  market: Market;
  variant?: 'compact' | 'large' | 'list';
  onClick?: () => void;
}

export interface MarketDetailProps {
  market: Market;
} 