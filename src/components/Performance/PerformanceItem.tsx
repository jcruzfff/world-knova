'use client';
import { useRouter } from 'next/navigation';

interface PerformanceItemProps {
  type: 'prediction' | 'market';
  title: string;
  subtitle: string;
  amount: string;
  result: string;
  resultColor: string;
  status: string;
  date: string;
  marketId?: string;
}

export const PerformanceItem = ({
  type,
  title,
  subtitle,
  amount,
  result,
  resultColor,
  status,
  date,
  marketId
}: PerformanceItemProps) => {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleClick = () => {
    if (type === 'market' && marketId) {
      router.push(`/market/${marketId}`);
    }
    // For predictions, we might want to navigate to the market they predicted on
  };

  const getStatusIcon = () => {
    if (type === 'prediction') {
      switch (status) {
        case 'won':
          return '✅';
        case 'lost':
          return '❌';
        case 'refunded':
          return '↩️';
        case 'active':
        default:
          return '⏳';
      }
    } else {
      switch (status) {
        case 'active':
          return '🟢';
        case 'resolved':
          return '✅';
        case 'cancelled':
          return '❌';
        case 'pending_approval':
          return '⏳';
        case 'draft':
          return '📝';
        default:
          return '⚪';
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-[#1d283b] rounded-lg p-4 border border-[#373a46] transition-all duration-200 ${
        type === 'market' && marketId ? 'hover:border-[#e9ff74] cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{getStatusIcon()}</span>
            <h3 className="text-white font-medium font-['Outfit'] truncate">
              {title}
            </h3>
          </div>
          
          <p className="text-[#a0a0a0] text-sm mb-2 font-['Outfit']">
            {subtitle}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-[#a0a0a0]">
            <span>Stake: {amount}</span>
            <span>•</span>
            <span>{formatDate(date)}</span>
          </div>
        </div>

        {/* Right side - Result */}
        <div className="text-right ml-4">
          <div className={`font-semibold font-['Outfit'] ${resultColor}`}>
            {result}
          </div>
          {type === 'prediction' && status === 'active' && (
            <div className="text-xs text-[#a0a0a0] mt-1">
              In Progress
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 