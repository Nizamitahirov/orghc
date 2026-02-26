import { useState, useEffect } from "react";
import { Award, ChevronDown, ChevronRight, Save, Send, TrendingUp, TrendingDown, Minus, Loader } from "lucide-react";

export default function CompetenciesSection({
  competencies = [],
  settings,
  currentPeriod,
  canEdit,
  loading,
  darkMode,
  onUpdate,
  performanceData,
  onSaveDraft,
  onSubmit,
}) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [groupScores, setGroupScores] = useState({});
  const [overallScore, setOverallScore] = useState({
    totalRequired: 0,
    totalActual: 0,
    percentage: 0,
    grade: "N/A",
  });

  const isLeadershipAssessment = competencies.length > 0 && competencies[0].main_group_name;

  useEffect(() => {
    if (competencies && competencies.length > 0) {
      const groupNames = new Set();
      
      competencies.forEach((c) => {
        const g = isLeadershipAssessment 
          ? (c.main_group_name || "Ungrouped")
          : (c.competency_group_name || "Ungrouped");
        groupNames.add(g);
      });

      setExpandedGroups((prev) => {
        const next = { ...prev };
        let hasChanges = false;

        groupNames.forEach((groupName) => {
          if (next[groupName] === undefined) {
            next[groupName] = false;
            hasChanges = true;
          }
        });

        return hasChanges ? next : prev;
      });
    }
  }, [competencies.length, isLeadershipAssessment]);

  useEffect(() => {
    if (competencies && competencies.length > 0) {
      calculateAllScores();
    }
  }, [competencies, settings.evaluationScale]);

  const calculateAllScores = () => {
    const groupedData = {};
    let totalRequiredSum = 0;
    let totalActualSum = 0;

    competencies.forEach((comp) => {
      const groupName = isLeadershipAssessment
        ? (comp.main_group_name || "Ungrouped")
        : (comp.competency_group_name || "Ungrouped");
        
      if (!groupedData[groupName]) {
        groupedData[groupName] = {
          requiredTotal: 0,
          actualTotal: 0,
          count: 0,
        };
      }
      const required = parseFloat(comp.required_level) || 0;
      const actual = parseFloat(comp.end_year_rating_value) || 0;

      groupedData[groupName].requiredTotal += required;
      groupedData[groupName].actualTotal += actual;
      groupedData[groupName].count += 1;

      totalRequiredSum += required;
      totalActualSum += actual;
    });

    const getLetterGradeFromScale = (percentage) => {
      if (!settings.evaluationScale || settings.evaluationScale.length === 0) {
        return "N/A";
      }
      const match = settings.evaluationScale.find(
        (s) => percentage >= s.range_min && percentage <= s.range_max
      );
      return match ? match.name : "N/A";
    };

    const calculated = {};
    Object.entries(groupedData).forEach(([groupName, data]) => {
      const percentage =
        data.requiredTotal > 0
          ? (data.actualTotal / data.requiredTotal) * 100
          : 0;
      calculated[groupName] = {
        requiredTotal: data.requiredTotal,
        actualTotal: data.actualTotal,
        count: data.count,
        percentage: percentage.toFixed(1),
        grade: getLetterGradeFromScale(percentage),
      };
    });

    const overallPercentage =
      totalRequiredSum > 0
        ? (totalActualSum / totalRequiredSum) * 100
        : 0;

    setGroupScores(calculated);
    setOverallScore({
      totalRequired: totalRequiredSum,
      totalActual: totalActualSum,
      percentage: overallPercentage.toFixed(1),
      grade: getLetterGradeFromScale(overallPercentage),
    });
  };

  const getGradeColor = (grade) => {
    if (!settings.evaluationScale || settings.evaluationScale.length === 0)
      return "text-almet-waterloo";

    const item = settings.evaluationScale.find((s) => s.name === grade);
    if (!item) return "text-almet-waterloo";

    const sorted = [...settings.evaluationScale].sort(
      (a, b) => b.value - a.value
    );
    const gradeIndex = sorted.findIndex((s) => s.name === grade);
    const total = sorted.length;

    if (gradeIndex === 0) return "text-emerald-600 dark:text-emerald-400";
    if (gradeIndex === 1 && total > 2) return "text-blue-600 dark:text-blue-400";
    if (gradeIndex < total / 2) return "text-amber-600 dark:text-amber-400";
    if (gradeIndex < total * 0.75) return "text-orange-600 dark:text-orange-400";
    if (gradeIndex < total - 1) return "text-purple-600 dark:text-purple-400";
    return "text-red-600 dark:text-red-400";
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const getGapIcon = (gap) => {
    if (gap > 0) return TrendingUp;
    if (gap < 0) return TrendingDown;
    return Minus;
  };

  const getGapColor = (gap) => {
    if (gap > 0) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
    if (gap < 0) return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    return "text-almet-waterloo bg-almet-mystic dark:bg-almet-comet/30";
  };

  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return Number.isNaN(num) ? "0" : num.toFixed(decimals);
  };

  const groupedCompetencies = (competencies || []).reduce((acc, comp) => {
    const groupName = isLeadershipAssessment
      ? (comp.main_group_name || "Ungrouped")
      : (comp.competency_group_name || "Ungrouped");
    
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(comp);
    return acc;
  }, {});

  if (!Array.isArray(competencies)) {
    return (
      <div className={`rounded-xl border shadow-sm p-4 ${darkMode ? 'bg-almet-cloud-burst/60 border-almet-comet/30' : 'bg-white border-almet-mystic'}`}>
        <div className="text-center text-red-600">
          Error: Invalid competencies data
        </div>
      </div>
    );
  }

  const isEndYearPeriod = currentPeriod === 'END_YEAR_REVIEW';
  const canRateEndYear = canEdit && isEndYearPeriod;

  const inputClass = `h-10 px-3 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 transition-all ${
    darkMode 
      ? 'bg-almet-san-juan/30 border-almet-comet/30 text-white placeholder-almet-bali-hai/50' 
      : 'bg-white border-almet-bali-hai/20 text-almet-cloud-burst placeholder-almet-waterloo/50'
  } disabled:opacity-40`;

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-almet-cloud-burst/60 border-almet-comet/30' : 'bg-white border-almet-mystic'}`}>
      <div className={`p-5 border-b ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 dark:bg-purple-500/20">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                {isLeadershipAssessment
                  ? "Leadership Competencies Assessment"
                  : "Behavioral Competencies Assessment"
                }
              </h3>
              <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mt-0.5 flex items-center gap-2`}>
                {isEndYearPeriod ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    ⚠️ End Year Period - Ratings can be added
                  </span>
                ) : (
                  <span>
                    Evaluate competencies based on required levels • {competencies.length} total
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className={`px-4 py-3 rounded-xl ${darkMode ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
            <div className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1`}>
              Overall Score
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {overallScore.totalActual}/{overallScore.totalRequired}
              </span>
              <span className={`text-sm font-semibold ${getGradeColor(overallScore.grade)}`}>
                {overallScore.percentage}% • {overallScore.grade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(groupedCompetencies).length === 0 ? (
        <div className="text-center py-16">
          <Award className="w-16 h-16 mx-auto mb-4 text-almet-waterloo/30" />
          <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai font-medium">
            No competencies configured
          </p>
          <p className="text-xs text-almet-waterloo/60 dark:text-almet-bali-hai/60 mt-1">
            Competencies will appear here once they are assigned
          </p>
        </div>
      ) : (
        <div className={darkMode ? "divide-y divide-almet-comet/20" : "divide-y divide-almet-mystic"}>
          {Object.entries(groupedCompetencies).map(([groupName, groupComps]) => {
            const isExpanded = expandedGroups[groupName];
            const groupScore = groupScores[groupName];

            return (
              <div key={groupName}>
                <button
                  type="button"
                  onClick={() => toggleGroup(groupName)}
                  className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
                    darkMode ? 'hover:bg-almet-san-juan/20' : 'hover:bg-almet-mystic/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-almet-waterloo" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-almet-waterloo" />
                    )}
                    <h4 className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {groupName}
                    </h4>
                    <span className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                      ({groupComps.length} competencies)
                    </span>
                  </div>

                  {groupScore && (
                    <div className="text-right">
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                        {groupScore.actualTotal}/{groupScore.requiredTotal}
                      </p>
                      <p className={`text-xs font-semibold ${getGradeColor(groupScore.grade)}`}>
                        {groupScore.percentage}% • {groupScore.grade}
                      </p>
                    </div>
                  )}
                </button>

                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={darkMode ? "bg-almet-san-juan/30" : "bg-almet-mystic/50"}>
                        <tr className="text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai uppercase tracking-wide">
                          <th className="px-4 py-3 text-left w-12">#</th>
                          <th className="px-4 py-3 text-left min-w-[200px]">
                            {isLeadershipAssessment ? 'Leadership Item' : 'Competency'}
                          </th>
                          {isLeadershipAssessment && (
                            <th className="px-4 py-3 text-left min-w-[150px]">Child Group</th>
                          )}
                          <th className="px-4 py-3 text-center w-24">Required</th>
                          <th className="px-4 py-3 text-center w-36">End Year Rating</th>
                          <th className="px-4 py-3 text-center w-24">Actual</th>
                          <th className="px-4 py-3 text-center w-24">Gap</th>
                          <th className="px-4 py-3 text-left min-w-[220px]">Notes</th>
                        </tr>
                      </thead>
                      <tbody className={darkMode ? "divide-y divide-almet-comet/20" : "divide-y divide-almet-mystic"}>
                        {groupComps.map((comp, idx) => {
                          const globalIndex = competencies.findIndex((c) => c.id === comp.id);
                          const required = parseFloat(comp.required_level) || 0;
                          const actual = parseFloat(comp.end_year_rating_value) || 0;
                          const gap = actual - required;
                          const GapIcon = getGapIcon(gap);
                          const gapColor = getGapColor(gap);

                          return (
                            <tr
                              key={comp.id || idx}
                              className={`${darkMode ? 'hover:bg-almet-san-juan/20' : 'hover:bg-almet-mystic/30'} transition-colors`}
                            >
                              <td className="px-4 py-3">
                                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                  <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                                    {comp.competency_name}
                                  </span>
                                  {comp.description && (
                                    <span className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                                      {comp.description}
                                    </span>
                                  )}
                                </div>
                              </td>
                              {isLeadershipAssessment && (
                                <td className="px-4 py-3">
                                  <span className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                                    {comp.child_group_name || 'N/A'}
                                  </span>
                                </td>
                              )}
                              <td className="px-4 py-3 text-center">
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                                  {formatNumber(required, 1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <select
                                  key={`comp-rating-${comp.id}`}
                                  value={comp.end_year_rating || ""}
                                  disabled={!canRateEndYear}
                                  onChange={(e) => {
                                    onUpdate(globalIndex, "end_year_rating", e.target.value);
                                  }}
                                  className={`${inputClass} w-full`}
                                >
                                  <option value="">Select...</option>
                                  {settings.evaluationScale?.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {`${s.name} (${s.value})`}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                                  {formatNumber(actual, 1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${gapColor}`}>
                                  <GapIcon className="w-3.5 h-3.5" />
                                  <span>{formatNumber(gap, 1)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <textarea
                                  key={`comp-notes-${comp.id}`}
                                  rows={2}
                                  value={comp.notes || ""}
                                  disabled={!canEdit}
                                  onChange={(e) => {
                                    onUpdate(globalIndex, "notes", e.target.value);
                                  }}
                                  className={`${inputClass} w-full resize-none py-2`}
                                  placeholder="Comments, examples..."
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {competencies.length > 0 && canEdit && (
        <div className={`p-5 border-t flex gap-3 ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'}`}>
          <button
            type="button"
            onClick={() => onSaveDraft(competencies)}
            disabled={loading}
            className={`h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
              darkMode 
                ? 'bg-almet-comet/50 hover:bg-almet-comet text-white' 
                : 'bg-almet-waterloo/10 hover:bg-almet-waterloo/20 text-almet-cloud-burst'
            } disabled:opacity-40`}
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </button>
          
          <button
            type="button"
            onClick={() => onSubmit(competencies)}
            disabled={loading || !canRateEndYear}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-40 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
            Submit
          </button>
          
          {!canRateEndYear && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs ${
              darkMode 
                ? 'bg-amber-900/20 text-amber-400 border border-amber-800/30' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span>⚠️ Ratings can only be submitted during End Year Review period</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}