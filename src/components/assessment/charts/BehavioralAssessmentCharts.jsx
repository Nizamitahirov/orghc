import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, Target } from 'lucide-react';
import ChartContainer from './ChartContainer';

const BehavioralAssessmentCharts = ({ assessment }) => {
  // Group Performance Data
  const groupPerformance = useMemo(() => {
    if (!assessment?.group_scores) return [];
    return Object.entries(assessment.group_scores).map(([name, scores]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      position: Number(scores.position_total) || 0,
      employee: Number(scores.employee_total) || 0,
      percentage: Number(scores.percentage) || 0,
      grade: scores.letter_grade,
    }));
  }, [assessment]);

  // Individual Competencies with Gap
  const competencyGaps = useMemo(() => {
    if (!assessment?.competency_ratings) return [];
    return assessment.competency_ratings.slice(0, 10).map(rating => ({
      name: rating.competency_name?.substring(0, 20) || 'Unknown',
      gap: (Number(rating.actual_level) || 0) - (Number(rating.required_level) || 0),
      required: Number(rating.required_level) || 0,
      actual: Number(rating.actual_level) || 0,
    }));
  }, [assessment]);

  const renderGroupTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
        <div className="font-semibold text-gray-900 mb-1">{label}</div>
        <div className="space-y-0.5">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Required:</span>
            <span className="font-medium text-blue-600">{data.position}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Actual:</span>
            <span className="font-medium text-emerald-600">{data.employee}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Score %:</span>
            <span className="font-semibold text-purple-600">
              {data.percentage?.toFixed ? data.percentage.toFixed(1) : data.percentage}%
              {data.grade ? ` (${data.grade})` : ''}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderGapTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
        <div className="font-semibold text-gray-900 mb-1">{label}</div>
        <div className="space-y-0.5">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Required level:</span>
            <span className="font-medium text-gray-800">{data.required}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Actual level:</span>
            <span className="font-medium text-gray-800">{data.actual}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Gap:</span>
            <span className={`font-semibold ${data.gap >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {data.gap > 0 ? '+' : ''}{data.gap}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Group Performance with trend line */}
        <ChartContainer title="Competency Group Performance" icon={Target}>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={groupPerformance}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
              <defs>
                <linearGradient id="behavioralGroupGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <Tooltip content={renderGroupTooltip} />
              <Bar
                dataKey="percentage"
                barSize={18}
                fill="url(#behavioralGroupGradient)"
                radius={[0, 4, 4, 0]}
              />
              {/* Trend line over bars */}
             <Line
  type="monotone"
  dataKey="percentage"
  stroke="#9333ea"
  strokeWidth={2}
  strokeDasharray="5 5"
  dot={{ r: 4, strokeWidth: 2, stroke: '#9333ea', fill: '#fff' }}
  isAnimationActive={true}
  animationDuration={700}
/>

            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Competency Gap Analysis with trend line */}
        <ChartContainer title="Top 10 Competency Gaps" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={competencyGaps}
              margin={{ top: 8, right: 16, bottom: 32, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 9 }}
                angle={-30}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip content={renderGapTooltip} />
              <Bar dataKey="gap" barSize={18} radius={[4, 4, 0, 0]}>
                {competencyGaps.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.gap >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
              {/* Line following same gap values to show increase/decrease visually */}
              <Line
                type="monotone"
                dataKey="gap"
                stroke="#4b5563"
                strokeWidth={1.5}
                dot={{ r: 2 }}
                isAnimationActive={true}
                animationDuration={700}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default BehavioralAssessmentCharts;
