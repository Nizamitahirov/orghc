'use client';

const COLOR = {
  sapphire: {
    bg:     'bg-almet-sapphire/10 dark:bg-almet-steel-blue/10',
    icon:   'text-almet-sapphire dark:text-almet-steel-blue',
    button: 'bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue text-almet-sapphire dark:text-almet-steel-blue',
    glow:   'group-hover:shadow-almet-sapphire/20',
  },
  purple: {
    bg:     'bg-purple-500/10 dark:bg-purple-400/10',
    icon:   'text-purple-600 dark:text-purple-400',
    button: 'bg-purple-500/10 dark:bg-purple-400/10 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-500 text-purple-600 dark:text-purple-400',
    glow:   'group-hover:shadow-purple-500/20',
  },
  teal: {
    bg:     'bg-teal-500/10 dark:bg-teal-400/10',
    icon:   'text-teal-600 dark:text-teal-400',
    button: 'bg-teal-500/10 dark:bg-teal-400/10 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-500 text-teal-600 dark:text-teal-400',
    glow:   'group-hover:shadow-teal-500/20',
  },
};

export default function ActionCard({ icon: Icon, title, description, buttonText, onClick, color = 'sapphire' }) {
  const s = COLOR[color] ?? COLOR.sapphire;
  return (
    <div className={`
      relative bg-gradient-to-br from-white to-gray-50/80
      dark:from-almet-cloud-burst dark:to-almet-cloud-burst/90
      rounded-2xl p-4 border border-gray-100 dark:border-almet-san-juan
      shadow-sm hover:shadow-md ${s.glow}
      transition-all duration-200 text-center group
      hover:-translate-y-0.5
    `}>
      {/* subtle top shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

      <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`h-5 w-5 ${s.icon}`} />
      </div>

      <h4 className="font-semibold text-sm text-almet-cloud-burst dark:text-white mb-1.5 tracking-tight">
        {title}
      </h4>
      <p className="text-[11px] text-almet-waterloo dark:text-almet-bali-hai mb-4 leading-relaxed">
        {description}
      </p>

      <button
        onClick={onClick}
        className={`w-full ${s.button} font-semibold py-2.5 rounded-xl text-[11px] transition-all duration-150 active:scale-[0.97]`}
      >
        {buttonText}
      </button>
    </div>
  );
}
