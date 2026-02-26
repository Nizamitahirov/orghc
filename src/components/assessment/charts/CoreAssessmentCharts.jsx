import React, { useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import ChartContainer from './ChartContainer';

const CoreAssessmentCharts = ({ assessment }) => {
  // Radar data for skill groups
  const radarData = useMemo(() => {
    if (!assessment?.group_scores) return [];
    return Object.entries(assessment.group_scores).map(([group, scores]) => ({
      group: group.length > 15 ? group.substring(0, 15) + '...' : group,
      actual: Number(scores.employee_total) || 0,
      required: Number(scores.position_total) || 0,
      completion: Number(scores.completion_percentage) || 0,
    }));
  }, [assessment]);

  // Gap data for bar + line
  const gapData = useMemo(() => {
    if (!assessment?.group_scores) return [];
    return Object.entries(assessment.group_scores).map(([group, scores]) => {
      const gap = Number(scores.gap) || 0;
      return {
        name: group.length > 12 ? group.substring(0, 12) + '...' : group,
        gap,
        positive: gap > 0 ? gap : 0,
        negative: gap < 0 ? Math.abs(gap) : 0,
      };
    });
  }, [assessment]);

  const totalGap = Number(assessment?.gap_score) || 0;
  const avgCompletion = Number(assessment?.completion_percentage) || 0;
  const totalSkills = assessment?.competency_ratings?.length || 0;

  const renderGapTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
        <div className="font-semibold text-gray-900 mb-1">{label}</div>
        <div className="space-y-0.5">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Total gap:</span>
            <span className={`font-semibold ${data.gap >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {data.gap > 0 ? '+' : ''}{data.gap}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Positive gap:</span>
            <span className="font-medium text-emerald-600">{data.positive}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Negative gap:</span>
            <span className="font-medium text-red-500">{data.negative}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Small stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <div className="text-gray-500">Total skills</div>
          <div className="text-sm font-semibold text-gray-900">{totalSkills}</div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <div className="text-gray-500">Average completion</div>
          <div className="text-sm font-semibold text-emerald-600">
            {avgCompletion.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <div className="text-gray-500">Overall gap</div>
          <div className={`text-sm font-semibold ${totalGap >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalGap > 0 ? '+' : ''}{totalGap}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart - Skill Groups Performance */}
        <ChartContainer title="Skill Groups Performance" icon={Activity}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="group"
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 'auto']}
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <Radar
                name="Required"
                dataKey="required"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.25}
              />
              <Radar
                name="Actual"
                dataKey="actual"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value, name) => [value, name]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Bar + Line Chart - Gap Analysis */}
        <ChartContainer title="Skill Gap Analysis" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={gapData}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                type="number"
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <Tooltip content={renderGapTooltip} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="positive"
                stackId="gap"
                fill="#10b981"
                name="Positive gap"
                barSize={18}
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="negative"
                stackId="gap"
                fill="#ef4444"
                name="Negative gap"
                barSize={18}
                radius={[0, 4, 4, 0]}
              />
              {/* Net gap trend line */}
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
      </div>
    </div>
  );
};

export default CoreAssessmentCharts;
