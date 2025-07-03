# Knova: Prisma to Supabase Migration Plan

## Executive Summary

This document outlines the systematic migration of Knova from Prisma ORM to Supabase for unified data and storage management. The migration addresses current type inconsistencies, eliminates mock data dependencies, and establishes a production-ready data architecture.

## Current Architecture Analysis

### ✅ What's Working Well

- Strong TypeScript foundation in `src/types/market.ts`
- Comprehensive Prisma schema with proper relationships
- Supabase storage already integrated for file uploads
- Clean separation between UI components and data layer

### ❌ Critical Issues Identified

#### 1. **Type Inconsistencies**

```typescript
// Current Market TypeScript interface vs Prisma schema mismatch:

// TypeScript (market.ts)
interface Market {
  options: MarketOption[];           // Structured array
  customCategory?: string;           // Not in Prisma
  subtitle?: string | null;          // Computed field
  recentParticipants?: UserProfile[]; // Computed field
  rules?: string[] | null;           // Not in Prisma
}

// Prisma Schema
model Market {
  outcomes Json              // Raw JSON, not structured
  // Missing: customCategory, subtitle, recentParticipants, rules
}
```

#### 2. **Data Source Confusion**

- API routes (`/api/markets`) use Prisma for some markets
- Components use mock data from `src/lib/mockData.ts`
- No single source of truth for market data

#### 3. **Field Name Inconsistencies**

- Prisma uses `outcomes` (JSON), TypeScript uses `options` (structured)
- Prisma uses `snake_case` field mapping, TypeScript uses `camelCase`
- Some computed fields mixed with database fields

#### 4. **Missing Database Features**

- No Prisma equivalent for some TypeScript types (CreatorStats, MarketAnalytics)
- Auth models exist in Prisma but not used consistently
- File upload tracking exists but not integrated

## Migration Strategy

### Phase 1: Clean Types Foundation (Week 1)

#### 1.1 Reorganize Type Definitions

```bash
src/types/
├── index.ts           # Main exports
├── user.types.ts      # User system types
├── market.types.ts    # Market system types
├── prediction.types.ts # Prediction & transaction types
├── api.types.ts       # API request/response types
├── ui.types.ts        # Component & state types
└── database.types.ts  # Database schema types
```

#### 1.2 Create Supabase Schema Types

```typescript
// Generate from Supabase CLI
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts

// Or define manually to match Prisma schema
export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: CreateUserRequest; Update: UpdateUserRequest };
      markets: { Row: Market; Insert: CreateMarketRequest; Update: UpdateMarketRequest };
      // ... other tables
    };
  };
}
```

#### 1.3 Unify Market Types

```typescript
// New unified Market interface
export interface Market {
  // Core fields (match Supabase exactly)
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  outcome_type: OutcomeType; // Match DB field name
  options: MarketOption[]; // JSON field, properly typed
  min_stake: number; // Match DB field name
  max_stake: number | null;
  total_pool: number;
  start_time: Date; // Match DB field name
  end_time: Date;
  resolution_time: Date | null;
  status: MarketStatus;
  resolved_outcome: string | null;
  resolution_criteria: string;
  created_by: string | null;
  oracle_source: string | null;
  oracle_id: string | null;
  image_url: string | null;
  tags: string[];
  participant_count: number;
  view_count: number;
  created_at: Date;
  updated_at: Date;

  // Computed fields (not in DB)
  creator?: UserProfile | null;
  recent_participants?: UserProfile[];
}
```

### Phase 2: Supabase Database Setup (Week 1-2)

#### 2.1 Create Supabase Project & Tables

```sql
-- Create all tables matching Prisma schema
-- Enable Row Level Security (RLS)
-- Set up proper indexes and foreign keys

-- Example: Markets table
CREATE TABLE markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  outcome_type text NOT NULL,
  options jsonb NOT NULL,
  min_stake numeric NOT NULL DEFAULT 1.0,
  max_stake numeric,
  total_pool numeric NOT NULL DEFAULT 0.0,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  resolution_time timestamptz,
  status text NOT NULL DEFAULT 'active',
  resolved_outcome text,
  resolution_criteria text NOT NULL,
  created_by uuid REFERENCES users(id),
  oracle_source text,
  oracle_id text,
  image_url text,
  tags text[] DEFAULT '{}',
  participant_count integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 2.2 Set Up Row Level Security

```sql
-- Enable RLS
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- Policy examples
CREATE POLICY "Markets are viewable by everyone" ON markets
  FOR SELECT USING (true);

CREATE POLICY "Users can create markets" ON markets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own markets" ON markets
  FOR UPDATE USING (auth.uid() = created_by);
```

#### 2.3 Create Database Functions

```sql
-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Phase 3: Data Access Layer (Week 2)

#### 3.1 Create Supabase Client Service

```typescript
// src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Type-safe table access
export const marketsTable = () => supabase.from("markets");
export const usersTable = () => supabase.from("users");
export const predictionsTable = () => supabase.from("predictions");
```

#### 3.2 Create Service Layer

```typescript
// src/lib/supabase/services/markets.service.ts
import { marketsTable } from "../client";
import { Market, CreateMarketRequest, MarketFilters } from "@/types";

export class MarketsService {
  static async getMarkets(filters?: MarketFilters): Promise<Market[]> {
    let query = marketsTable().select(`
      *,
      creator:users(id, username, display_name, profile_picture_url)
    `);

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data as Market[];
  }

  static async createMarket(
    market: CreateMarketRequest,
    userId: string
  ): Promise<Market> {
    const { data, error } = await marketsTable()
      .insert({
        title: market.title,
        description: market.description,
        category: market.category,
        outcome_type: "binary",
        options: market.options,
        end_time: market.endDate.toISOString(),
        resolution_criteria: market.resolutionCriteria,
        created_by: userId,
        tags: market.tags || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data as Market;
  }
}
```

### Phase 4: API Route Migration (Week 2-3)

#### 4.1 Replace Prisma with Supabase in API Routes

```typescript
// Before: src/app/api/markets/route.ts
import { prisma } from "@/lib/prisma";

export async function GET() {
  const markets = await prisma.market.findMany({
    include: { creator: true },
  });
  // ...
}

// After:
import { MarketsService } from "@/lib/supabase/services/markets.service";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const filters = {
      category: url.searchParams.get("category"),
      status: url.searchParams.get("status"),
      // ...
    };

    const markets = await MarketsService.getMarkets(filters);

    return NextResponse.json({
      success: true,
      data: markets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

#### 4.2 Update All API Endpoints

- `/api/markets` - List and create markets
- `/api/markets/[id]` - Get, update, delete market
- `/api/profile` - User profile management
- `/api/predictions` - Prediction management
- `/api/upload/image` - File upload (already using Supabase)

### Phase 5: Frontend Integration (Week 3)

#### 5.1 Update React Hooks

```typescript
// Before: Using mock data
import { mockMarkets } from "@/lib/mockData";

// After: Using Supabase service
import { MarketsService } from "@/lib/supabase/services/markets.service";

export function useMarkets(filters?: MarketFilters) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true);
        const data = await MarketsService.getMarkets(filters);
        setMarkets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
  }, [filters]);

  return { markets, loading, error };
}
```

#### 5.2 Update Components

- Remove mock data dependencies
- Update type imports to use new unified types
- Ensure proper error handling and loading states

### Phase 6: Data Migration (Week 3-4)

#### 6.1 Export Existing Data

```typescript
// Migration script: scripts/export-prisma-data.ts
import { prisma } from "../src/lib/prisma";
import fs from "fs";

async function exportData() {
  const users = await prisma.user.findMany();
  const markets = await prisma.market.findMany();
  const predictions = await prisma.prediction.findMany();

  fs.writeFileSync(
    "data-export.json",
    JSON.stringify(
      {
        users,
        markets,
        predictions,
      },
      null,
      2
    )
  );
}

exportData();
```

#### 6.2 Import to Supabase

```typescript
// Migration script: scripts/import-to-supabase.ts
import { supabase } from "../src/lib/supabase/client";
import dataExport from "./data-export.json";

async function importData() {
  // Transform and import users
  for (const user of dataExport.users) {
    const transformedUser = {
      id: user.id,
      email: user.email,
      wallet_address: user.walletAddress,
      username: user.username,
      display_name: user.displayName,
      // ... transform other fields
    };

    await supabase.from("users").insert(transformedUser);
  }

  // Transform and import markets
  for (const market of dataExport.markets) {
    const transformedMarket = {
      id: market.id,
      title: market.title,
      description: market.description,
      category: market.category,
      outcome_type: market.outcomeType,
      options: market.outcomes, // Transform JSON structure
      // ... transform other fields
    };

    await supabase.from("markets").insert(transformedMarket);
  }
}

importData();
```

### Phase 7: Cleanup & Testing (Week 4)

#### 7.1 Remove Prisma Dependencies

```bash
# Remove Prisma packages
npm uninstall prisma @prisma/client @auth/prisma-adapter

# Remove Prisma files
rm -rf prisma/
rm -rf src/generated/
rm src/lib/prisma.ts

# Update package.json scripts
# Remove: "db:generate", "db:push", "db:studio"
```

#### 7.2 Update Environment Variables

```bash
# Remove from .env
DATABASE_URL=

# Add to .env (if not already present)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

#### 7.3 Comprehensive Testing

- Unit tests for service layer
- Integration tests for API routes
- End-to-end tests for critical user flows
- Performance testing with real data

## Risk Mitigation

### Data Loss Prevention

- Full database backup before migration
- Parallel running of both systems during transition
- Rollback plan with Prisma restoration

### Performance Considerations

- Proper indexing on Supabase tables
- Query optimization for complex joins
- Caching strategy for frequently accessed data

### Type Safety Maintenance

- Strict TypeScript configuration
- Automated type generation from Supabase schema
- Pre-commit hooks for type checking

## Success Metrics

- ✅ Zero type errors across codebase
- ✅ All mock data replaced with real Supabase data
- ✅ API response times < 200ms for market listings
- ✅ No data loss during migration
- ✅ All existing functionality preserved
- ✅ Unified data and file storage through Supabase

## Timeline

**Week 1**: Types cleanup + Supabase setup
**Week 2**: Service layer + API migration
**Week 3**: Frontend integration + testing
**Week 4**: Data migration + cleanup

**Total Duration**: 4 weeks
**Risk Buffer**: +1 week for unexpected issues

## Next Steps

1. **Immediate**: Review and approve this migration plan
2. **Week 1 Day 1**: Start with types reorganization
3. **Week 1 Day 3**: Set up Supabase database schema
4. **Week 2 Day 1**: Begin API route migration
5. **Week 3 Day 1**: Update frontend components
6. **Week 4 Day 1**: Execute data migration

This systematic approach ensures zero downtime, maintains data integrity, and results in a clean, type-safe, production-ready architecture.
