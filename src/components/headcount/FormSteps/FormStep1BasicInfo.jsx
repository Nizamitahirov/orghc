// src/components/headcount/FormSteps/FormStep1BasicInfo.jsx - IMPROVED UI/UX
import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, MapPin, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";
import { apiService } from "../../../services/api";

/**
 * IMPROVED BASIC INFORMATION STEP
 * ✓ Daha oxunaqlı layout
 * ✓ Optimal spacing
 * ✓ Professional görünüş
 */
const FormStep1BasicInfo = ({ 
  formData, 
  handleInputChange, 
  validationErrors,
  isEditMode = false
}) => {
  const { darkMode } = useTheme();
  
  const [emailStatus, setEmailStatus] = useState({ checking: false, available: null });
  const [validationTimer, setValidationTimer] = useState(null);

  // THEME CLASSES
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";

  // Real-time email validation
  useEffect(() => {
    if (isEditMode && !formData._email_changed) {
      setEmailStatus({ checking: false, available: true });
      return;
    }

    if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }

      const timer = setTimeout(async () => {
        setEmailStatus({ checking: true, available: null });
        try {
          const response = await apiService.get('/employees/', { 
            email: formData.email,
            page_size: 1 
          });
          
          const exists = response.data.results && response.data.results.length > 0;
          
          if (isEditMode && exists) {
            const existingEmployee = response.data.results[0];
            const isSameEmployee = existingEmployee.id === formData.id || 
                                 existingEmployee.email === formData.original_email;
            setEmailStatus({ 
              checking: false, 
              available: isSameEmployee 
            });
          } else {
            setEmailStatus({ 
              checking: false, 
              available: !exists 
            });
          }
        } catch (error) {
          console.error('Error checking email:', error);
          setEmailStatus({ checking: false, available: null });
        }
      }, 1000);

      setValidationTimer(timer);
    } else {
      setEmailStatus({ checking: false, available: null });
    }

    return () => {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
    };
  }, [formData.email, formData._email_changed, isEditMode, formData.id, formData.original_email]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email' && isEditMode && value !== formData.original_email) {
      handleInputChange({ target: { name: '_email_changed', value: true } });
    }
    
    handleInputChange(e);
  };

  const getEmailValidationIcon = () => {
    if (emailStatus.checking) {
      return <Loader size={14} className="text-almet-sapphire animate-spin" />;
    }
    if (emailStatus.available === true) {
      return <CheckCircle size={14} className="text-green-500" />;
    }
    if (emailStatus.available === false) {
      return <AlertCircle size={14} className="text-red-500" />;
    }
    return null;
  };

  const getEmailHelpText = () => {
    if (isEditMode && !formData._email_changed) {
      return "Current email";
    }
    if (emailStatus.checking) {
      return "Checking availability...";
    }
    if (emailStatus.available === true) {
      return "Email available";
    }
    if (emailStatus.available === false) {
      return "Email already exists";
    }
    return "Business email address";
  };

  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" }
  ];

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className={`text-base font-semibold ${textPrimary}`}>
          Basic Information
        </h2>
        <div className="text-[10px] px-2 py-0.5 bg-almet-sapphire/10 text-almet-sapphire rounded-full font-medium">
          Step 1 of 4
        </div>
      </div>

      {/* AUTO-ASSIGNMENT NOTICE */}
      {!isEditMode && (
        <div className={`${bgCard} border border-green-200 dark:border-green-800 rounded-lg p-2.5`}>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-0.5">
                Employee ID Auto-Assignment
              </p>
              <p className="text-[11px] text-green-700 dark:text-green-400">
                Employee ID will be automatically assigned after creation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ESSENTIAL INFORMATION */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Mail size={14} className="text-almet-sapphire" />
          <h3 className={`text-xs font-semibold ${textSecondary}`}>
            Essential Information
          </h3>
        </div>
        
        <div className="relative">
          <FormField
            label="Email Address"
            name="email"
            value={formData.email || ""}
            onChange={handleFieldChange}
            type="email"
            required={true}
            placeholder="john.doe@company.com"
            icon={<Mail size={14} />}
            validationError={
              validationErrors.email || 
              (emailStatus.available === false ? "Email already exists" : null)
            }
            helpText={getEmailHelpText()}
          />
          <div className="absolute top-6 right-2.5 flex items-center">
            {getEmailValidationIcon()}
          </div>
        </div>
      </div>

      {/* PERSONAL INFORMATION */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <User size={14} className="text-almet-steel-blue" />
          <h3 className={`text-xs font-semibold ${textSecondary}`}>
            Personal Information
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5">
          <FormField
            label="First Name"
            name="first_name"
            value={formData.first_name || ""}
            onChange={handleInputChange}
            required={true}
            placeholder="John"
            icon={<User size={14} />}
            validationError={validationErrors.first_name}
            helpText="Given name"
          />

          <FormField
            label="Last Name"
            name="last_name"
            value={formData.last_name || ""}
            onChange={handleInputChange}
            required={true}
            placeholder="Doe"
            icon={<User size={14} />}
            validationError={validationErrors.last_name}
            helpText="Family name"
          />
        </div>

        <FormField
          label="Father Name"
          name="father_name"
          value={formData.father_name || ""}
          onChange={handleInputChange}
          placeholder="Father's full name"
          icon={<User size={14} />}
          validationError={validationErrors.father_name}
          helpText="Optional field"
        />

        <div className="grid grid-cols-3 gap-2.5">
          <FormField
            label="Phone"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            type="tel"
            placeholder="+XX XX XXX XX XX"
            icon={<Phone size={14} />}
            validationError={validationErrors.phone}
            helpText="Contact number"
          />

          <FormField
            label="Date of Birth"
            name="date_of_birth"
            value={formData.date_of_birth || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} />}
            validationError={validationErrors.date_of_birth}
            helpText="For age calculation"
          />

          <FormField
            label="Gender"
            name="gender"
            value={formData.gender || ""}
            onChange={handleInputChange}
            type="select"
            options={genderOptions}
            icon={<User size={14} />}
            validationError={validationErrors.gender}
            helpText="Optional"
            placeholder="Select"
          />
        </div>

        <FormField
          label="Address"
          name="address"
          value={formData.address || ""}
          onChange={handleInputChange}
          type="textarea"
          placeholder="Complete address with city..."
          icon={<MapPin size={14} />}
          validationError={validationErrors.address}
          helpText="Full residential address"
          rows={2}
        />

        <FormField
          label="Emergency Contact"
          name="emergency_contact"
          value={formData.emergency_contact || ""}
          onChange={handleInputChange}
          placeholder="Name: Relationship: Phone"
          icon={<Phone size={14} />}
          validationError={validationErrors.emergency_contact}
          helpText="Emergency contact information"
        />
      </div>

      {/* VALIDATION SUMMARY */}
      {Object.keys(validationErrors).length > 0 && (
        <div className={`${bgCard} border border-red-200 dark:border-red-800 rounded-lg p-2.5`}>
          <div className="flex items-start gap-2 mb-1.5">
            <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <h4 className="text-xs font-medium text-red-800 dark:text-red-300">
              Please Fix These Issues:
            </h4>
          </div>
          <ul className="text-[11px] text-red-700 dark:text-red-400 space-y-0.5 ml-5">
            {Object.entries(validationErrors).map(([field, error]) => (
              <li key={field} className="flex items-start gap-1.5">
                <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>
                  <strong className="font-medium">
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                  </strong> {error}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FormStep1BasicInfo;