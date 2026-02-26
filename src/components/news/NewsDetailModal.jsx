// src/components/news/NewsDetailModal.jsx
import React from 'react';
import { 
  X, Calendar, Eye, Edit, Trash2, Pin, PinOff, 
  Users, Target, Mail 
} from 'lucide-react';

export default function NewsDetailModal({
  isOpen,
  onClose,
  newsItem,
  darkMode,
  permissions,
  categories,
  onEdit,
  onDelete,
  onTogglePin,
  formatDate,
  getCategoryInfo
}) {
  if (!isOpen || !newsItem) return null;

  const categoryInfo = getCategoryInfo(newsItem.category);
  const CategoryIcon = categoryInfo.icon;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
          darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
        }`} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header Image */}
        <div className="relative h-72">
          <img
            src={newsItem.image_url || 'https://via.placeholder.com/1200x600?text=No+Image'}
            alt={newsItem.title}
            className="w-full h-full object-cover"
          />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-3 right-3 p-2 rounded-xl shadow-lg transition-colors ${
              darkMode
                ? 'bg-almet-cloud-burst hover:bg-almet-comet text-white'
                : 'bg-white hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X size={18} />
          </button>
          
          {/* Action Buttons */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {permissions?.capabilities?.can_pin_news && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(newsItem, e);
                  onClose();
                }}
                className={`p-2 rounded-xl transition-all shadow-lg ${
                  newsItem.is_pinned 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
                title={newsItem.is_pinned ? 'Unpin' : 'Pin'}
              >
                {newsItem.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
              </button>
            )}
            
            {permissions?.capabilities?.can_update_news && (
              <button
                onClick={(e) => {
                  onClose();
                  onEdit(newsItem, e);
                }}
                className="p-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all shadow-lg"
                title="Edit"
              >
                <Edit size={14} />
              </button>
            )}
            
            {permissions?.capabilities?.can_delete_news && (
              <button
                onClick={(e) => {
                  onClose();
                  onDelete(newsItem, e);
                }}
                className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Category Badge */}
          <div 
            className={`absolute bottom-3 left-3 ${categoryInfo.color} text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-lg`}
          >
            <CategoryIcon size={14} />
            {categoryInfo.name}
          </div>

          {/* Status Badges */}
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {newsItem.is_pinned && (
              <div className="bg-almet-sapphire text-white px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 shadow-lg">
                <Pin size={10} />
                Pinned
              </div>
            )}
            {!newsItem.is_published && (
              <div className="bg-orange-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-medium shadow-lg">
                Draft
              </div>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Author Info & Views */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-almet-sapphire to-almet-astral text-white rounded-full flex items-center justify-center text-sm font-medium">
                {(newsItem.author_display_name || newsItem.author_name || 'S').charAt(0)}
              </div>
              <div>
                <p className={`text-xs font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {newsItem.author_display_name || newsItem.author_name || 'System'}
                </p>
                <p className={`text-[10px] ${
                  darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                }`}>
                  {formatDate(newsItem.published_at)}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs ${
              darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
            }`}>
              <Eye size={14} />
              {newsItem.view_count} views
            </div>
          </div>

          {/* Title */}
          <h2 className={`text-xl font-bold mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {newsItem.title}
          </h2>

          {/* Content */}
          <p className={`leading-relaxed mb-5 whitespace-pre-line text-sm ${
            darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
          }`}>
            {newsItem.content}
          </p>

          {/* Target Groups Section */}
          {newsItem.target_groups_info && newsItem.target_groups_info.length > 0 && (
            <div className={`mb-5 p-4 rounded-xl border ${
              darkMode
                ? 'bg-almet-san-juan/50 border-almet-comet'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Target className="text-almet-sapphire" size={16} />
                <h3 className={`text-xs font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Target Groups
                </h3>
                {newsItem.notify_members && newsItem.notification_sent && (
                  <div className="flex items-center gap-1 ml-auto">
                    <Mail size={12} className={
                      darkMode ? 'text-green-400' : 'text-green-600'
                    } />
                    <span className={`text-[10px] font-medium ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      Email Sent
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {newsItem.target_groups_info.map(group => (
                  <div
                    key={group.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
                      darkMode
                        ? 'bg-almet-cloud-burst border-almet-comet'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Users size={12} className={
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                    } />
                    <span className={`text-xs font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {group.name}
                    </span>
                    <span className={`text-[10px] ${
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                    }`}>
                      ({group.member_count} members)
                    </span>
                  </div>
                ))}
              </div>
              
              <div className={`mt-2.5 pt-2.5 border-t ${
                darkMode ? 'border-almet-comet' : 'border-gray-200'
              }`}>
                <p className={`text-[10px] ${
                  darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                }`}>
                  Total Recipients: <span className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {newsItem.total_recipients} employees
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {newsItem.tags_list && newsItem.tags_list.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 pt-4 border-t ${
              darkMode ? 'border-almet-comet' : 'border-gray-200'
            }`}>
              {newsItem.tags_list.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-xl text-xs ${
                    darkMode
                      ? 'bg-almet-san-juan text-almet-bali-hai'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}