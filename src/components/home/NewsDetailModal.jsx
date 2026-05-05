'use client';
import { X, Eye, FileText } from "lucide-react";

export default function NewsDetailModal({ isOpen, onClose, news, darkMode }) {
  if (!isOpen || !news) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-72">
          <img
            src={news.image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200'}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-all">
            <X size={18} />
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            {news.category_name && (
              <div className="bg-almet-sapphire text-white px-3 py-1 rounded-xl text-[10px] font-medium inline-flex items-center gap-1 mb-2">
                <FileText size={12} />{news.category_name}
              </div>
            )}
            <h2 className="text-white text-xl font-bold mb-2">{news.title}</h2>
            <div className="flex items-center gap-3 text-white/90 text-xs">
              <span>{new Date(news.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Eye size={12} />{news.view_count} views</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {news.excerpt && <p className="text-almet-sapphire dark:text-almet-steel-blue font-semibold text-base mb-3">{news.excerpt}</p>}
          <p className={`leading-relaxed whitespace-pre-line text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-gray-700'}`}>{news.content}</p>
        </div>
      </div>
    </div>
  );
}
