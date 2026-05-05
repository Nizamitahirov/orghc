"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  Loader,
  Check,
  AlertCircle,
  Trash2,
  Download,
  ImagePlus,
} from "lucide-react";
import { useTheme } from "@/components/common/ThemeProvider";
import { useEmployees } from "@/hooks/useEmployees";

const EmployeeProfilePhotoManager = ({
  employeeId,
  currentPhotoUrl,
  employeeName,
  onPhotoUpdate,
  editable = true,
  size = "lg",
  className = "",
}) => {
  const { darkMode } = useTheme();
  const {
    uploadProfilePhoto,
    deleteProfilePhoto,
    profilePhotoLoading,
    profilePhotoError,
    profilePhotoSuccess,
    clearProfilePhotoError,
    clearProfilePhotoSuccess,
  } = useEmployees();

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localError, setLocalError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentPhotoUrl);
  const [isDragOver, setIsDragOver] = useState(false);

  const btnSecondary = darkMode
    ? "bg-almet-comet hover:bg-almet-san-juan text-almet-bali-hai border border-almet-comet"
    : "bg-white hover:bg-almet-mystic text-almet-waterloo border border-gray-300";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";

  const sizeConfig = {
    sm: { photo: "w-12 h-12", text: "text-sm", icon: 12 },
    md: { photo: "w-16 h-16", text: "text-base", icon: 16 },
    lg: { photo: "w-20 h-20", text: "text-lg", icon: 20 },
    xl: { photo: "w-24 h-24", text: "text-xl", icon: 24 },
  };
  const config = sizeConfig[size];

  const getInitials = (name) => {
    if (!name) return "NA";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0);
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
  };

  useEffect(() => { setPreviewUrl(currentPhotoUrl); }, [currentPhotoUrl]);

  useEffect(() => {
    if (profilePhotoSuccess) {
      setLocalError(null);
      setTimeout(() => clearProfilePhotoSuccess(), 3000);
    }
  }, [profilePhotoSuccess, clearProfilePhotoSuccess]);

  useEffect(() => {
    if (profilePhotoError) setLocalError(profilePhotoError);
  }, [profilePhotoError]);

  useEffect(() => {
    if (profilePhotoLoading) { setLocalError(null); clearProfilePhotoError(); }
  }, [profilePhotoLoading, clearProfilePhotoError]);

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"];
    if (!allowedTypes.includes(file.type)) return "Please select a valid image file (JPG, PNG, GIF, BMP, WebP)";
    if (file.size > maxSize) return "File size must be less than 5MB";
    return null;
  };

  const processFile = useCallback((file) => {
    if (!file) return;
    setLocalError(null);
    const err = validateFile(file);
    if (err) { setLocalError(err); return; }

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
    handleUpload(file);
  }, []);

  const handleFileSelect = (e) => processFile(e.target.files[0]);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) { clearInterval(progressInterval); return prev; }
          return prev + 10;
        });
      }, 100);

      const result = await uploadProfilePhoto(employeeId, file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.type.endsWith("/fulfilled")) {
        const newUrl = result.payload?.data?.profile_image_url || result.payload?.data?.profile_image;
        setPreviewUrl(newUrl);
        onPhotoUpdate?.(newUrl);
      } else {
        throw new Error(result.payload?.message || "Upload failed");
      }
    } catch (error) {
      setLocalError(error.message || "Failed to upload profile photo.");
      setPreviewUrl(currentPhotoUrl);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this profile photo?")) return;
    setIsDeleting(true);
    try {
      const result = await deleteProfilePhoto(employeeId);
      if (result.type.endsWith("/fulfilled")) {
        setPreviewUrl(null);
        onPhotoUpdate?.(null);
      } else throw new Error(result.payload?.message || "Delete failed");
    } catch (error) {
      setLocalError(error.message || "Failed to delete profile photo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `${employeeName || "employee"}_profile_photo`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag & drop handlers
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); if (editable && !isLoading) setIsDragOver(true); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!editable || isLoading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const isLoading = profilePhotoLoading || isUploading || isDeleting;
  const currentError = localError || profilePhotoError;

  return (
    <div className={`relative group ${className}`}>
      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative"
      >
        {/* Drop overlay */}
        {isDragOver && editable && (
          <div className="absolute inset-0 z-20 rounded-xl bg-almet-sapphire/20 dark:bg-almet-steel-blue/20 border-2 border-dashed border-almet-sapphire dark:border-almet-steel-blue flex items-center justify-center pointer-events-none">
            <ImagePlus size={20} className="text-almet-sapphire dark:text-almet-steel-blue" />
          </div>
        )}

        {/* Profile photo */}
        <div className={`relative ${config.photo} mx-auto`}>
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt={employeeName}
                className="w-full h-full rounded-xl object-cover border-2 border-white/30 shadow-lg"
                onError={() => setPreviewUrl(null)}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="w-6 h-6 text-white animate-spin mx-auto mb-2" />
                    <div className="text-white text-xs font-medium">
                      {uploadProgress > 0 ? `${uploadProgress}%` : "Loading..."}
                    </div>
                  </div>
                </div>
              )}
              {profilePhotoSuccess && !isLoading && (
                <div className="absolute inset-0 bg-green-500/80 rounded-xl flex items-center justify-center animate-pulse">
                  <Check className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center text-white border-2 border-white/30 shadow-lg">
              {isLoading ? (
                <div className="text-center">
                  <Loader className="w-6 h-6 animate-spin mx-auto mb-1" />
                  <div className="text-xs font-medium">
                    {uploadProgress > 0 ? `${uploadProgress}%` : "Loading..."}
                  </div>
                </div>
              ) : (
                <span className={`font-bold ${config.text}`}>{getInitials(employeeName)}</span>
              )}
            </div>
          )}

          {/* Hover action buttons */}
          {editable && !isLoading && (
            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-almet-sapphire hover:bg-almet-astral rounded-lg text-white transition-all duration-200 hover:scale-110"
                  title="Upload new photo"
                >
                  <Upload size={14} />
                </button>
                {previewUrl && (
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-all duration-200 hover:scale-110"
                    title="Download photo"
                  >
                    <Download size={14} />
                  </button>
                )}
                {previewUrl && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all duration-200 hover:scale-110 disabled:opacity-50"
                    title="Delete photo"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/bmp,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error */}
      {currentError && (
        <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-300 text-xs">{currentError}</p>
          </div>
        </div>
      )}

      {/* Success */}
      {profilePhotoSuccess && !currentError && (
        <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-300 text-xs">Profile photo updated successfully!</p>
          </div>
        </div>
      )}

      {/* Upload button + drag hint (no photo, lg size) */}
      {editable && !previewUrl && !isLoading && size === "lg" && (
        <div className="mt-2 text-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`${btnSecondary} px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-2 hover:scale-105 transition-all duration-200`}
          >
            <Camera size={12} />
            Add Photo
          </button>
          <p className={`${textMuted} text-[10px] mt-1`}>
            JPG, PNG, GIF, WebP · max 5MB · or drag & drop
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfilePhotoManager;
