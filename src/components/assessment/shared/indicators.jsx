'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const GapIndicator = ({ gap }) => {
  if (gap > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <TrendingUp size={12} />
        +{gap}
      </span>
    );
  } else if (gap < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <TrendingDown size={12} />
        {gap}
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <Minus size={12} />
        0
      </span>
    );
  }
};

export const CompletionIndicator = ({ percentage }) => {
  const numPercentage = parseFloat(percentage) || 0;
  let colorClass = 'bg-red-50 text-red-700 border-red-200';

  if (numPercentage >= 100) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (numPercentage >= 80) {
    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (numPercentage >= 60) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${colorClass}`}>
      {numPercentage.toFixed(0)}%
    </span>
  );
};
