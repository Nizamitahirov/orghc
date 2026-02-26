// HierarchicalMultiSelect.jsx - FIXED with selectedIds sync
import React, { useState, useEffect } from 'react'; // 🔥 useEffect əlavə edin
import { 
  ChevronDown, 
  ChevronRight, 
  Check,
  Search,
  X,
  Package,
  CheckSquare,
  Square
} from 'lucide-react';

const HierarchicalMultiSelect = ({
  title,
  icon: Icon = Package,
  data = [],
  selectedIds = [],
  onChange,
  searchPlaceholder = "Search...",
  emptyMessage = "No items available",
  darkMode = false,
  idPrefix = 'item'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedParents, setExpandedParents] = useState(new Set());
  const [expandedChildren, setExpandedChildren] = useState(new Set());
  const dropdownRef = React.useRef(null);

  // 🔥 NEW: Internal selected IDs state
  const [internalSelectedIds, setInternalSelectedIds] = useState([]);

  // 🔥 CRITICAL FIX: Sync internal state with prop
  useEffect(() => {
    console.log('🔄 [HierarchicalMultiSelect] selectedIds prop changed:', {
      newIds: selectedIds,
      previousInternal: internalSelectedIds,
      idPrefix
    });
    setInternalSelectedIds(selectedIds);
  }, [selectedIds, idPrefix]);

  // 🔥 Auto-expand parents with selected items in edit mode
  useEffect(() => {
    if (selectedIds.length > 0 && data.length > 0) {
      const newExpandedParents = new Set();
      const newExpandedChildren = new Set();
      
      selectedIds.forEach(selectedId => {
        const idStr = String(selectedId);
        const parts = idStr.split('_');
        
        if (parts.length >= 2) {
          // Extract parent ID (after prefix)
          const parentId = parts[1];
          newExpandedParents.add(parentId);
          
          // If 3-level structure, also expand child
          if (parts.length >= 3) {
            const childId = parts[2];
            newExpandedChildren.add(`${parentId}-${childId}`);
          }
        }
      });
      
      console.log('🔓 [HierarchicalMultiSelect] Auto-expanding:', {
        parents: Array.from(newExpandedParents),
        children: Array.from(newExpandedChildren)
      });
      
      setExpandedParents(newExpandedParents);
      setExpandedChildren(newExpandedChildren);
    }
  }, [selectedIds, data]);

  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-mystic";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-almet-mystic/30";
  const bgHover = darkMode ? "bg-gray-600" : "bg-almet-mystic";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Detect if data has 3 levels
  const hasThreeLevels = React.useMemo(() => {
    if (!data || data.length === 0) return false;
    const firstParent = data[0];
    if (!firstParent || !firstParent.items || firstParent.items.length === 0) return false;
    const firstChild = firstParent.items[0];
    return firstChild && Array.isArray(firstChild.items);
  }, [data]);

  // 🔥 Create UNIQUE path-based ID (prevents ID collision between parent/child)
  const makeUniqueId = (parentId, childId = null, grandchildId = null) => {
    if (grandchildId !== null) {
      return `${idPrefix}_${parentId}_${childId}_${grandchildId}`;
    } else if (childId !== null) {
      return `${idPrefix}_${parentId}_${childId}`;
    } else {
      return `${idPrefix}_${parentId}`;
    }
  };

  // 🔥 Extract raw ID from unique path
  const extractRawId = (uniqueId) => {
    if (typeof uniqueId !== 'string') return String(uniqueId);
    const parts = uniqueId.split('_');
    return parts[parts.length - 1]; // Last part is the actual ID
  };

  // 🔥 Check if unique ID is selected - USE INTERNAL STATE
  const isUniqueIdSelected = (uniqueId) => {
    return internalSelectedIds.some(id => String(id) === String(uniqueId));
  };

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    
    if (hasThreeLevels) {
      return data.map(mainGroup => {
        const mainGroupMatch = mainGroup.name?.toLowerCase().includes(term);
        const filteredChildGroups = (mainGroup.items || []).map(childGroup => {
          const childGroupMatch = childGroup.name?.toLowerCase().includes(term);
          const filteredItems = (childGroup.items || []).filter(item =>
            item.name?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
          );
          if (childGroupMatch || filteredItems.length > 0) {
            return { ...childGroup, items: childGroupMatch ? childGroup.items : filteredItems };
          }
          return null;
        }).filter(Boolean);
        if (mainGroupMatch || filteredChildGroups.length > 0) {
          return { ...mainGroup, items: mainGroupMatch ? mainGroup.items : filteredChildGroups };
        }
        return null;
      }).filter(Boolean);
    } else {
      return data.filter(parent => {
        const parentMatch = parent.name?.toLowerCase().includes(term);
        const childMatch = parent.items?.some(child => 
          child.name?.toLowerCase().includes(term) ||
          child.description?.toLowerCase().includes(term)
        );
        return parentMatch || childMatch;
      });
    }
  }, [searchTerm, data, hasThreeLevels]);

  // Auto-expand parents with matching items
  useEffect(() => {
    if (!searchTerm.trim()) return;
    const term = searchTerm.toLowerCase();
    const newExpandedParents = new Set(expandedParents);
    const newExpandedChildren = new Set(expandedChildren);
    
    if (hasThreeLevels) {
      filteredData.forEach(mainGroup => {
        (mainGroup.items || []).forEach(childGroup => {
          const hasMatchingItem = (childGroup.items || []).some(item =>
            item.name?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
          );
          if (hasMatchingItem || childGroup.name?.toLowerCase().includes(term)) {
            newExpandedParents.add(mainGroup.id);
            newExpandedChildren.add(`${mainGroup.id}-${childGroup.id}`);
          }
        });
        if (mainGroup.name?.toLowerCase().includes(term)) {
          newExpandedParents.add(mainGroup.id);
        }
      });
    } else {
      filteredData.forEach(parent => {
        const hasMatchingChild = parent.items?.some(child =>
          child.name?.toLowerCase().includes(term) ||
          child.description?.toLowerCase().includes(term)
        );
        if (hasMatchingChild) {
          newExpandedParents.add(parent.id);
        }
      });
    }
    setExpandedParents(newExpandedParents);
    setExpandedChildren(newExpandedChildren);
  }, [searchTerm, filteredData, hasThreeLevels]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setSearchTerm('');
  };

  const toggleParentExpansion = (parentId) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) newSet.delete(parentId);
      else newSet.add(parentId);
      return newSet;
    });
  };

  const toggleChildExpansion = (parentId, childId) => {
    const key = `${parentId}-${childId}`;
    setExpandedChildren(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  // 🔥 Get ALL selectable unique IDs
  const getAllSelectableIds = () => {
    const ids = [];
    
    if (hasThreeLevels) {
      filteredData.forEach(mainGroup => {
        (mainGroup.items || []).forEach(childGroup => {
          if (childGroup.items && childGroup.items.length > 0) {
            childGroup.items.forEach(item => {
              ids.push(makeUniqueId(mainGroup.id, childGroup.id, item.id));
            });
          } else {
            ids.push(makeUniqueId(mainGroup.id, childGroup.id));
          }
        });
      });
    } else {
      filteredData.forEach(parent => {
        if (parent.items && parent.items.length > 0) {
          parent.items.forEach(child => {
            ids.push(makeUniqueId(parent.id, child.id));
          });
        } else {
          ids.push(makeUniqueId(parent.id));
        }
      });
    }
    
    return ids;
  };

  // Get selectable IDs from a parent
  const getParentSelectableIds = (parent) => {
    const ids = [];
    
    if (hasThreeLevels) {
      (parent.items || []).forEach(childGroup => {
        if (childGroup.items && childGroup.items.length > 0) {
          childGroup.items.forEach(item => {
            ids.push(makeUniqueId(parent.id, childGroup.id, item.id));
          });
        } else {
          ids.push(makeUniqueId(parent.id, childGroup.id));
        }
      });
    } else {
      if (parent.items && parent.items.length > 0) {
        parent.items.forEach(child => {
          ids.push(makeUniqueId(parent.id, child.id));
        });
      } else {
        ids.push(makeUniqueId(parent.id));
      }
    }
    
    return ids;
  };

  // Get selectable IDs from a child group
  const getChildGroupSelectableIds = (parentId, childGroup) => {
    const ids = [];
    if (childGroup.items && childGroup.items.length > 0) {
      childGroup.items.forEach(item => {
        ids.push(makeUniqueId(parentId, childGroup.id, item.id));
      });
    } else {
      ids.push(makeUniqueId(parentId, childGroup.id));
    }
    return ids;
  };

  const isParentChecked = (parent) => {
    const itemIds = getParentSelectableIds(parent);
    if (itemIds.length === 0) return false;
    return itemIds.every(id => isUniqueIdSelected(id));
  };

  const isParentIndeterminate = (parent) => {
    const itemIds = getParentSelectableIds(parent);
    if (itemIds.length === 0) return false;
    const selectedCount = itemIds.filter(id => isUniqueIdSelected(id)).length;
    return selectedCount > 0 && selectedCount < itemIds.length;
  };

  const isChildGroupChecked = (parentId, childGroup) => {
    const itemIds = getChildGroupSelectableIds(parentId, childGroup);
    if (itemIds.length === 0) return false;
    return itemIds.every(id => isUniqueIdSelected(id));
  };

  const isChildGroupIndeterminate = (parentId, childGroup) => {
    const itemIds = getChildGroupSelectableIds(parentId, childGroup);
    if (itemIds.length === 0) return false;
    const selectedCount = itemIds.filter(id => isUniqueIdSelected(id)).length;
    return selectedCount > 0 && selectedCount < itemIds.length;
  };

  const areAllItemsSelected = () => {
    const allIds = getAllSelectableIds();
    if (allIds.length === 0) return false;
    return allIds.every(id => isUniqueIdSelected(id));
  };

  // 🔥 Handle parent toggle
  const handleParentToggle = (parent) => {
    const itemIds = getParentSelectableIds(parent);
    if (itemIds.length === 0) return;

    const allSelected = itemIds.every(id => isUniqueIdSelected(id));

    if (allSelected) {
      onChange(internalSelectedIds.filter(id => !itemIds.includes(String(id))));
    } else {
      const newSelection = [...internalSelectedIds];
      itemIds.forEach(itemId => {
        if (!isUniqueIdSelected(itemId)) {
          newSelection.push(itemId);
        }
      });
      onChange(newSelection);
    }
  };

  // Handle child group toggle
  const handleChildGroupToggle = (parentId, childGroup) => {
    const itemIds = getChildGroupSelectableIds(parentId, childGroup);
    if (itemIds.length === 0) return;

    const allSelected = itemIds.every(id => isUniqueIdSelected(id));

    if (allSelected) {
      onChange(internalSelectedIds.filter(id => !itemIds.includes(String(id))));
    } else {
      const newSelection = [...internalSelectedIds];
      itemIds.forEach(itemId => {
        if (!isUniqueIdSelected(itemId)) {
          newSelection.push(itemId);
        }
      });
      onChange(newSelection);
    }
  };

  // 🔥 Handle item toggle
  const handleItemToggle = (uniqueId) => {
    const isSelected = isUniqueIdSelected(uniqueId);

    if (isSelected) {
      onChange(internalSelectedIds.filter(id => String(id) !== String(uniqueId)));
    } else {
      onChange([...internalSelectedIds, uniqueId]);
    }
  };

  // Handle Select All
  const handleSelectAll = () => {
    const allIds = getAllSelectableIds();
    
    if (areAllItemsSelected()) {
      onChange(internalSelectedIds.filter(id => !allIds.includes(String(id))));
    } else {
      const newSelection = [...internalSelectedIds];
      allIds.forEach(itemId => {
        if (!isUniqueIdSelected(itemId)) {
          newSelection.push(itemId);
        }
      });
      onChange(newSelection);
    }
  };

  const handleClearAll = () => {
    const allIds = getAllSelectableIds();
    onChange(internalSelectedIds.filter(id => !allIds.includes(String(id))));
  };

  const selectedCount = internalSelectedIds.filter(id => getAllSelectableIds().includes(String(id))).length;
  const allItemsSelected = areAllItemsSelected();

  const getButtonText = () => {
    if (selectedCount === 0) return `Select ${title}`;
    return `${selectedCount} Selected`;
  };

  // Render 2-level structure
  const renderTwoLevel = () => {
    return filteredData.map(parent => {
      const isExpanded = expandedParents.has(parent.id);
      const hasChildren = parent.items?.length > 0;
      const parentChecked = isParentChecked(parent);
      const parentIndeterminate = isParentIndeterminate(parent);
      
      const selectableIds = getParentSelectableIds(parent);
      const selectedInParent = selectableIds.filter(id => isUniqueIdSelected(id)).length;

      return (
        <div key={parent.id} className={`border ${borderColor} rounded overflow-hidden transition-all`}>
          <div className={`flex items-center gap-2 p-2 cursor-pointer transition-all duration-150 ${
            parentChecked || parentIndeterminate
              ? 'bg-almet-sapphire/5 border-l-2 border-l-almet-sapphire' 
              : `${bgAccent} hover:bg-opacity-50`
          }`}>
            {hasChildren && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleParentExpansion(parent.id); }}
                className={`p-0.5 ${textMuted} hover:text-almet-sapphire transition-colors flex-shrink-0`}
              >
                {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
            )}
            
            <div className="flex-shrink-0 relative" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={parentChecked}
                ref={(input) => { if (input) input.indeterminate = parentIndeterminate; }}
                onChange={() => handleParentToggle(parent)}
                className="w-3.5 h-3.5 text-almet-sapphire border-almet-bali-hai rounded focus:ring-almet-sapphire cursor-pointer accent-almet-sapphire"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-semibold ${textPrimary} truncate`}>{parent.name}</span>
                {selectableIds.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${bgAccent} ${textMuted}`}>
                    {selectedInParent > 0 ? `${selectedInParent}/` : ''}{selectableIds.length}
                  </span>
                )}
              </div>
              {parent.description && (
                <p className={`text-[10px] ${textMuted} truncate mt-0.5`}>{parent.description}</p>
              )}
            </div>

            {parentChecked && <Check size={13} className="text-almet-sapphire flex-shrink-0" />}
          </div>

          {isExpanded && hasChildren && (
            <div className={`border-t ${borderColor} ${bgAccent} p-1.5 space-y-0.5`}>
              {parent.items.map(child => {
                const childUniqueId = makeUniqueId(parent.id, child.id);
                const childSelected = isUniqueIdSelected(childUniqueId);

                return (
                  <div
                    key={child.id}
                    className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all duration-150 ${
                      childSelected 
                        ? 'bg-almet-sapphire/5 border border-almet-sapphire/20' 
                        : `${bgCard} hover:${bgHover}`
                    }`}
                    onClick={() => handleItemToggle(childUniqueId)}
                  >
                    <div className="ml-5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={childSelected}
                        onChange={() => handleItemToggle(childUniqueId)}
                        className="w-3 h-3 text-almet-sapphire border-almet-bali-hai rounded focus:ring-almet-sapphire cursor-pointer accent-almet-sapphire"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={`text-[11px] ${textPrimary} truncate`}>{child.name}</span>
                      {child.description && (
                        <p className={`text-[10px] ${textMuted} truncate mt-0.5`}>{child.description}</p>
                      )}
                    </div>

                    {childSelected && <Check size={12} className="text-almet-sapphire flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  // Render 3-level structure
  const renderThreeLevel = () => {
    return filteredData.map(mainGroup => {
      const isMainExpanded = expandedParents.has(mainGroup.id);
      const mainChecked = isParentChecked(mainGroup);
      const mainIndeterminate = isParentIndeterminate(mainGroup);
      const selectableIds = getParentSelectableIds(mainGroup);
      const selectedItems = selectableIds.filter(id => isUniqueIdSelected(id)).length;

      return (
        <div key={mainGroup.id} className={`border ${borderColor} rounded overflow-hidden`}>
          <div className={`flex items-center gap-2 p-2 cursor-pointer ${
            mainChecked || mainIndeterminate ? 'bg-purple-500/5 border-l-2 border-l-purple-500' : bgAccent
          }`}>
            <button onClick={(e) => { e.stopPropagation(); toggleParentExpansion(mainGroup.id); }}
              className={`p-0.5 ${textMuted} hover:text-purple-500`}>
              {isMainExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
            
            <input type="checkbox" checked={mainChecked}
              ref={(input) => { if (input) input.indeterminate = mainIndeterminate; }}
              onChange={() => handleParentToggle(mainGroup)}
              className="w-3.5 h-3.5 accent-purple-600 cursor-pointer"
              onClick={(e) => e.stopPropagation()} />

            <div className="flex-1 min-w-0">
              <span className={`text-[11px] font-bold ${textPrimary}`}>{mainGroup.name}</span>
              <span className={`ml-2 text-[9px] ${textMuted}`}>
                {selectedItems > 0 ? `${selectedItems}/` : ''}{selectableIds.length}
              </span>
            </div>
          </div>

          {isMainExpanded && (mainGroup.items || []).map(childGroup => {
            const childKey = `${mainGroup.id}-${childGroup.id}`;
            const isChildExpanded = expandedChildren.has(childKey);
            const childChecked = isChildGroupChecked(mainGroup.id, childGroup);
            const childIndeterminate = isChildGroupIndeterminate(mainGroup.id, childGroup);

            return (
              <div key={childGroup.id} className={`ml-4 border-t ${borderColor}`}>
                <div className={`flex items-center gap-2 p-1.5 ${
                  childChecked || childIndeterminate ? 'bg-almet-sapphire/5' : ''
                }`}>
                  <button onClick={(e) => { e.stopPropagation(); toggleChildExpansion(mainGroup.id, childGroup.id); }}
                    className={`p-0.5 ${textMuted}`}>
                    {isChildExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  
                  <input type="checkbox" checked={childChecked}
                    ref={(input) => { if (input) input.indeterminate = childIndeterminate; }}
                    onChange={() => handleChildGroupToggle(mainGroup.id, childGroup)}
                    className="w-3 h-3 accent-almet-sapphire cursor-pointer"
                    onClick={(e) => e.stopPropagation()} />

                  <span className={`text-[10px] font-semibold ${textPrimary}`}>{childGroup.name}</span>
                </div>

                {isChildExpanded && (childGroup.items || []).map(item => {
                  const itemUniqueId = makeUniqueId(mainGroup.id, childGroup.id, item.id);
                  const itemSelected = isUniqueIdSelected(itemUniqueId);
                  
                  return (
                    <div key={item.id}
                      className={`ml-8 flex items-center gap-2 p-1.5 cursor-pointer ${
                        itemSelected ? 'bg-almet-sapphire/5' : `hover:${bgHover}`
                      }`}
                      onClick={() => handleItemToggle(itemUniqueId)}>
                      <input type="checkbox" checked={itemSelected}
                        onChange={() => handleItemToggle(itemUniqueId)}
                        className="w-2.5 h-2.5 accent-almet-sapphire cursor-pointer"
                        onClick={(e) => e.stopPropagation()} />
                      <span className={`text-[10px] ${textPrimary}`}>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button" onClick={toggleDropdown}
        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs border ${borderColor} 
          rounded-md ${bgCard} ${textPrimary} hover:${bgHover} transition-all duration-200 focus:outline-none 
          focus:ring-1 focus:ring-almet-sapphire`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon size={14} className="flex-shrink-0 text-almet-sapphire" />
          <span className="truncate font-medium">{getButtonText()}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-almet-sapphire text-white">
              {selectedCount}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${textMuted}`} />
        </div>
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-1.5 border ${borderColor} rounded-md ${bgCard} shadow-lg`}>
          <div className={`p-2.5 border-b ${borderColor}`}>
            <div className="relative">
              <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${textMuted}`} size={13} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full pl-8 pr-7 py-1.5 text-[11px] border ${borderColor} rounded ${bgCard} ${textPrimary}`} />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 ${textMuted}`}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {filteredData.length > 0 ? (
              <div className="p-1.5 space-y-1">
                {hasThreeLevels ? renderThreeLevel() : renderTwoLevel()}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className={`text-[11px] ${textMuted}`}>{searchTerm ? `No items found` : emptyMessage}</p>
              </div>
            )}
          </div>

          {filteredData.length > 0 && (
            <div className={`p-2.5 border-t ${borderColor} ${bgAccent}`}>
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <button onClick={handleSelectAll}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded font-semibold ${
                    allItemsSelected ? 'bg-almet-sapphire text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                  {allItemsSelected ? <><CheckSquare size={12} />Deselect All</> : <><Square size={12} />Select All</>}
                </button>
                {selectedCount > 0 && (
                  <button onClick={handleClearAll} className="text-red-500 font-semibold">Clear All</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HierarchicalMultiSelect;