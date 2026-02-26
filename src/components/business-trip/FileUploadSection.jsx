// ============================================
// File: components/business-trip/FileUploadSection.jsx
// ============================================
import { Paperclip, X, FileText } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { BusinessTripHelpers } from '@/services/businessTripService';

export const FileUploadSection = ({
  isExpanded,
  onToggle,
  files,
  onFileAdd,
  onFileRemove,
  darkMode
}) => {
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      const validation = BusinessTripHelpers.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      onFileAdd(validFiles);
    }
    
    e.target.value = '';
  };

  return (
    <div className="mb-6">
      <SectionHeader 
        title="Attachments (Optional)" 
        icon={Paperclip} 
        isExpanded={isExpanded}
        onClick={onToggle}
      />
      
      {isExpanded && (
        <div className="mt-4 pl-4 border-l-2 border-almet-sapphire/20">
          <div className="mb-4">
            <label className="block">
              <div className="border-2 border-dashed border-almet-mystic dark:border-almet-comet rounded-lg p-6 text-center cursor-pointer hover:border-almet-sapphire dark:hover:border-almet-astral transition-all bg-almet-mystic/10 dark:bg-gray-900/20">
                <Paperclip className="w-8 h-8 text-almet-waterloo dark:text-almet-bali-hai mx-auto mb-2" />
                <p className="text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1">
                  Click to upload files
                </p>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (Max 10MB each)
                </p>
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                Selected Files ({files.length})
              </p>
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-almet-sapphire flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                        {BusinessTripHelpers.formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFileRemove(index)}
                    className="ml-2 p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};