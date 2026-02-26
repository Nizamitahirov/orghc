// components/jobDescription/JobResponsibilitiesTab.jsx - WITH Dynamic Leadership/Behavioral Competencies + FORCE RE-RENDER FIX
import React, { useState, useEffect } from 'react';
import { Plus, X, Award, Users } from 'lucide-react';
import HierarchicalMultiSelect from '../common/HierarchicalMultiSelect';

const JobResponsibilitiesTab = ({
  formData,

  dropdownData,
  validationErrors,
  onFormDataChange,

  darkMode
}) => {
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // 🔥 NEW: Determine if position is leadership
  const [isLeadershipPosition, setIsLeadershipPosition] = useState(false);
  
  // State for hierarchical data
  const [skillGroupsHierarchical, setSkillGroupsHierarchical] = useState([]);
  const [behavioralGroupsHierarchical, setBehavioralGroupsHierarchical] = useState([]);
  const [leadershipGroupsHierarchical, setLeadershipGroupsHierarchical] = useState([]);
  
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isLoadingCompetencies, setIsLoadingCompetencies] = useState(false);
  const [isLoadingLeadership, setIsLoadingLeadership] = useState(false);

  // 🔥 Edit mode detection
  const [isEditMode, setIsEditMode] = useState(false);

  // 🔥 Force re-render keys
  const [skillsComponentKey, setSkillsComponentKey] = useState(0);
  const [behavioralComponentKey, setBehavioralComponentKey] = useState(0);
  const [leadershipComponentKey, setLeadershipComponentKey] = useState(0);

  // 🔥 Leadership position keywords
  const LEADERSHIP_POSITIONS = [
    'manager',
    'vice chairman',
    'director',
    'vice president',
    'hod',
    'head of department',
    'chief',
    'ceo',
    'cfo',
    'cto',
    'coo',
    'executive',
    'president',
    'chairman'
  ];

  // 🔥 Edit mode detection
  useEffect(() => {
    const hasSkills = formData.required_skills_data?.length > 0;
    const hasBehavioral = formData.behavioral_competencies_data?.length > 0;
    const hasLeadership = formData.leadership_competencies_data?.length > 0;
    
    setIsEditMode(hasSkills || hasBehavioral || hasLeadership);
    
    console.log('🔍 Edit mode detection:', {
      hasSkills,
      hasBehavioral,
      hasLeadership,
      isEditMode: hasSkills || hasBehavioral || hasLeadership
    });
  }, [formData.required_skills_data, formData.behavioral_competencies_data, formData.leadership_competencies_data]);

  // 🔥 Check if position is leadership based on position_group
  useEffect(() => {
    const checkLeadershipPosition = () => {
      if (!formData.position_group) {
        setIsLeadershipPosition(false);
        return;
      }

      const positionLower = formData.position_group.toLowerCase().trim();
      const isLeadership = LEADERSHIP_POSITIONS.some(keyword => 
        positionLower.includes(keyword)
      );

      setIsLeadershipPosition(isLeadership);
    };

    checkLeadershipPosition();
  }, [formData.position_group]);

  // Load skills in hierarchical format
  useEffect(() => {
    const loadSkillsHierarchical = async () => {
      if (!dropdownData.skillGroups?.length) return;
      
      setIsLoadingSkills(true);
      try {
        const competencyApi = (await import('@/services/competencyApi')).default;
        
        const hierarchicalData = await Promise.all(
          dropdownData.skillGroups.map(async (group) => {
            try {
              const response = await competencyApi.skillGroups.getSkills(group.id);
              const skills = Array.isArray(response) ? response : (response.skills || response.results || []);
              
              return {
                id: String(group.id),
                name: group.name || group.display_name || `Group ${group.id}`,
                description: group.description || `${skills.length} skills available`,
                items: skills.map(skill => ({
                  id: String(skill.id),
                  name: skill.name,
                  description: skill.description || '',
                  full_path: skill.full_path || ''
                }))
              };
            } catch (error) {
              console.error(`Error loading skills for group ${group.id}:`, error);
              return {
                id: String(group.id),
                name: group.name || group.display_name || `Group ${group.id}`,
                description: 'Error loading skills',
                items: []
              };
            }
          })
        );
        
        setSkillGroupsHierarchical(hierarchicalData);
      } catch (error) {
        console.error('Error loading skill groups:', error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    loadSkillsHierarchical();
  }, [dropdownData.skillGroups]);

  // 🔥 Load BEHAVIORAL competencies (for non-leadership)
  useEffect(() => {
    if (isLeadershipPosition) {
      setBehavioralGroupsHierarchical([]);
      return;
    }

    const loadCompetenciesHierarchical = async () => {
      if (!dropdownData.behavioralGroups?.length) return;
      
      setIsLoadingCompetencies(true);
      try {
        const competencyApi = (await import('@/services/competencyApi')).default;
        
        const hierarchicalData = await Promise.all(
          dropdownData.behavioralGroups.map(async (group) => {
            try {
              const response = await competencyApi.behavioralGroups.getCompetencies(group.id);
              const competencies = Array.isArray(response) ? response : (response.competencies || response.results || []);
              
              return {
                id: String(group.id),
                name: group.name || group.display_name || `Group ${group.id}`,
                description: group.description || `${competencies.length} competencies available`,
                items: competencies.map(comp => ({
                  id: String(comp.id),
                  name: comp.name,
                  description: comp.description || '',
                  full_path: comp.full_path || ''
                }))
              };
            } catch (error) {
              console.error(`Error loading competencies for group ${group.id}:`, error);
              return {
                id: String(group.id),
                name: group.name || group.display_name || `Group ${group.id}`,
                description: 'Error loading competencies',
                items: []
              };
            }
          })
        );
        
        setBehavioralGroupsHierarchical(hierarchicalData);
      } catch (error) {
        console.error('Error loading behavioral groups:', error);
      } finally {
        setIsLoadingCompetencies(false);
      }
    };

    loadCompetenciesHierarchical();
  }, [dropdownData.behavioralGroups, isLeadershipPosition]);

  // 🔥 Load LEADERSHIP competencies (for leadership positions) - 3 LEVELS
  useEffect(() => {
    if (!isLeadershipPosition) {
      setLeadershipGroupsHierarchical([]);
      return;
    }

    const loadLeadershipHierarchical = async () => {
      if (!dropdownData.leadershipMainGroups?.length) {
        console.warn('⚠️ No leadership main groups available in dropdownData');
        return;
      }
      
      setIsLoadingLeadership(true);
      try {
        const competencyApi = (await import('@/services/competencyApi')).default;
        
        const hierarchicalData = await Promise.all(
          dropdownData.leadershipMainGroups.map(async (mainGroup) => {
            try {
              const childGroupsResponse = await competencyApi.leadershipMainGroups.getChildGroups(mainGroup.id);
              const childGroups = Array.isArray(childGroupsResponse) 
                ? childGroupsResponse 
                : (childGroupsResponse.child_groups || childGroupsResponse.results || []);
              
              const childGroupsWithItems = await Promise.all(
                childGroups.map(async (childGroup) => {
                  try {
                    const itemsResponse = await competencyApi.leadershipChildGroups.getItems(childGroup.id);
                    const items = Array.isArray(itemsResponse) 
                      ? itemsResponse 
                      : (itemsResponse.items || itemsResponse.results || []);
                    
                    return {
                      id: String(childGroup.id),
                      name: childGroup.name || `Child Group ${childGroup.id}`,
                      description: childGroup.description || `${items.length} items`,
                      items: items.map(item => ({
                        id: String(item.id),
                        name: item.name || item.title,
                        description: item.description || '',
                        full_path: `${mainGroup.name} > ${childGroup.name} > ${item.name}`
                      }))
                    };
                  } catch (error) {
                    console.error(`Error loading items for child group ${childGroup.id}:`, error);
                    return {
                      id: String(childGroup.id),
                      name: childGroup.name || `Child Group ${childGroup.id}`,
                      description: 'Error loading items',
                      items: []
                    };
                  }
                })
              );
              
              return {
                id: String(mainGroup.id),
                name: mainGroup.name || `Main Group ${mainGroup.id}`,
                description: mainGroup.description || `${childGroupsWithItems.length} categories`,
                items: childGroupsWithItems
              };
              
            } catch (error) {
              console.error(`Error loading child groups for main group ${mainGroup.id}:`, error);
              return {
                id: String(mainGroup.id),
                name: mainGroup.name || `Main Group ${mainGroup.id}`,
                description: 'Error loading leadership data',
                items: []
              };
            }
          })
        );
        
        setLeadershipGroupsHierarchical(hierarchicalData);
        
      } catch (error) {
        console.error('❌ Error loading leadership groups:', error);
      } finally {
        setIsLoadingLeadership(false);
      }
    };

    loadLeadershipHierarchical();
  }, [dropdownData.leadershipMainGroups, isLeadershipPosition]);

  // 🔥 FORCE RE-RENDER: Skills component when data is ready in edit mode
  useEffect(() => {
    if (isEditMode && skillGroupsHierarchical.length > 0 && formData.required_skills_data?.length > 0) {
      console.log('🔄 Forcing re-render of skills component');
      setSkillsComponentKey(prev => prev + 1);
    }
  }, [skillGroupsHierarchical.length, isEditMode]);

  // 🔥 FORCE RE-RENDER: Behavioral component when data is ready in edit mode
  useEffect(() => {
    if (isEditMode && behavioralGroupsHierarchical.length > 0 && formData.behavioral_competencies_data?.length > 0) {
      console.log('🔄 Forcing re-render of behavioral component');
      setBehavioralComponentKey(prev => prev + 1);
    }
  }, [behavioralGroupsHierarchical.length, isEditMode]);

  // 🔥 FORCE RE-RENDER: Leadership component when data is ready in edit mode
  useEffect(() => {
    if (isEditMode && isLeadershipPosition && leadershipGroupsHierarchical.length > 0 && formData.leadership_competencies_data?.length > 0) {
      console.log('🔄 Forcing re-render of leadership component');
      setLeadershipComponentKey(prev => prev + 1);
    }
  }, [leadershipGroupsHierarchical.length, isEditMode, isLeadershipPosition]);

  // 🔥 Log hierarchical data when loaded
  useEffect(() => {
    if (isEditMode && skillGroupsHierarchical.length > 0) {
      console.log('✅ Skills hierarchical data loaded:', {
        groupCount: skillGroupsHierarchical.length,
        selectedIds: formData.required_skills_data,
        firstGroup: skillGroupsHierarchical[0]
      });
    }
  }, [skillGroupsHierarchical, isEditMode]);

  useEffect(() => {
    if (isEditMode && behavioralGroupsHierarchical.length > 0) {
      console.log('✅ Behavioral hierarchical data loaded:', {
        groupCount: behavioralGroupsHierarchical.length,
        selectedIds: formData.behavioral_competencies_data,
        firstGroup: behavioralGroupsHierarchical[0]
      });
    }
  }, [behavioralGroupsHierarchical, isEditMode]);

  useEffect(() => {
    if (isEditMode && leadershipGroupsHierarchical.length > 0) {
      console.log('✅ Leadership hierarchical data loaded:', {
        groupCount: leadershipGroupsHierarchical.length,
        selectedIds: formData.leadership_competencies_data,
        firstGroup: leadershipGroupsHierarchical[0]
      });
    }
  }, [leadershipGroupsHierarchical, isEditMode]);

  // Handle array field changes
  const handleArrayFieldChange = (fieldName, index, value) => {
    onFormDataChange(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (fieldName) => {
    onFormDataChange(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  };

  const removeArrayItem = (fieldName, index) => {
    if (formData[fieldName].length > 1) {
      onFormDataChange(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSkillsChange = (selectedIds) => {
    onFormDataChange(prev => ({
      ...prev,
      required_skills_data: selectedIds
    }));
  };

  // 🔥 Handle competency changes (behavioral OR leadership)
  const handleCompetenciesChange = (selectedIds) => {
    if (isLeadershipPosition) {
      onFormDataChange(prev => ({
        ...prev,
        leadership_competencies_data: selectedIds,
        behavioral_competencies_data: []
      }));
    } else {
      onFormDataChange(prev => ({
        ...prev,
        behavioral_competencies_data: selectedIds,
        leadership_competencies_data: []
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Sections */}
      {[
        { fieldName: 'criticalDuties', title: 'Critical Duties', required: true },
        { fieldName: 'positionMainKpis', title: 'Position Main KPIs', required: true },
        { fieldName: 'jobDuties', title: 'Job Duties', required: true },
        { fieldName: 'requirements', title: 'Requirements', required: true }
      ].map(({ fieldName, title, required }) => (
        <div key={fieldName}>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {title} {required && <span className="text-red-500">*</span>}
          </label>
          {formData[fieldName].map((item, index) => (
            <div key={index} className="flex items-start gap-2 mb-2">
              <textarea
                value={item}
                onChange={(e) => handleArrayFieldChange(fieldName, index, e.target.value)}
                className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm ${
                  validationErrors[fieldName] ? 'border-red-500' : ''
                }`}
                rows="2"
                placeholder={`Enter ${title.toLowerCase()}...`}
                required={required && index === 0}
              />
              {formData[fieldName].length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem(fieldName, index)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(fieldName)}
            className="text-almet-sapphire hover:text-almet-astral font-medium text-sm flex items-center gap-1"
          >
            <Plus size={14} />
            Add {title.slice(0, -1)}
          </button>
          {validationErrors[fieldName] && (
            <p className="text-red-500 text-xs mt-1">{validationErrors[fieldName]}</p>
          )}
        </div>
      ))}

      {/* Technical Skills */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          Technical Skills <span className="text-red-500">*</span>
        </label>
        
        {isLoadingSkills ? (
          <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor} flex items-center justify-center gap-2`}>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-almet-sapphire"></div>
            <span className={`text-sm ${textSecondary}`}>Loading skill groups...</span>
          </div>
        ) : (
          <HierarchicalMultiSelect
            key={`skills-${skillsComponentKey}`}
            title="Skills"
            icon={() => (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            )}
            data={skillGroupsHierarchical}
            selectedIds={formData.required_skills_data || []}
            onChange={handleSkillsChange}
            searchPlaceholder="Search skills and groups..."
            emptyMessage="No skill groups available"
            darkMode={darkMode}
            idPrefix="skill"
          />
        )}
        
        {validationErrors.required_skills_data && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.required_skills_data}</p>
        )}
      </div>

      {/* 🔥 DYNAMIC: Leadership OR Behavioral Competencies */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {isLeadershipPosition ? 'Leadership Competencies' : 'Behavioral Competencies'} 
          <span className="text-red-500">*</span>
        </label>
        
        {isLeadershipPosition ? (
          // LEADERSHIP COMPETENCIES (3-LEVEL)
          isLoadingLeadership ? (
            <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor} flex items-center justify-center gap-2`}>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className={`text-sm ${textSecondary}`}>Loading leadership competencies...</span>
            </div>
          ) : (
            <HierarchicalMultiSelect
  key={`leadership-${leadershipComponentKey}`}
  title="Leadership Competencies"
  icon={() => <Award className="w-4 h-4" />}
  data={leadershipGroupsHierarchical}
  selectedIds={formData.leadership_competencies_data || []}
  onChange={handleCompetenciesChange}
  searchPlaceholder="Search leadership competencies..."
  emptyMessage="No leadership competencies available"
  darkMode={darkMode}
  idPrefix="item"  // 🔥 ƏLAVƏ EDİN
/>
          )
        ) : (
          // BEHAVIORAL COMPETENCIES (2-LEVEL)
          isLoadingCompetencies ? (
            <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor} flex items-center justify-center gap-2`}>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className={`text-sm ${textSecondary}`}>Loading behavioral competencies...</span>
            </div>
          ) : (
            
<HierarchicalMultiSelect
  key={`behavioral-${behavioralComponentKey}`}
  title="Competencies"
  icon={() => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
  )}
  data={behavioralGroupsHierarchical}
  selectedIds={formData.behavioral_competencies_data || []}
  onChange={(selectedIds) => {
    console.log('🔄 Behavioral onChange called:', {
      newSelectedIds: selectedIds,
      previousIds: formData.behavioral_competencies_data
    });
    handleCompetenciesChange(selectedIds);
  }}
  searchPlaceholder="Search competencies and groups..."
  emptyMessage="No competency groups available"
  darkMode={darkMode}
  idPrefix="item"  // 🔥 ƏLAVƏ EDİN (behavioral üçün də item prefix istifadə edirsiz)
/>
          )
        )}
        
        {validationErrors.behavioral_competencies_data && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.behavioral_competencies_data}</p>
        )}
        {validationErrors.leadership_competencies_data && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.leadership_competencies_data}</p>
        )}
      </div>
    </div>
  );
};

export default JobResponsibilitiesTab;