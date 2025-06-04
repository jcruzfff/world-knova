'use client';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const StatCard = ({ label, value, change, changeType = 'neutral' }: StatCardProps) => {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500'
  }[changeType];

  return (
    <div className="flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 min-w-[140px]">
      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1">
        {value}
      </div>
      {change && (
        <div className={`text-xs font-medium mt-1 ${changeColor}`}>
          {change}
        </div>
      )}
    </div>
  );
};

export const MarketStats = () => {
  // Mock data - will be replaced with real data from API
  const stats = [
    {
      label: 'Total Volume',
      value: '124K WLD',
      change: '+12.5%',
      changeType: 'positive' as const
    },
    {
      label: 'Active Markets',
      value: '43',
      change: '+3 today',
      changeType: 'positive' as const
    },
    {
      label: 'Total Traders',
      value: '2.1K',
      change: '+156',
      changeType: 'positive' as const
    },
    {
      label: 'Avg ROI',
      value: '18.3%',
      change: '+2.1%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Platform Overview</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}; 