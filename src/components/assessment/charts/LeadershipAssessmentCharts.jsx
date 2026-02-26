import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Target, Activity } from 'lucide-react';
import ChartContainer from './ChartContainer';

const LeadershipAssessmentCharts = ({ assessment }) => {
  // Main Group Performance
  const mainGroupData = useMemo(() => {
    if (!assessment?.main_group_scores_display) return [];
    return Object.entries(assessment.main_group_scores_display).map(([name, scores]) => ({
      name: name.length > 12 ? name.substring(0, 12) + '...' : name,
      position: Number(scores.position_total) || 0,
      employee: Number(scores.employee_total) || 0,
      percentage: Number(scores.percentage) || 0,
      grade: scores.letter_grade,
    }));
  }, [assessment]);

  // Child Group Performance
  const childGroupData = useMemo(() => {
    if (!assessment?.child_group_scores_display) return [];
    return Object.entries(assessment.child_group_scores_display).map(([name, scores]) => ({
      name: name.length > 10 ? name.substring(0, 10) + '...' : name,
      percentage: Number(scores.percentage) || 0,
      grade: scores.letter_grade,
    }));
  }, [assessment]);

  const getGradeColor = grade => {
    switch (grade) {
      case 'A': return '#10b981';
      case 'B': return '#3b82f6';
      case 'C': return '#f59e0b';
      case 'D': return '#f97316';
      case 'E': return '#a855f7';
      case 'F': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderMainTooltip = ({ active, payload, label }) => {
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
              {data.percentage.toFixed ? data.percentage.toFixed(1) : data.percentage}%
              {data.grade ? ` (${data.grade})` : ''}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderChildTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
        <div className="font-semibold text-gray-900 mb-1">{label}</div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Score:</span>
          <span className="font-semibold text-gray-900">
            {data.percentage.toFixed ? data.percentage.toFixed(1) : data.percentage}% ({data.grade})
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {/* Main Groups: Bars + percentage trend line */}
        <ChartContainer title="Main Group Performance" icon={Target}>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={mainGroupData}
              margin={{ top: 8, right: 24, bottom: 40, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />
              <Tooltip content={renderMainTooltip} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                yAxisId="left"
                dataKey="position"
                fill="#3b82f6"
                name="Required"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Bar
                yAxisId="left"
                dataKey="employee"
                fill="#10b981"
                name="Actual"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              {/* Trend line for percentage score */}
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

export default LeadershipAssessmentCharts;
