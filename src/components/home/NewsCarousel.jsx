'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function NewsCarousel({ news, onClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (news.length <= 1) return;
    const timer = setInterval(() => setCurrentIndex(prev => (prev + 1) % news.length), 5000);
    return () => clearInterval(timer);
  }, [news.length]);

  if (!news || news.length === 0) return null;
  const current = news[currentIndex];

  return (
    <div className="relative">
      <div
        onClick={() => onClick(current)}
        className="bg-white dark:bg-almet-cloud-burst rounded-2xl overflow-hidden shadow-lg border border-almet-mystic dark:border-almet-san-juan cursor-pointer group hover:shadow-xl transition-all duration-300 h-80"
      >
        <div className="relative h-full">
          <Image
            key={currentIndex}
            src={current?.image_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800'}
            alt={current?.title || 'News'}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={currentIndex === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <h2 className="text-xl font-bold text-white mb-2 leading-tight">{current?.title}</h2>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/80 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {current ? new Date(current.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              </span>
              <div className="flex items-center gap-2 text-white/80 text-[10px]">
                <Eye className="h-3 w-3" /><span>{current?.view_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {news.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setCurrentIndex(prev => (prev - 1 + news.length) % news.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-almet-cloud-burst/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-almet-cloud-burst transition-all z-10"
          >
            <ChevronLeft className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setCurrentIndex(prev => (prev + 1) % news.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-almet-cloud-burst/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-almet-cloud-burst transition-all z-10"
          >
            <ChevronRight className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {news.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
