'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import selfAssessmentService from '@/services/selfAssessmentService';
import competencyApi from '@/services/competencyApi';
import { 
  Save, TrendingUp, Award, Code, Users, History, ChevronDown, ChevronUp, 
  Eye, CheckCircle, Clock, AlertCircle, Send, Plus, Calendar, MessageSquare, 
  Star, BarChart3, Settings, Shield, Edit3, FileText
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, LineChart, Line 
} from 'recharts';
import jobDescriptionService from '@/services/jobDescriptionService';

const SelfAssessment = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreatePeriod, setShowCreatePeriod] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    name: '',
    start_date: '',
    end_date: '',
    submission_deadline: '',
    status: 'UPCOMING'
  });
  
  // State for data
  const [stats, setStats] = useState(null);
  const [myAssessments, setMyAssessments] = useState([]);
  const [teamAssessments, setTeamAssessments] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [skillGroups, setSkillGroups] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);
  const [userAccess, setUserAccess] = useState(null);
  const [allPeriods, setAllPeriods] = useState([]);
  
  // Ratings state: { skillId: { rating: 1-5, comment: '' } }
  const [ratings, setRatings] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
    checkForDraftAssessment(); // Check for existing draft
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [statsData, activePeriodData, accessData] = await Promise.all([
        selfAssessmentService.getAssessmentStats(),
        selfAssessmentService.getActivePeriod().catch(() => null),
        jobDescriptionService.getMyAccessInfo()
      ]);
      

      
      setStats(statsData);
      setActivePeriod(activePeriodData);
      setUserAccess(accessData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPeriods = async () => {
    try {
      const data = await selfAssessmentService.getAssessmentPeriods();
      setAllPeriods(data);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchMyAssessments = async () => {
    try {
      const data = await selfAssessmentService.getMyAssessments();
      setMyAssessments(data);
    } catch (error) {
      console.error('Error fetching my assessments:', error);
    }
  };

  const fetchTeamAssessments = async () => {
    try {
      const data = await selfAssessmentService.getTeamAssessments();
      setTeamAssessments(data);
    } catch (error) {
      console.error('Error fetching team assessments:', error);
    }
  };

  const fetchSkillGroups = async () => {
    try {
      const data = await competencyApi.skillGroups.getAll();
      const groupsData = data.results || [];
      
      const groupsWithSkills = await Promise.all(
        groupsData.map(async (group) => {
          try {
            const skills = await competencyApi.skillGroups.getSkills(group.id);
            return {
              ...group,
              skills: Array.isArray(skills) ? skills : []
            };
          } catch (error) {
            return { ...group, skills: [] };
          }
        })
      );
      
      setSkillGroups(groupsWithSkills);
    } catch (error) {
      console.error('Error fetching skill groups:', error);
      setSkillGroups([]);
    }
  };

  const handleStartAssessment = async () => {
    try {
      setSaving(true);
      const newAssessment = await selfAssessmentService.startAssessment();
     
      setCurrentAssessment(newAssessment);
      
      await fetchSkillGroups();
      
      if (newAssessment.skill_ratings && newAssessment.skill_ratings.length > 0) {
        const existingRatings = {};
        newAssessment.skill_ratings.forEach(rating => {
          existingRatings[rating.skill] = {
            rating: rating.rating,
            comment: rating.self_comment || ''
          };
        });
        setRatings(existingRatings);
      }
      
      setActiveTab('assessment');
    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Failed to start assessment. ' + (error.response?.data?.detail || 'Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  // Check if we have a draft assessment on load
  const checkForDraftAssessment = async () => {
    try {
      const assessments = await selfAssessmentService.getMyAssessments();
      
      // Check for active period first
      const activePeriodData = activePeriod || await selfAssessmentService.getActivePeriod().catch(() => null);
      
      if (!activePeriodData) {
        console.log('No active period found');
        return;
      }
      
      // Find assessment for active period
      const activeAssessment = assessments.find(a => a.period === activePeriodData.id);
      
      if (activeAssessment) {
        console.log('Found assessment for active period:', activeAssessment);
        
        // Load full assessment details for any status
        const fullAssessment = await selfAssessmentService.getAssessment(activeAssessment.id);
        setCurrentAssessment(fullAssessment);
        
        // If DRAFT, load existing ratings for editing
        if (fullAssessment.status === 'DRAFT') {
          if (fullAssessment.skill_ratings && fullAssessment.skill_ratings.length > 0) {
            const existingRatings = {};
            fullAssessment.skill_ratings.forEach(rating => {
              existingRatings[rating.skill] = {
                rating: rating.rating,
                comment: rating.self_comment || ''
              };
            });
            setRatings(existingRatings);
          }
          
          await fetchSkillGroups();
        }
      }
    } catch (error) {
      console.error('Error checking for draft:', error);
    }
  };

  const handleRatingChange = (skillId, rating) => {
    setRatings(prev => ({
      ...prev,
      [skillId]: {
        rating: rating,
        comment: prev[skillId]?.comment || ''
      }
    }));
  };

  const handleCommentChange = (skillId, comment) => {
    setRatings(prev => ({
      ...prev,
      [skillId]: {
        rating: prev[skillId]?.rating || 0,
        comment: comment
      }
    }));
  };

  const handleSaveAssessment = async () => {
    if (!currentAssessment) return;
    
    try {
      setSaving(true);
      const ratingsData = selfAssessmentService.formatRatingsForSubmit(ratings);
      await selfAssessmentService.bulkAddRatings(currentAssessment.id, ratingsData);
      
      const updated = await selfAssessmentService.getAssessment(currentAssessment.id);
      setCurrentAssessment(updated);
      
      showToast('Assessment saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving assessment:', error);
      showToast('Failed to save assessment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!currentAssessment) return;
    
    const totalSkills = skillGroups.reduce((sum, g) => sum + (g.skills?.length || 0), 0);
    const ratedSkills = Object.keys(ratings).length;
    
    if (totalSkills > 0 && ratedSkills < totalSkills) {
      const proceed = window.confirm(
        `You have rated ${ratedSkills} out of ${totalSkills} skills. Submit anyway?`
      );
      if (!proceed) return;
    }
    
    try {
      setSaving(true);
      await handleSaveAssessment();
      await selfAssessmentService.submitAssessment(currentAssessment.id);
      
      showToast('Assessment submitted successfully!', 'success');
      setActiveTab('overview');
      setCurrentAssessment(null);
      setRatings({});
      fetchInitialData();
      fetchMyAssessments();
    } catch (error) {
      console.error('Error submitting assessment:', error);
      showToast('Failed to submit assessment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleViewAssessment = async (assessmentId) => {
    try {
      const assessment = await selfAssessmentService.getAssessment(assessmentId);
      setSelectedAssessment(assessment);
    } catch (error) {
      console.error('Error fetching assessment:', error);
      showToast('Failed to load assessment', 'error');
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const showToast = (message, type = 'info') => {
    // Simple toast notification
    alert(message);
  };

  const handleCreatePeriod = async () => {
    try {
      if (!newPeriod.name || !newPeriod.start_date || !newPeriod.end_date || !newPeriod.submission_deadline) {
        showToast('Please fill all fields', 'error');
        return;
      }

      setSaving(true);
      await selfAssessmentService.createAssessmentPeriod(newPeriod);
      showToast('Period created successfully!', 'success');
      
      // Reset form
      setNewPeriod({
        name: '',
        start_date: '',
        end_date: '',
        submission_deadline: '',
        status: 'UPCOMING'
      });
      setShowCreatePeriod(false);
      
      // Refresh periods
      await fetchAllPeriods();
      await fetchInitialData();
    } catch (error) {
      console.error('Error creating period:', error);
      showToast('Failed to create period: ' + (error.response?.data?.detail || 'Please try again'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const RatingStars = ({ currentRating, onChange, disabled = false }) => {
    return (
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => !disabled && onChange(star)}
            disabled={disabled}
            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all transform hover:scale-110 ${
              star <= currentRating
                ? 'bg-gradient-to-br from-almet-sapphire to-almet-astral text-white shadow-md'
                : disabled 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-almet-mystic text-almet-waterloo hover:bg-almet-bali-hai hover:text-white'
            }`}
          >
            {star}
          </button>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700 border border-gray-300',
      SUBMITTED: 'bg-blue-50 text-almet-sapphire border border-almet-astral',
      REVIEWED: 'bg-green-50 text-green-700 border border-green-300'
    };
    const icons = {
      DRAFT: <Edit3 className="w-3 h-3" />,
      SUBMITTED: <Send className="w-3 h-3" />,
      REVIEWED: <CheckCircle className="w-3 h-3" />
    };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const getRadarData = (assessment) => {
    const groupedRatings = {};
    
    assessment.skill_ratings?.forEach(rating => {
      const groupName = rating.skill_group_name || 'Other';
      if (!groupedRatings[groupName]) {
        groupedRatings[groupName] = { total: 0, count: 0 };
      }
      groupedRatings[groupName].total += rating.rating;
      groupedRatings[groupName].count += 1;
    });
    
    return Object.entries(groupedRatings).map(([name, data]) => ({
      category: name,
      score: (data.total / data.count).toFixed(2),
      fullMark: 5
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-almet-mystic border-t-almet-sapphire mx-auto mb-4"></div>
            <p className="text-almet-waterloo font-medium">Loading Assessment System...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4  min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-almet-mystic">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-almet-cloud-burst">Core Skills Assessment</h1>
                  <p className="text-xs text-almet-waterloo mt-0.5">
                    Evaluate your technical skills and track progress over time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userAccess && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-almet-mystic rounded-lg">
                    <Shield className="w-3.5 h-3.5 text-almet-sapphire" />
                    <span className="text-xs font-medium text-almet-cloud-burst">
                      {userAccess.access_level}
                    </span>
                  </div>
                )}
                {userAccess?.is_admin && (
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      fetchAllPeriods();
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:shadow-lg transition-all text-sm"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span className="font-medium">Settings</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Period Banner */}
          {activePeriod && (
            <div className="bg-almet-steel-blue rounded-xl shadow-lg p-3 mb-4 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <div>
                      <h3 className="font-bold text-sm">{activePeriod.name}</h3>
                      <p className="text-xs opacity-90 mt-0.5">
                        Deadline: {new Date(activePeriod.submission_deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{activePeriod.days_remaining}</div>
                    <div className="text-xs opacity-90">days remaining</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-almet-sapphire hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-almet-mystic flex items-center justify-center">
                    <Award className="w-4 h-4 text-almet-sapphire" />
                  </div>
                  <span className="text-xs font-semibold text-almet-waterloo uppercase">My Assessments</span>
                </div>
                <div className='flex gap-4 items-center'>

                <div className="text-2xl font-bold text-almet-cloud-burst">{stats.my_assessments_count}</div>
                <p className="text-xs text-almet-waterloo mt-0.5">Total completed</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-almet-astral hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-almet-astral" />
                  </div>
                  <span className="text-xs font-semibold text-almet-waterloo uppercase">My Avg Score</span>
                </div>
                <div className='flex gap-4 items-center'>

                <div className="text-2xl font-bold text-almet-astral">{stats.my_average_score.toFixed(1)}</div>
                <p className="text-xs text-almet-waterloo mt-0.5">Out of 5.0</p>
                </div>
              </div>

              {(userAccess?.is_manager || userAccess?.is_admin) && (
                <>
                  <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-xs font-semibold text-almet-waterloo uppercase">Team</span>
                    </div>
                    <div className='flex gap-4 items-center'>

                    <div className="text-2xl font-bold text-green-600">{stats.team_assessments_count || 0}</div>
                    <p className="text-xs text-almet-waterloo mt-0.5">Team assessments</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-xs font-semibold text-almet-waterloo uppercase">Pending</span>
                    </div>
                    <div className='flex gap-4 items-center'>

                    <div className="text-2xl font-bold text-orange-600">{stats.pending_reviews || 0}</div>
                    <p className="text-xs text-almet-waterloo mt-0.5">Awaiting review</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md mb-4 overflow-hidden">
            <div className="flex border-b border-almet-mystic">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-4 py-3 font-semibold transition-all text-sm ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-b from-almet-sapphire/10 to-transparent border-b-3 border-almet-sapphire text-almet-sapphire'
                    : 'text-almet-waterloo hover:bg-almet-mystic/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab('assessment')}
                className={`flex-1 px-4 py-3 font-semibold transition-all text-sm ${
                  activeTab === 'assessment'
                    ? 'bg-gradient-to-b from-almet-sapphire/10 to-transparent border-b-3 border-almet-sapphire text-almet-sapphire'
                    : 'text-almet-waterloo hover:bg-almet-mystic/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Code className="w-4 h-4" />
                  Assessment
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('history');
                  fetchMyAssessments();
                }}
                className={`flex-1 px-4 py-3 font-semibold transition-all text-sm ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-b from-almet-sapphire/10 to-transparent border-b-3 border-almet-sapphire text-almet-sapphire'
                    : 'text-almet-waterloo hover:bg-almet-mystic/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <History className="w-4 h-4" />
                  My History
                </div>
              </button>
              {(userAccess?.is_manager || userAccess?.is_admin) && (
                <button
                  onClick={() => {
                    setActiveTab('team');
                    fetchTeamAssessments();
                  }}
                  className={`flex-1 px-4 py-3 font-semibold transition-all text-sm ${
                    activeTab === 'team'
                      ? 'bg-gradient-to-b from-almet-sapphire/10 to-transparent border-b-3 border-almet-sapphire text-almet-sapphire'
                      : 'text-almet-waterloo hover:bg-almet-mystic/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    Team
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Tab Content - Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-base font-bold text-almet-cloud-burst mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-almet-sapphire" />
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentAssessment && currentAssessment.status === 'DRAFT' ? (
                    <button
                      onClick={async () => {
                        await fetchSkillGroups();
                        setActiveTab('assessment');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      Continue Draft Assessment
                    </button>
                  ) : currentAssessment && (currentAssessment.status === 'SUBMITTED' || currentAssessment.status === 'REVIEWED') ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed">
                      <CheckCircle className="w-4 h-4" />
                      Assessment Already Submitted for Active Period
                    </div>
                  ) : (
                    <button
                      onClick={handleStartAssessment}
                      disabled={!activePeriod || saving}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      {saving ? 'Loading...' : 'Start New Assessment'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActiveTab('history');
                      fetchMyAssessments();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-almet-mystic text-almet-cloud-burst rounded-lg hover:bg-almet-bali-hai hover:text-white transition-all text-sm font-medium"
                  >
                    <History className="w-4 h-4" />
                    View History
                  </button>
                </div>
                {!activePeriod && (
                  <div className="flex items-center gap-2 mt-3 p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <p className="text-xs text-orange-700 font-medium">
                      No active assessment period available
                    </p>
                  </div>
                )}
              </div>

              {/* Current Period Assessment Status */}
              {activePeriod && currentAssessment && (
                <div className="bg-white rounded-xl shadow-md p-4">
                  <h3 className="text-base font-bold text-almet-cloud-burst mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-almet-sapphire" />
                    Current Period Assessment
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-almet-mystic/50 to-transparent rounded-lg">
                    <div>
                      <p className="font-semibold text-almet-cloud-burst text-sm">
                        {activePeriod.name}
                      </p>
                      <p className="text-xs text-almet-waterloo mt-1">
                        {currentAssessment.submitted_at 
                          ? `Submitted: ${new Date(currentAssessment.submitted_at).toLocaleDateString()}`
                          : 'Draft - In Progress'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-almet-sapphire">
                          {currentAssessment.overall_score || 'N/A'}
                        </div>
                        <p className="text-xs text-almet-waterloo">Score</p>
                      </div>
                      {getStatusBadge(currentAssessment.status)}
                    </div>
                  </div>
                </div>
              )}

              {/* Last Assessment Summary */}
              {stats?.my_last_assessment && (!currentAssessment || currentAssessment.period !== stats.my_last_assessment.period) && (
                <div className="bg-white rounded-xl shadow-md p-4">
                  <h3 className="text-base font-bold text-almet-cloud-burst mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-almet-sapphire" />
                    Last Assessment
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-almet-mystic/50 to-transparent rounded-lg">
                    <div>
                      <p className="font-semibold text-almet-cloud-burst text-sm">
                        {stats.my_last_assessment.period_name}
                      </p>
                      <p className="text-xs text-almet-waterloo mt-1">
                        {stats.my_last_assessment.submitted_at 
                          ? `Submitted: ${new Date(stats.my_last_assessment.submitted_at).toLocaleDateString()}`
                          : 'Draft'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-almet-sapphire">
                          {stats.my_last_assessment.overall_score || 'N/A'}
                        </div>
                        <p className="text-xs text-almet-waterloo">Score</p>
                      </div>
                      {getStatusBadge(stats.my_last_assessment.status)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content - Assessment */}
          {activeTab === 'assessment' && (
            <div className="space-y-4">
              {!currentAssessment ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-almet-mystic flex items-center justify-center mx-auto mb-6">
                    <Code className="w-10 h-10 text-almet-sapphire" />
                  </div>
                  <h3 className="text-xl font-bold text-almet-cloud-burst mb-3">No Active Assessment</h3>
                  <p className="text-almet-waterloo mb-6">
                    Start a new assessment to rate your skills for the current period
                  </p>
                  <button
                    onClick={handleStartAssessment}
                    disabled={!activePeriod || saving}
                    className="px-6 py-3 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Start Assessment
                  </button>
                </div>
              ) : currentAssessment.status === 'SUBMITTED' || currentAssessment.status === 'REVIEWED' ? (
                // Show submitted assessment details
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-almet-mystic">
                    <div>
                      <h3 className="text-xl font-bold text-almet-cloud-burst">Assessment Submitted</h3>
                      <p className="text-sm text-almet-waterloo mt-1">
                        Submitted: {currentAssessment.submitted_at 
                          ? new Date(currentAssessment.submitted_at).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-almet-sapphire">
                          {currentAssessment.overall_score || 'N/A'}
                        </div>
                        <p className="text-xs text-almet-waterloo">Overall Score</p>
                      </div>
                      {getStatusBadge(currentAssessment.status)}
                    </div>
                  </div>

                  {/* Skill Ratings Display */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-almet-cloud-burst flex items-center gap-2">
                      <Award className="w-5 h-5 text-almet-sapphire" />
                      Your Skill Ratings
                    </h4>
                    
                    {currentAssessment.skill_ratings && currentAssessment.skill_ratings.length > 0 ? (
                      <div className="space-y-3">
                        {currentAssessment.skill_ratings.map(rating => (
                          <div key={rating.id} className="border border-almet-mystic rounded-lg p-4 bg-gradient-to-r from-almet-mystic/10 to-transparent">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-almet-cloud-burst text-sm">
                                {rating.skill_info?.name || 'Skill'}
                              </span>
                              <div className="flex items-center gap-3">
                                <RatingStars currentRating={rating.rating} disabled={true} />
                                <span className="text-xs font-medium text-almet-waterloo">({rating.rating_level})</span>
                              </div>
                            </div>
                            {rating.self_comment && (
                              <div className="mt-2 text-xs text-almet-cloud-burst bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                                <span className="font-semibold">Your Comment:</span>
                                <p className="mt-1">{rating.self_comment}</p>
                              </div>
                            )}
                            {rating.manager_comment && (
                              <div className="mt-2 text-xs text-almet-cloud-burst bg-green-50 p-2.5 rounded-lg border border-green-200">
                                <span className="font-semibold">Manager Feedback:</span>
                                <p className="mt-1">{rating.manager_comment}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-almet-waterloo">No skill ratings found</p>
                    )}
                  </div>

                  {/* Manager Comments */}
                  {currentAssessment.manager_comments && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-200">
                      <h4 className="font-bold text-almet-cloud-burst mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        Manager Overall Comments
                      </h4>
                      <p className="text-sm text-almet-cloud-burst">{currentAssessment.manager_comments}</p>
                      {currentAssessment.manager_reviewed_at && (
                        <p className="text-xs text-almet-waterloo mt-2">
                          Reviewed on {new Date(currentAssessment.manager_reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Assessment Progress */}
                  <div className="bg-white rounded-xl shadow-md p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-almet-cloud-burst">Assessment Progress</span>
                      <span className="text-sm text-almet-waterloo">
                        {Object.keys(ratings).length} / {
                          skillGroups.reduce((sum, g) => sum + (g.skills?.length || 0), 0)
                        } skills rated
                      </span>
                    </div>
                    <div className="w-full bg-almet-mystic rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-almet-sapphire to-almet-astral transition-all duration-500"
                        style={{
                          width: `${
                            skillGroups.length > 0
                              ? (Object.keys(ratings).length / skillGroups.reduce((sum, g) => sum + (g.skills?.length || 0), 1)) * 100
                              : 0
                          }%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Skill Groups */}
                  {skillGroups.length > 0 ? (
                    skillGroups.map((group) => {
                      const isExpanded = expandedGroups[group.id];
                      return (
                        <div key={group.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className="w-full p-5 flex items-center justify-between hover:bg-almet-mystic/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center">
                                <Code className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <h2 className="font-bold text-almet-cloud-burst">{group.name}</h2>
                                <span className="text-xs text-almet-waterloo">{group.skills?.length || 0} skills</span>
                              </div>
                            </div>
                            {isExpanded ? 
                              <ChevronUp className="w-5 h-5 text-almet-waterloo" /> : 
                              <ChevronDown className="w-5 h-5 text-almet-waterloo" />
                            }
                          </button>
                          
                          {isExpanded && (
                            <div className="px-5 pb-5 space-y-4 bg-gradient-to-b from-almet-mystic/20 to-transparent">
                              {group.skills?.map(skill => (
                                <div key={skill.id} className="p-4 bg-white rounded-lg border border-almet-mystic shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-almet-cloud-burst">{skill.name}</span>
                                    <RatingStars
                                      currentRating={ratings[skill.id]?.rating || 0}
                                      onChange={(rating) => handleRatingChange(skill.id, rating)}
                                    />
                                  </div>
                                  <textarea
                                    value={ratings[skill.id]?.comment || ''}
                                    onChange={(e) => handleCommentChange(skill.id, e.target.value)}
                                    placeholder="Add your reflection on this skill (optional)"
                                    className="w-full text-sm p-3 border border-almet-mystic rounded-lg focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none"
                                    rows={2}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                      <p className="text-almet-waterloo">No skill groups available</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="sticky bottom-4 flex justify-end gap-3 p-3 bg-white rounded-xl shadow-lg border border-almet-mystic">
                    <button
                      onClick={handleSaveAssessment}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 text-sm bg-almet-mystic text-almet-cloud-burst rounded-lg hover:bg-almet-bali-hai hover:text-white transition-all font-medium disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                      onClick={handleSubmitAssessment}
                      disabled={saving || Object.keys(ratings).length === 0}
                      className="flex items-center gap-2 px-6 py-2 text-sm bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:shadow-xl transition-all font-medium disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {saving ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab Content - History */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-almet-cloud-burst mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-almet-sapphire" />
                Assessment History
              </h3>
              {myAssessments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-almet-mystic flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-almet-waterloo" />
                  </div>
                  <p className="text-almet-waterloo">No assessments found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-almet-mystic/30 to-transparent rounded-lg hover:shadow-md transition-all border border-almet-mystic"
                    >
                      <div>
                        <p className="font-semibold text-almet-cloud-burst">{assessment.period_name}</p>
                        <p className="text-sm text-almet-waterloo mt-1">
                          {assessment.submitted_at 
                            ? `Submitted: ${new Date(assessment.submitted_at).toLocaleDateString()}`
                            : 'Draft'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-almet-sapphire">
                            {assessment.overall_score || 'N/A'}
                          </p>
                          <p className="text-xs text-almet-waterloo">Score</p>
                        </div>
                        {getStatusBadge(assessment.status)}
                        <button
                          onClick={() => handleViewAssessment(assessment.id)}
                          className="p-2 text-almet-sapphire hover:bg-almet-sapphire hover:text-white rounded-lg transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content - Team */}
          {activeTab === 'team' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-almet-cloud-burst mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-almet-sapphire" />
                Team Assessments
              </h3>
              {teamAssessments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-almet-mystic flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-almet-waterloo" />
                  </div>
                  <p className="text-almet-waterloo">No team assessments found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-almet-mystic/30 to-transparent rounded-lg hover:shadow-md transition-all border border-almet-mystic"
                    >
                      <div>
                        <p className="font-semibold text-almet-cloud-burst">{assessment.employee_name}</p>
                        <p className="text-sm text-almet-waterloo">{assessment.period_name}</p>
                        <p className="text-xs text-almet-waterloo mt-1">
                          {assessment.submitted_at 
                            ? `Submitted: ${new Date(assessment.submitted_at).toLocaleDateString()}`
                            : 'Draft'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-almet-sapphire">
                            {assessment.overall_score || 'N/A'}
                          </p>
                          <p className="text-xs text-almet-waterloo">Score</p>
                        </div>
                        {getStatusBadge(assessment.status)}
                        <button
                          onClick={() => handleViewAssessment(assessment.id)}
                          className="p-2 text-almet-sapphire hover:bg-almet-sapphire hover:text-white rounded-lg transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assessment Detail Modal */}
          {selectedAssessment && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-almet-mystic flex items-center justify-between bg-gradient-to-r from-almet-mystic/50 to-transparent sticky top-0 bg-white z-10">
                  <div>
                    <h3 className="text-xl font-bold text-almet-cloud-burst">
                      {selectedAssessment.employee_name}
                    </h3>
                    <p className="text-sm text-almet-waterloo">{selectedAssessment.employee_position}</p>
                    <p className="text-sm font-medium text-almet-sapphire mt-1">
                      {selectedAssessment.period_info?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAssessment(null)}
                    className="text-almet-waterloo hover:text-almet-cloud-burst hover:bg-almet-mystic rounded-lg p-2 transition-all"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                  {/* Overall Score */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-almet-sapphire/20 to-almet-astral/20 border-4 border-almet-sapphire/30 mb-4">
                      <span className="text-5xl font-bold text-almet-sapphire">
                        {selectedAssessment.overall_score || 'N/A'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-almet-cloud-burst">Overall Score</h3>
                    <p className="text-sm text-almet-waterloo">Out of 5.0</p>
                    <div className="mt-3">
                      {getStatusBadge(selectedAssessment.status)}
                    </div>
                  </div>

                  {/* Radar Chart */}
                  {selectedAssessment.skill_ratings?.length > 0 && (
                    <div className="mb-8 p-6 bg-gradient-to-br from-almet-mystic/30 to-transparent rounded-xl">
                      <h4 className="font-bold text-almet-cloud-burst mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-almet-sapphire" />
                        Skills Overview
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={getRadarData(selectedAssessment)}>
                          <PolarGrid stroke="#e7ebf1" />
                          <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#7a829a' }} />
                          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: '#7a829a' }} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#30539b"
                            fill="#30539b"
                            fillOpacity={0.6}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Skill Ratings */}
                  <div>
                    <h4 className="font-bold text-almet-cloud-burst mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-almet-sapphire" />
                      Skill Ratings
                    </h4>
                    <div className="space-y-4">
                      {selectedAssessment.skill_ratings?.map(rating => (
                        <div key={rating.id} className="border border-almet-mystic rounded-xl p-4 bg-gradient-to-r from-almet-mystic/10 to-transparent">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-almet-cloud-burst">
                              {rating.skill_info?.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <RatingStars currentRating={rating.rating} disabled={true} />
                              <span className="text-sm font-medium text-almet-waterloo">({rating.rating_level})</span>
                            </div>
                          </div>
                          {rating.self_comment && (
                            <div className="mt-3 text-sm text-almet-cloud-burst bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <span className="font-semibold flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Self Comment:
                              </span>
                              <p className="mt-1">{rating.self_comment}</p>
                            </div>
                          )}
                          {rating.manager_comment && (
                            <div className="mt-3 text-sm text-almet-cloud-burst bg-green-50 p-3 rounded-lg border border-green-200">
                              <span className="font-semibold flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Manager Feedback:
                              </span>
                              <p className="mt-1">{rating.manager_comment}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manager Comments */}
                  {selectedAssessment.manager_comments && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-200">
                      <h4 className="font-bold text-almet-cloud-burst mb-2 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        Manager Overall Comments
                      </h4>
                      <p className="text-sm text-almet-cloud-burst">{selectedAssessment.manager_comments}</p>
                      <p className="text-xs text-almet-waterloo mt-2">
                        - {selectedAssessment.manager_name} on {new Date(selectedAssessment.manager_reviewed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-almet-mystic bg-gradient-to-b from-transparent to-almet-mystic/20">
                  <button
                    onClick={() => setSelectedAssessment(null)}
                    className="w-full px-6 py-3 bg-gradient-to-r text-xs from-almet-sapphire to-almet-astral text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Modal - Admin Only */}
          {showSettings && userAccess?.is_admin && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="px-4 py-2 border-b border-almet-mystic flex items-center justify-between bg-gradient-to-r text-almet-sapphire ">
                  <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6" />
                    <h3 className="text-xl font-bold ">Assessment Period Settings</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      setShowCreatePeriod(false);
                    }}
                    className="hover:bg-white/20 rounded-lg p-2 transition-all"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                  {!showCreatePeriod ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-almet-cloud-burst text-lg">Assessment Periods</h4>
                        <button
                          onClick={() => setShowCreatePeriod(true)}
                          className="flex text-xs items-center gap-2 px-4 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:shadow-lg transition-all font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Create New Period
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {allPeriods.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="w-8 h-8 text-almet-waterloo mx-auto mb-4" />
                            <p className="text-almet-waterloo">No periods found. Create your first period!</p>
                          </div>
                        ) : (
                          allPeriods.map(period => (
                            <div key={period.id} className="p-4 border border-almet-mystic rounded-xl flex items-center justify-between hover:shadow-md transition-all bg-gradient-to-r from-almet-mystic/20 to-transparent">
                              <div className="flex-1">
                                <p className="font-semibold text-almet-cloud-burst text-lg">{period.name}</p>
                                <p className="text-sm text-almet-waterloo mt-1">
                                  {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-almet-waterloo mt-1">
                                  Deadline: {new Date(period.submission_deadline).toLocaleDateString()}
                                </p>
                          
                              </div>
                              <div className="flex items-center gap-2">
                                {period.is_active ? (
                                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Active
                                  </span>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await selfAssessmentService.activatePeriod(period.id);
                                        fetchAllPeriods();
                                        fetchInitialData();
                                        showToast('Period activated successfully', 'success');
                                      } catch (error) {
                                        showToast('Failed to activate period', 'error');
                                      }
                                    }}
                                    className="px-4 py-2 bg-almet-sapphire text-white rounded-lg text-sm font-medium hover:bg-almet-astral transition-all"
                                  >
                                    Activate
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <button
                          onClick={() => setShowCreatePeriod(false)}
                          className="p-2 hover:bg-almet-mystic rounded-lg transition-all"
                        >
                          <ChevronDown className="w-5 h-5 rotate-90 text-almet-sapphire" />
                        </button>
                        <h4 className="font-bold text-almet-cloud-burst text-lg">Create New Assessment Period</h4>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-almet-cloud-burst mb-2">
                            Period Name *
                          </label>
                          <input
                            type="text"
                            value={newPeriod.name}
                            onChange={(e) => setNewPeriod({...newPeriod, name: e.target.value})}
                            placeholder="e.g., H1 2025, Q1 2025"
                            className="w-full px-4 py-2 text-xs border border-almet-mystic rounded-lg focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-almet-cloud-burst mb-2">
                              Start Date *
                            </label>
                            <input
                              type="date"
                              value={newPeriod.start_date}
                              onChange={(e) => setNewPeriod({...newPeriod, start_date: e.target.value})}
                              className="w-full px-4 py-2 text-xs border border-almet-mystic rounded-lg focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-almet-cloud-burst mb-2">
                              End Date *
                            </label>
                            <input
                              type="date"
                              value={newPeriod.end_date}
                              onChange={(e) => setNewPeriod({...newPeriod, end_date: e.target.value})}
                              className="w-full px-4 py-2 text-xs border border-almet-mystic rounded-lg focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-almet-cloud-burst mb-2">
                              Submission Deadline *
                            </label>
                            <input
                              type="date"
                              value={newPeriod.submission_deadline}
                              onChange={(e) => setNewPeriod({...newPeriod, submission_deadline: e.target.value})}
                              className="w-full px-4 py-2 text-xs border border-almet-mystic rounded-lg focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
                            />
                          </div>
                        </div>

              
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => {
                            setShowCreatePeriod(false);
                            setNewPeriod({
                              name: '',
                              start_date: '',
                              end_date: '',
                              submission_deadline: '',
                              status: 'UPCOMING'
                            });
                          }}
                          className="flex-1 px-6 py-1.5 text-xs bg-almet-mystic text-almet-cloud-burst rounded-lg hover:bg-almet-bali-hai hover:text-white transition-all font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreatePeriod}
                          disabled={saving}
                          className="flex-1 px-6 py-1.5 text-xs bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
                        >
                          {saving ? 'Creating...' : 'Create Period'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-almet-mystic">
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      setShowCreatePeriod(false);
                    }}
                    className="w-full px-6 py-3 text-xs bg-almet-mystic text-almet-cloud-burst rounded-lg hover:bg-almet-bali-hai hover:text-white transition-all font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SelfAssessment;