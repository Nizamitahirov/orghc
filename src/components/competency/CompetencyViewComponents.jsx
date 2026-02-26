import React from 'react';
import {
  Edit, Trash2, Save, X, Search, Building, Crown,
  ChevronRight, ChevronDown, Plus
} from 'lucide-react';

// Leadership Card View Component
export const LeadershipCardView = ({ 
  filteredData, 
  expandedCard, 
  toggleExpand,
  expandedChildGroups,
  toggleChildGroup,
  editKey,
  editValue,
  setEditValue,
  beginEditGroup,
  beginEditChildGroup,
  beginEditLeadershipItem,
  deleteGroup,
  deleteChildGroup,
  deleteItem,
  saveEdit,
  cancelEdit,
  busy,
  setShowAddChildGroup,
  setNewChildGroup,
  setShowAddItem,
  setNewItem,
  darkMode
}) => {
  const card = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const subtle = darkMode ? 'bg-almet-comet' : 'bg-gray-50';
  const border = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const text = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textDim = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';

  const ActionButton = ({ onClick, icon: Icon, label, size = 'sm', variant = 'primary' }) => {
    const variants = {
      primary: 'bg-almet-sapphire hover:bg-almet-astral text-white',
      outline: 'border-2 border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white bg-transparent',
    };
    const sizes = { sm: 'px-3 py-1.5 text-xs' };
    return (
      <button onClick={onClick} className={`flex items-center gap-2 rounded-lg font-medium transition ${variants[variant]} ${sizes[size]}`}>
        <Icon size={14} />
        <span>{label}</span>
      </button>
    );
  };

  if (Object.keys(filteredData).length === 0) {
    return (
      <div className={`${card} border ${border} rounded-2xl p-10 text-center col-span-full`}>
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
          <Search className="text-almet-waterloo" />
        </div>
        <p className={`${text} font-semibold`}>No results found</p>
        <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new item.</p>
        <div className="mt-4 flex justify-center gap-2">
          <ActionButton icon={X} label="Clear filters" onClick={() => {}} variant="outline" />
          <ActionButton icon={Plus} label="New item" onClick={() => setShowAddItem(true)} />
        </div>
      </div>
    );
  }

  return (
   <section className="space-y-4">
         {filteredData.length === 0 && (
           <div className={`${card} border ${border} rounded-2xl p-10 text-center`}>
             <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
               <Search className="text-almet-waterloo" />
             </div>
             <p className={`${text} font-semibold`}>No results found</p>
             <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new group.</p>
             <div className="mt-4 flex justify-center gap-2">
               <ActionButton
                 icon={X}
                 label="Clear filters"
                 onClick={() => {
                   setSearch('');
                   setSelectedGroup('');
                 }}
                 variant="outline"
               />
               <ActionButton icon={Plus} label="New Group" onClick={() => setShowAddGroup(true)} />
             </div>
           </div>
         )}
   
         {filteredData.map(mainGroup => {
           const isMainOpen = expandedCard === mainGroup.id;
           const isEditingMain = editKey === `group-${mainGroup.id}`;
   
           return (
             <article key={mainGroup.id} className={`${card} border ${border} rounded-2xl shadow-sm hover:shadow-md transition`}>
               <header className={`p-4 flex items-center gap-3 border-b ${border}`}>
                 <button
                   onClick={() => toggleExpand(mainGroup.id)}
                   className={`p-2 rounded-xl ${isMainOpen ? 'bg-almet-sapphire text-white' : 'bg-almet-mystic text-almet-cloud-burst'} transition`}
                 >
                   {isMainOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                 </button>
                 <Crown size={18} className="text-almet-sapphire" />
                 <div className="flex-1 min-w-0">
                   {isEditingMain ? (
                     <div className="flex items-center gap-2">
                       <input
                         value={editValue}
                         onChange={(e) => setEditValue(e.target.value)}
                         autoFocus
                         className="w-full px-2 py-1 rounded-lg border-2 text-sm font-bold bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                       />
                       <button
                         onClick={saveEdit}
                         disabled={busy}
                         className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                       >
                         <Save size={14} />
                       </button>
                       <button
                         onClick={cancelEdit}
                         className="p-1 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                       >
                         <X size={14} />
                       </button>
                     </div>
                   ) : (
                     <>
                       <h3 className={`text-sm font-bold ${text} truncate`}>{mainGroup.name}</h3>
                       <p className={`${textDim} text-xs`}>{mainGroup.childGroups.length} child groups</p>
                     </>
                   )}
                 </div>
                 <div className="flex items-center gap-1">
                   {!isEditingMain && (
                     <>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           beginEditGroup(mainGroup.id, mainGroup.name);
                         }}
                         className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                       >
                         <Edit size={16} />
                       </button>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           deleteGroup(mainGroup.name, mainGroup.id);
                         }}
                         disabled={busy}
                         className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                       >
                         <Trash2 size={16} />
                       </button>
                     </>
                   )}
                 </div>
               </header>
   
               {isMainOpen && (
                 <div className="p-3 space-y-2">
                   {mainGroup.childGroups.length === 0 ? (
                     <div className={`${subtle} rounded-xl p-6 text-center text-sm ${textDim}`}>
                       No child groups yet
                       <div className="mt-3">
                         <ActionButton
                           icon={Plus}
                           label="Add child group"
                           size="sm"
                           onClick={() => {
                             setShowAddChildGroup(true);
                             setNewChildGroup({ main_group: mainGroup.id.toString(), name: '' });
                           }}
                         />
                       </div>
                     </div>
                   ) : (
                     mainGroup.childGroups.map(childGroup => {
                       const isChildOpen = expandedChildGroups[`${mainGroup.id}-${childGroup.id}`];
                       const isEditingChild = editKey === `childgroup-${mainGroup.id}-${childGroup.id}`;
   
                       return (
                         <div key={childGroup.id} className={`${subtle} border ${border} rounded-xl overflow-hidden`}>
                           <div className="p-3 flex items-center gap-3">
                             <button
                               onClick={() => toggleChildGroup(mainGroup.id, childGroup.id)}
                               className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                             >
                               {isChildOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                             </button>
                             <Building size={14} className="text-almet-sapphire" />
                             <div className="flex-1 min-w-0">
                               {isEditingChild ? (
                                 <div className="flex items-center gap-2">
                                   <input
                                     value={editValue}
                                     onChange={(e) => setEditValue(e.target.value)}
                                     autoFocus
                                     className="w-full px-2 py-1 rounded-lg border text-xs bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                                   />
                                   <button
                                     onClick={saveEdit}
                                     disabled={busy}
                                     className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                   >
                                     <Save size={12} />
                                   </button>
                                   <button
                                     onClick={cancelEdit}
                                     className="p-1 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                   >
                                     <X size={12} />
                                   </button>
                                 </div>
                               ) : (
                                 <>
                                   <p className={`text-xs font-semibold ${text}`}>{childGroup.name}</p>
                                   <p className={`${textDim} text-xs`}>{childGroup.items.length} items</p>
                                 </>
                               )}
                             </div>
                             <div className="flex items-center gap-1">
                               {!isEditingChild && (
                                 <>
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       beginEditChildGroup(mainGroup.id, childGroup.id, childGroup.name);
                                     }}
                                     className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                   >
                                     <Edit size={14} />
                                   </button>
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       deleteChildGroup(childGroup.id, childGroup.name);
                                     }}
                                     disabled={busy}
                                     className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                   >
                                     <Trash2 size={14} />
                                   </button>
                                 </>
                               )}
                             </div>
                           </div>
   
                           {isChildOpen && (
                             <div className="px-3 pb-3 space-y-1.5">
                               {childGroup.items.length === 0 ? (
                                 <div className="px-4 py-3 text-center text-xs text-gray-500">
                                   No items yet
                                 </div>
                               ) : (
                                 childGroup.items.map(item => {
                                   const isEditingItem = editKey === `item-${mainGroup.id}-${childGroup.id}-${item.id}`;
                                   
                                   return (
                                     <div
                                       key={item.id}
                                       className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-almet-cloud-burst border border-gray-100 dark:border-gray-700 hover:border-almet-sapphire transition"
                                     >
                                       {isEditingItem ? (
                                         <>
                                           <input
                                             value={editValue}
                                             onChange={(e) => setEditValue(e.target.value)}
                                             autoFocus
                                             className="flex-1 px-2 py-1 rounded-lg border text-xs bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                                           />
                                           <button
                                             onClick={saveEdit}
                                             disabled={busy}
                                             className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                           >
                                             <Save size={12} />
                                           </button>
                                           <button
                                             onClick={cancelEdit}
                                             className="p-1 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                           >
                                             <X size={12} />
                                           </button>
                                         </>
                                       ) : (
                                         <>
                                           <div className="w-1.5 h-1.5 rounded-full bg-almet-sapphire" />
                                           <div className="flex-1 min-w-0">
                                             <p className={`text-xs font-medium ${text} truncate`}>{item.name}</p>
                                             {item.created_at && (
                                               <p className={`${textDim} text-xs`}>
                                                 {new Date(item.created_at).toLocaleDateString()}
                                               </p>
                                             )}
                                           </div>
                                           <div className="flex items-center gap-1">
                                             <button
                                               onClick={() => beginEditLeadershipItem(mainGroup.id, childGroup.id, item.id, item.name)}
                                               className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                             >
                                               <Edit size={12} />
                                             </button>
                                             <button
                                               onClick={() => deleteItem(item.id, item.name, childGroup.id)}
                                               disabled={busy}
                                               className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                             >
                                               <Trash2 size={12} />
                                             </button>
                                           </div>
                                         </>
                                       )}
                                     </div>
                                   );
                                 })
                               )}
                             </div>
                           )}
                         </div>
                       );
                     })
                   )}
                 </div>
               )}
             </article>
           );
         })}
       </section>
  );
}; 
// Leadership Table View Component
export const LeadershipTableView = ({
  filteredData,
  beginEditGroup,
  beginEditChildGroup,
  beginEditLeadershipItem,
  deleteGroup,
  deleteChildGroup,
  deleteItem,
  editKey,
  editValue,
  setEditValue,
  saveEdit,
  cancelEdit,
  busy,
  darkMode
}) => {
  const card = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const subtle = darkMode ? 'bg-almet-comet' : 'bg-gray-50';
  const border = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const text = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textDim = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';

  if (!Array.isArray(filteredData) || filteredData.length === 0) {
    return (
      <div className={`${card} border ${border} rounded-2xl p-10 text-center`}>
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
          <Search className="text-almet-waterloo" />
        </div>
        <p className={`${text} font-semibold`}>No results found</p>
        <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new group.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredData.map(mainGroup => (
        <div key={mainGroup.id} className={`${card} border ${border} rounded-2xl overflow-hidden shadow-sm`}>
          <div className={`px-4 py-3 ${subtle} border-b ${border} flex items-center gap-2`}>
            <Crown size={16} className="text-almet-sapphire" />
            <h3 className={`text-sm font-bold ${text}`}>{mainGroup.name}</h3>
            <span className={`ml-auto px-2 py-1 rounded-full bg-almet-sapphire/10 text-almet-sapphire text-xs font-semibold`}>
              {mainGroup.childGroups.reduce((acc, cg) => acc + cg.items.length, 0)} items
            </span>
            <button onClick={() => beginEditGroup(mainGroup.id, mainGroup.name)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <Edit size={14} />
            </button>
            <button onClick={() => deleteGroup(mainGroup.name, mainGroup.id)} disabled={busy} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${subtle} border-b ${border}`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${text}`}>Child Group</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${text}`}>Item Name</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${text}`}>Created</th>
                  <th className={`px-4 py-3 text-right text-xs font-semibold ${text}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mainGroup.childGroups.map((childGroup) => (
                  <React.Fragment key={childGroup.id}>
                    {childGroup.items.length === 0 ? (
                      <tr>
                        <td className={`px-4 py-3 text-sm font-medium ${text} bg-gray-50 dark:bg-gray-800/50`}>
                          <div className="flex items-center gap-2">
                            <Building size={14} className="text-almet-sapphire" />
                            {childGroup.name}
                          </div>
                        </td>
                        <td colSpan={2} className={`px-4 py-3 text-sm ${textDim} italic bg-gray-50 dark:bg-gray-800/50`}>No items yet</td>
                        <td className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => beginEditChildGroup(mainGroup.id, childGroup.id, childGroup.name)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => deleteChildGroup(childGroup.id, childGroup.name)} disabled={busy} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      childGroup.items.map((item, itemIdx) => {
                        const isEditingItem = editKey === `item-${mainGroup.id}-${childGroup.id}-${item.id}`;
                        
                        return (
                          <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition ${itemIdx === 0 ? 'border-t-2 border-gray-200 dark:border-gray-700' : ''}`}>
                            {itemIdx === 0 && (
                              <td rowSpan={childGroup.items.length} className={`px-4 py-3 text-sm font-medium ${text} bg-gray-50 dark:bg-gray-800/50 align-top`}>
                                <div className="flex items-center justify-between gap-2 sticky top-0">
                                  <div className="flex items-center gap-2">
                                    <Building size={14} className="text-almet-sapphire" />
                                    {childGroup.name}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => beginEditChildGroup(mainGroup.id, childGroup.id, childGroup.name)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                      <Edit size={12} />
                                    </button>
                                    <button onClick={() => deleteChildGroup(childGroup.id, childGroup.name)} disabled={busy} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            )}
                            <td className={`px-4 py-3 text-sm ${text}`}>
                              {isEditingItem ? (
                                <input value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus className="w-full px-2 py-1 rounded-lg border text-xs bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire" />
                              ) : item.name}
                            </td>
                            <td className={`px-4 py-3 text-sm ${textDim}`}>
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                {isEditingItem ? (
                                  <>
                                    <button onClick={saveEdit} disabled={busy} className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition">
                                      <Save size={16} />
                                    </button>
                                    <button onClick={cancelEdit} className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                      <X size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => beginEditLeadershipItem(mainGroup.id, childGroup.id, item.id, item.name)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                      <Edit size={16} />
                                    </button>
                                    <button onClick={() => deleteItem(item.id, item.name)} disabled={busy} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// Regular Table View (for Skills and Behavioral)
export const TableView = ({
  filteredData,
  beginEditItem,
  deleteItem,
  editKey,
  editValue,
  setEditValue,
  saveEdit,
  cancelEdit,
  busy,
  darkMode
}) => {
  const card = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const subtle = darkMode ? 'bg-almet-comet' : 'bg-gray-50';
  const border = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const text = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textDim = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';

  const groupedData = {};
  Object.entries(filteredData).forEach(([group, items]) => {
    if (!groupedData[group]) groupedData[group] = [];
    items.forEach(item => {
      groupedData[group].push(typeof item === 'object' ? item : { name: item });
    });
  });

  if (Object.keys(groupedData).length === 0) {
    return (
      <div className={`${card} border ${border} rounded-2xl p-10 text-center`}>
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
          <Search className="text-almet-waterloo" />
        </div>
        <p className={`${text} font-semibold`}>No results found</p>
        <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new item.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedData).map(([group, items]) => (
        <div key={group} className={`${card} border ${border} rounded-2xl overflow-hidden shadow-sm`}>
          <div className={`px-4 py-3 ${subtle} border-b ${border} flex items-center gap-2`}>
            <h3 className={`text-sm font-bold ${text}`}>{group}</h3>
            <span className={`ml-auto px-2 py-1 rounded-full bg-almet-sapphire/10 text-almet-sapphire text-xs font-semibold`}>
              {items.length} items
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${subtle} border-b ${border}`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${text}`}>Name</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${text}`}>Created</th>
                  <th className={`px-4 py-3 text-right text-xs font-semibold ${text}`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item, idx) => {
                  const name = item.name || item;
                  const k = `${group}-${idx}`;
                  const editing = editKey === k;

                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3">
                        {editing ? (
                          <div className="flex items-center gap-2">
                            <input value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus className="w-full px-2 py-1 rounded-lg border text-xs bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire" />
                            <button onClick={saveEdit} disabled={busy} className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition">
                              <Save size={16} />
                            </button>
                            <button onClick={cancelEdit} className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-sm ${text}`}>{name}</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-sm ${textDim}`}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {!editing && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => beginEditItem(group, idx)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => { const id = typeof item === 'object' ? item.id : null; if (id) deleteItem(id, name); }} disabled={busy} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// Card View (for Skills and Behavioral)
export const CardView = ({
  filteredData,
  expandedCard,
  toggleExpand,
  beginEditItem,
  beginEditGroup,
  deleteItem,
  deleteGroup,
  editKey,
  editValue,
  setEditValue,
  saveEdit,
  cancelEdit,
  busy,
  setShowAddItem,
  setNewItem,
  darkMode
}) => {
  const card = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const subtle = darkMode ? 'bg-almet-comet' : 'bg-gray-50';
  const border = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const text = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textDim = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';

  const ActionButton = ({ onClick, icon: Icon,label, size = 'sm', variant = 'primary' }) => {
    const variants = {
      primary: 'bg-almet-sapphire hover:bg-almet-astral text-white',
    };
    const sizes = { sm: 'px-3 py-1.5 text-xs' };
    return (
      <button onClick={onClick} className={`flex items-center gap-2 rounded-lg font-medium transition ${variants[variant]} ${sizes[size]}`}>
        <Icon size={14} />
        <span>{label}</span>
      </button>
    );
  };

  if (filteredData.length === 0) {
    return (
      <div className={`${card} border ${border} rounded-2xl p-10 text-center`}>
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
          <Search className="text-almet-waterloo" />
        </div>
        <p className={`${text} font-semibold`}>No results found</p>
        <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new group.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Object.keys(filteredData).length === 0 && (
        <div className={`${card} border ${border} rounded-2xl p-10 text-center col-span-full`}>
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
            <Search className="text-almet-waterloo" />
          </div>
          <p className={`${text} font-semibold`}>No results found</p>
          <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new item.</p>
          <div className="mt-4 flex justify-center gap-2">
            <ActionButton
              icon={X}
              label="Clear filters"
              onClick={() => {
                setSearch('');
                setSelectedGroup('');
              }}
              variant="outline"
            />
            <ActionButton icon={Plus} label="New item" onClick={() => setShowAddItem(true)} />
          </div>
        </div>
      )}

      {Object.keys(filteredData).map(group => {
        const isOpen = expandedCard === group;
        const items = filteredData[group] || [];
        const isEditingGroup = editKey === `group-${group}`;

        return (
          <article key={group} className={`${card} border ${border} rounded-2xl shadow-sm hover:shadow-md transition`}>
            <header className={`p-4 flex items-center gap-3 border-b ${border}`}>
              <button
                onClick={() => toggleExpand(group)}
                className={`p-2 rounded-xl ${isOpen ? 'bg-almet-sapphire text-white' : 'bg-almet-mystic text-almet-cloud-burst'} transition`}
              >
                {isOpen ? <X size={16} /> : <Plus size={16} />}
              </button>
              <div className="flex-1 min-w-0">
                {isEditingGroup ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      className="w-full px-2 py-1 rounded-lg border-2 text-sm font-bold bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                    />
                    <button
                      onClick={saveEdit}
                      disabled={busy}
                      className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className={`text-sm font-bold ${text} truncate`}>{group}</h3>
                    <p className={`${textDim} text-xs`}>{items.length} items</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!isEditingGroup && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      beginEditGroup(group);
                    }}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition"
                  >
                    <Edit size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGroup(group);
                  }}
                  disabled={busy}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </header>

            {isOpen ? (
              <div className="p-3 space-y-2">
                {items.length === 0 && (
                  <div className={`${subtle} rounded-xl p-6 text-center text-sm ${textDim}`}>
                    No items yet
                    <div className="mt-3">
                      <ActionButton
                        icon={Plus}
                        label="Add first item"
                        onClick={() => {
                          setShowAddItem(true);
                          setNewItem({ main_group: group, child_group: '', name: '' });
                        }}
                      />
                    </div>
                  </div>
                )}

                {items.map((it, idx) => {
                  const name = typeof it === 'string' ? it : it.name;
                  const k = `${group}-${idx}`;
                  const editing = editKey === k;
                  return (
                    <div key={k} className={`${subtle} border ${border} rounded-xl p-3 flex items-center gap-3`}>
                      {editing ? (
                        <>
                          <TextInput value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                          <div className="ml-auto flex gap-2">
                            <ActionButton icon={Save} label="Save" variant="success" size="sm" onClick={saveEdit} disabled={busy} />
                            <ActionButton icon={X} label="Cancel" variant="outline" size="sm" onClick={cancelEdit} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-almet-sapphire" />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${text} truncate`}>{name}</p>
                            {typeof it === 'object' && it.created_at && (
                              <p className={`${textDim} text-xs mt-0.5`}>Added: {new Date(it.created_at).toLocaleDateString()}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <button onClick={() => beginEditItem(group, idx)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition">
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                const id = typeof it === 'object' ? it.id : null;
                                if (id) deleteItem(id, name);
                              }}
                              disabled={busy}
                              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`p-4 text-xs ${textDim}`}>Click to expand</div>
            )}
          </article>
        );
      })}
    </section>
  );
};
