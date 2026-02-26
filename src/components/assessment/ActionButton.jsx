
'use client';

import { 
 
  Loader2
} from 'lucide-react';

const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', loading = false, disabled = false, size = 'sm' }) => {
  const variants = {
    primary: 'bg-almet-sapphire hover:bg-almet-astral text-white',
    secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    outline: 'border border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white',
    info: 'bg-almet-astral hover:bg-almet-sapphire text-white'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-1.5 rounded-md font-medium transition-colors ${variants[variant]} ${sizes[size]} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {label}
    </button>
  );
};

export default ActionButton