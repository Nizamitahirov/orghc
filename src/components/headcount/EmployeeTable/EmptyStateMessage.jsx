"use client";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles } from "../utils/themeStyles";
import { Users, SearchX, UserPlus } from "lucide-react";

const EmptyStateMessage = ({ hasFilters, onClearFilters, onAddEmployee }) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  return (
    <tr>
      <td colSpan="11" className="px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-almet-sapphire/10' : 'bg-almet-sapphire/8'}`}>
            {hasFilters
              ? <SearchX className="w-9 h-9 text-almet-sapphire opacity-70" />
              : <Users className="w-9 h-9 text-almet-sapphire opacity-70" />
            }
          </div>

          <div>
            <p className={`text-base font-semibold ${styles.textPrimary}`}>
              {hasFilters ? 'Nəticə tapılmadı' : 'Hələ işçi yoxdur'}
            </p>
            <p className={`text-sm ${styles.textMuted} mt-1.5 leading-relaxed`}>
              {hasFilters
                ? 'Cari filtrlərə uyğun işçi yoxdur. Filtrləri dəyişdirin və ya silin.'
                : 'Birinci işçini əlavə edərək işçi qüvvəsi idarəetməsinə başlayın.'}
            </p>
          </div>

          <div className="flex gap-2 mt-1">
            {hasFilters && (
              <button
                onClick={onClearFilters}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-150 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                Filtrləri təmizlə
              </button>
            )}
            {onAddEmployee && (
              <button
                onClick={onAddEmployee}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-colors duration-150"
              >
                <UserPlus size={15} />
                İşçi əlavə et
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default EmptyStateMessage;
