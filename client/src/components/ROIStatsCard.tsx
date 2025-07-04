import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ROIStatsCardProps {
  initialInvestment: number;
  roiPercent: number;
  className?: string;
}

const ROIStatsCard: React.FC<ROIStatsCardProps> = ({ 
  initialInvestment, 
  roiPercent,
  className = ""
}) => {
  const currentValue = initialInvestment * (1 + roiPercent / 100);
  const isPositive = roiPercent >= 0;

  return (
    <div className={`bg-gray-900 text-white rounded-2xl shadow-lg p-6 border border-white/10 ${className}`}>
      <div className="space-y-3">
        <div className="text-sm text-gray-400 font-medium">ROI</div>
        
        <div className="space-y-2">
          <div className={`text-2xl font-bold flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
              <ArrowUp className="w-5 h-5 mr-2" />
            ) : (
              <ArrowDown className="w-5 h-5 mr-2" />
            )}
            {isPositive ? '+' : ''}{roiPercent.toFixed(2)}%
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-gray-400">
              Initial Investment: <span className="text-white">${initialInvestment.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-400">
              Current Value: <span className="text-white">${currentValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 pt-2 border-t border-white/10">
          All time performance
        </div>
      </div>
    </div>
  );
};

export default ROIStatsCard;