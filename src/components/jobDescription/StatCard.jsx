import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = "almet-sapphire", darkMode }) => {
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const borderColor = darkMode ? "border-almet-comet/30" : "border-gray-200";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textMuted = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";

  // Color mapping for better consistency with Almet theme
  const getColorClasses = (color) => {
    switch (color) {
      case "almet-sapphire":
        return {
          text: "text-almet-sapphire",
          bg: darkMode ? "bg-almet-sapphire/15" : "bg-almet-sapphire/8",
        };
      case "yellow-600":
        return {
          text: "text-yellow-600",
          bg: darkMode ? "bg-yellow-600/15" : "bg-yellow-50",
        };
      case "green-600":
        return {
          text: "text-green-600",
          bg: darkMode ? "bg-green-600/15" : "bg-green-50",
        };
      case "gray-600":
        return {
          text: darkMode ? "text-almet-bali-hai" : "text-gray-600",
          bg: darkMode ? "bg-almet-bali-hai/15" : "bg-gray-50",
        };
      default:
        return {
          text: "text-almet-sapphire",
          bg: darkMode ? "bg-almet-sapphire/15" : "bg-almet-sapphire/8",
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className={`${bgCard} rounded-lg p-4 border ${borderColor} shadow-sm hover:shadow-md 
      transition-all duration-200 group`}>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-xs font-medium ${textMuted} uppercase tracking-wider mb-1`}>
            {title}
          </p>
          <p className={`text-xl font-bold ${colorClasses.text} mb-1`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs ${textMuted}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2 ${colorClasses.bg} rounded-lg flex-shrink-0 ml-3`}>
          <Icon className={`h-4 w-4 ${colorClasses.text}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;