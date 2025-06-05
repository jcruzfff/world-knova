import { Market, MarketOption, MarketCategory, MarketStatus } from '@/types/market';

// Mock user data for creators
const mockCreators = [
  {
    id: 'user_1',
    username: 'cryptopundit',
    displayName: 'Crypto Pundit',
    profilePictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user_2', 
    username: 'sportsanalytics',
    displayName: 'Sports Analytics Pro',
    profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user_3',
    username: 'techvisionary',
    displayName: 'Tech Visionary',
    profilePictureUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user_4',
    username: 'moviebuff',
    displayName: 'Movie Buff',
    profilePictureUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
];

// Generate mock market options
function createBinaryOptions(): MarketOption[] {
  return [
    {
      id: 'opt_yes',
      title: 'Yes',
      description: 'This will happen',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=200&fit=crop',
      orderIndex: 0
    },
    {
      id: 'opt_no',
      title: 'No', 
      description: 'This will not happen',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=200&fit=crop',
      orderIndex: 1
    }
  ];
}

function createMultipleOptions(options: string[]): MarketOption[] {
  return options.map((option, index) => ({
    id: `opt_${index}`,
    title: option,
    description: `Option: ${option}`,
    imageUrl: `https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=200&fit=crop&random=${index}`,
    orderIndex: index
  }));
}

// Generate realistic dates
function getRandomFutureDate(daysFromNow: number = 30): Date {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (Math.random() * daysFromNow * 24 * 60 * 60 * 1000));
  return futureDate;
}

function getRandomPastDate(daysAgo: number = 7): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * daysAgo * 24 * 60 * 60 * 1000));
  return pastDate;
}

// Mock market data
export const mockMarkets: Market[] = [
  // Sports Markets
  {
    id: 'market_1',
    title: 'Will the Lakers make the NBA playoffs this season?',
    description: 'The Lakers have had a strong start to the season. Will they secure a playoff spot?',
    category: 'sports',
    outcomeType: 'binary',
    options: createBinaryOptions(),
    minStake: 1,
    maxStake: 1000,
    totalPool: 15420,
    startTime: getRandomPastDate(3),
    endTime: getRandomFutureDate(45),
    status: 'active',
    resolutionCriteria: 'Resolved based on official NBA standings at end of regular season',
    oracleSource: 'sportradar',
    oracleId: 'nba_lakers_playoffs_2024',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=300&fit=crop',
    tags: ['basketball', 'nba', 'lakers', 'playoffs'],
    participantCount: 342,
    viewCount: 1250,
    createdAt: getRandomPastDate(5),
    updatedAt: getRandomPastDate(1)
  },

  // Crypto Markets
  {
    id: 'market_2',
    title: 'Will Bitcoin reach $100,000 by end of 2024?',
    description: 'Bitcoin has been volatile this year. Will it hit the psychological $100K milestone?',
    category: 'crypto',
    outcomeType: 'binary',
    options: createBinaryOptions(),
    minStake: 1,
    maxStake: 5000,
    totalPool: 89230,
    startTime: getRandomPastDate(7),
    endTime: new Date('2024-12-31'),
    status: 'active',
    resolutionCriteria: 'Based on CoinGecko BTC/USD price reaching $100,000 at any point before Dec 31, 2024',
    oracleSource: 'coingecko',
    oracleId: 'bitcoin_100k_2024',
    imageUrl: 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=600&h=300&fit=crop',
    tags: ['bitcoin', 'crypto', '100k', 'price'],
    participantCount: 1250,
    viewCount: 5430,
    createdAt: getRandomPastDate(10),
    updatedAt: getRandomPastDate(1)
  },

  // Music Markets 
  {
    id: 'market_3',
    title: 'Which artist will win Grammy Album of the Year 2025?',
    description: 'The Grammy nominations are out. Which album will take home the top prize?',
    category: 'music',
    outcomeType: 'multiple',
    options: createMultipleOptions(['Taylor Swift - Tortured Poets', 'Beyonce - Cowboy Carter', 'Billie Eilish - Hit Me Hard', 'Kendrick Lamar - GNX', 'Sabrina Carpenter - Short n Sweet', 'Other']),
    minStake: 1,
    maxStake: 500,
    totalPool: 23150,
    startTime: getRandomPastDate(14),
    endTime: new Date('2025-02-02'),
    status: 'active',
    resolutionCriteria: 'Based on official Grammy Awards ceremony results',
    oracleSource: 'manual',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop',
    tags: ['grammys', 'music', 'awards', 'album-of-the-year'],
    participantCount: 567,
    viewCount: 2100,
    createdAt: getRandomPastDate(15),
    updatedAt: getRandomPastDate(2)
  },

  // User-Generated Markets
  {
    id: 'market_4',
    title: 'Will Elon Musk tweet about Dogecoin this week?',
    description: 'Elon has been quiet about DOGE lately. Will he mention it in the next 7 days?',
    category: 'crypto',
    outcomeType: 'binary',
    options: createBinaryOptions(),
    minStake: 1,
    maxStake: 100,
    totalPool: 850,
    startTime: getRandomPastDate(1),
    endTime: getRandomFutureDate(7),
    status: 'active',
    resolutionCriteria: 'Any tweet from @elonmusk that mentions "Dogecoin", "DOGE", or dog emoji',
    createdBy: mockCreators[0],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=300&fit=crop',
    tags: ['elon-musk', 'dogecoin', 'twitter', 'social-media'],
    participantCount: 89,
    viewCount: 450,
    createdAt: getRandomPastDate(2),
    updatedAt: getRandomPastDate(1)
  },

  {
    id: 'market_5',
    title: 'Will it rain in San Francisco tomorrow?',
    description: 'The weather forecast is showing mixed signals. What do you think?',
    category: 'user_generated',
    outcomeType: 'binary',
    options: createBinaryOptions(),
    minStake: 1,
    maxStake: 50,
    totalPool: 125,
    startTime: getRandomPastDate(1),
    endTime: getRandomFutureDate(1),
    status: 'active',
    resolutionCriteria: 'Based on official weather reports showing any measurable precipitation in San Francisco',
    createdBy: mockCreators[2],
    imageUrl: 'https://images.unsplash.com/photo-1534274867514-d5b47ef5b2bb?w=600&h=300&fit=crop',
    tags: ['weather', 'san-francisco', 'rain'],
    participantCount: 23,
    viewCount: 67,
    createdAt: getRandomPastDate(1),
    updatedAt: getRandomPastDate(1)
  },

  {
    id: 'market_6',
    title: 'Which AI company will be valued highest by end of 2024?',
    description: 'The AI race is heating up. Which company will come out on top in market valuation?',
    category: 'user_generated',
    outcomeType: 'multiple',
    options: createMultipleOptions(['OpenAI', 'Anthropic', 'Google DeepMind', 'Microsoft AI', 'Other']),
    minStake: 1,
    maxStake: 1000,
    totalPool: 5670,
    startTime: getRandomPastDate(5),
    endTime: new Date('2024-12-31'),
    status: 'active',
    resolutionCriteria: 'Based on latest reported valuations from credible financial sources',
    createdBy: mockCreators[1],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop',
    tags: ['ai', 'valuation', 'tech', 'startups'],
    participantCount: 234,
    viewCount: 890,
    createdAt: getRandomPastDate(7),
    updatedAt: getRandomPastDate(1)
  },

  // Draft market (user-created, not yet published)
  {
    id: 'market_7',
    title: 'Will my local coffee shop get a new menu this month?',
    description: "I've been going to Joe's Coffee for years. They've been hinting at menu changes...",
    category: 'user_generated',
    outcomeType: 'binary',
    options: createBinaryOptions(),
    minStake: 1,
    maxStake: 25,
    totalPool: 0,
    startTime: new Date(),
    endTime: getRandomFutureDate(30),
    status: 'draft',
    resolutionCriteria: 'Based on whether Joe\'s Coffee introduces any new menu items',
    createdBy: mockCreators[3],
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=300&fit=crop',
    tags: ['local', 'coffee', 'menu'],
    participantCount: 0,
    viewCount: 5,
    createdAt: getRandomPastDate(1),
    updatedAt: getRandomPastDate(1)
  },

  // Resolved market
  {
    id: 'market_8',
    title: 'Will the iPhone 15 have USB-C?',
    description: 'Apple has been under pressure to switch from Lightning to USB-C.',
    category: 'user_generated',
    outcomeType: 'binary',
    options: createBinaryOptions(),
    minStake: 1,
    maxStake: 500,
    totalPool: 12450,
    startTime: getRandomPastDate(90),
    endTime: getRandomPastDate(30),
    resolutionTime: getRandomPastDate(25),
    status: 'resolved',
    resolvedOutcome: 'Yes',
    resolutionCriteria: 'Based on official Apple announcement and product release',
    createdBy: mockCreators[2],
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=300&fit=crop',
    tags: ['apple', 'iphone', 'usb-c', 'technology'],
    participantCount: 567,
    viewCount: 2890,
    createdAt: getRandomPastDate(95),
    updatedAt: getRandomPastDate(25)
  }
];

// Get markets by category
export function getMarketsByCategory(category: MarketCategory): Market[] {
  return mockMarkets.filter(market => market.category === category);
}

// Get markets by status
export function getMarketsByStatus(status: MarketStatus): Market[] {
  return mockMarkets.filter(market => market.status === status);
}

// Get markets by creator
export function getMarketsByCreator(creatorId: string): Market[] {
  return mockMarkets.filter(market => market.createdBy?.id === creatorId);
}

// Get active markets (excluding drafts and resolved)
export function getActiveMarkets(): Market[] {
  return mockMarkets.filter(market => 
    market.status === 'active' || 
    market.status === 'pending_approval'
  );
}

// Get trending markets (high activity)
export function getTrendingMarkets(): Market[] {
  return mockMarkets
    .filter(market => market.status === 'active')
    .sort((a, b) => (b.participantCount + b.viewCount) - (a.participantCount + a.viewCount))
    .slice(0, 10);
}

// Search markets by title or description
export function searchMarkets(query: string): Market[] {
  const lowercaseQuery = query.toLowerCase();
  return mockMarkets.filter(market => 
    market.title.toLowerCase().includes(lowercaseQuery) ||
    market.description.toLowerCase().includes(lowercaseQuery) ||
    market.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// Get market by ID
export function getMarketById(id: string): Market | undefined {
  return mockMarkets.find(market => market.id === id);
}

// Simulate pagination
export function getPaginatedMarkets(
  page: number = 1, 
  limit: number = 10,
  filters?: {
    category?: MarketCategory;
    status?: MarketStatus;
    search?: string;
    createdBy?: string;
  }
) {
  let filteredMarkets = [...mockMarkets];

  // Apply filters
  if (filters?.category) {
    filteredMarkets = filteredMarkets.filter(m => m.category === filters.category);
  }
  if (filters?.status) {
    filteredMarkets = filteredMarkets.filter(m => m.status === filters.status);
  }
  if (filters?.search) {
    filteredMarkets = searchMarkets(filters.search);
  }
  if (filters?.createdBy) {
    filteredMarkets = filteredMarkets.filter(m => m.createdBy?.id === filters.createdBy);
  }

  // Sort by creation date (newest first)
  filteredMarkets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Paginate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMarkets = filteredMarkets.slice(startIndex, endIndex);

  return {
    markets: paginatedMarkets,
    totalCount: filteredMarkets.length,
    hasNextPage: endIndex < filteredMarkets.length,
    hasPrevPage: page > 1,
    currentPage: page,
    totalPages: Math.ceil(filteredMarkets.length / limit)
  };
} 