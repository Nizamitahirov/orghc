// src/app/login/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/common/ThemeProvider";
import { LANGUAGES } from "@/i18n";

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Login() {
  const { login, isAuthenticated, loading, authError, isLoggingIn } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    if (isLoggingIn || hasAttemptedLogin) return;
    setHasAttemptedLogin(true);
    try {
      await login();
    } catch (error) {
      console.error("Login attempt failed:", error);
    } finally {
      setTimeout(() => { setHasAttemptedLogin(false); }, 3000);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="h-screen bg-almet-mystic dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-almet-sapphire mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('auth.redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-almet-mystic dark:bg-gray-900 overflow-hidden">
      {/* Top-right controls: language + theme toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full shadow-md px-2 py-1.5">
        {Object.values(LANGUAGES).map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            title={lang.nativeLabel}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
              language === lang.code
                ? 'bg-almet-sapphire text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-almet-sapphire dark:hover:text-white'
            }`}
          >
            {lang.code}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1"></div>
        <button
          onClick={toggleTheme}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-300 hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-all duration-200"
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="flex h-full">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-almet-mystic to-gray-50 dark:from-gray-900 dark:to-almet-cloud-burst">
          {/* Geometric decoration */}
          <div className="absolute inset-0 opacity-30 dark:opacity-20">
            <div className="absolute top-20 left-20 w-16 h-16 bg-almet-sapphire rounded-full"></div>
            <div className="absolute top-32 right-24 w-12 h-12 bg-almet-sapphire rounded-lg rotate-45"></div>
            <div className="absolute bottom-32 left-24 w-20 h-20 bg-almet-sapphire rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-14 h-14 bg-almet-sapphire rounded-lg -rotate-12"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
            <div className="text-center max-w-lg">
              <div className="mb-8">
                <img
                  src="https://paybooks.in/wp-content/uploads/2023/12/Demystifying-HRIS-The-Essential-Guide-to-Maximizing-Efficiency-and-Streamlining-HR-Operations.png"
                  alt="HR Management System"
                  className="w-full h-56 object-cover rounded-2xl shadow-2xl mx-auto"
                />
              </div>

              <h1 className="text-3xl font-bold text-almet-sapphire dark:text-white mb-4 leading-tight">
                {t('auth.manageTeam')}
              </h1>

              <p className="text-lg text-gray-600 dark:text-almet-bali-hai mb-6 leading-relaxed">
                {t('auth.systemDescription')}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-center text-gray-700 dark:text-almet-bali-hai">
                  <div className="w-2 h-2 bg-almet-sapphire rounded-full mr-3"></div>
                  <span className="font-medium">{t('auth.employeeManagement')}</span>
                </div>
                <div className="flex items-center justify-center text-gray-700 dark:text-almet-bali-hai">
                  <div className="w-2 h-2 bg-almet-sapphire rounded-full mr-3"></div>
                  <span className="font-medium">{t('auth.performanceAnalytics')}</span>
                </div>
                <div className="flex items-center justify-center text-gray-700 dark:text-almet-bali-hai">
                  <div className="w-2 h-2 bg-almet-sapphire rounded-full mr-3"></div>
                  <span className="font-medium">{t('auth.securePlatform')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-almet-cloud-burst">
          <div className="w-full max-w-md px-8">

            {/* Mobile Image */}
            <div className="lg:hidden mb-6 text-center">
              <img
                src="https://paybooks.in/wp-content/uploads/2023/12/Demystifying-HRIS-The-Essential-Guide-to-Maximizing-Efficiency-and-Streamlining-HR-Operations.png"
                alt="HR System"
                className="w-full h-32 object-cover rounded-xl mb-4 shadow-lg"
              />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-almet-cloud-burst dark:text-white mb-3">
                {t('auth.welcomeBack')}
              </h2>
              <p className="text-gray-600 dark:text-almet-bali-hai text-lg">
                {t('auth.signIn')}
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center text-red-800 dark:text-red-200">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{t('auth.errorPrefix')} {authError}</span>
                </div>
              </div>
            )}

            {/* Signing in progress */}
            {isLoggingIn && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center text-blue-800 dark:text-blue-200">
                  <div className="w-5 h-5 mr-2 flex-shrink-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm font-medium">{t('auth.signingInWait')}</span>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoggingIn || loading || hasAttemptedLogin}
              className="w-full flex items-center justify-center px-6 py-4 text-white bg-almet-sapphire hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:ring-offset-2 dark:focus:ring-offset-almet-cloud-burst disabled:transform-none disabled:shadow-lg"
            >
              {isLoggingIn || loading ? (
                <>
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>{t('auth.signingIn')}</span>
                </>
              ) : hasAttemptedLogin ? (
                <>
                  <div className="mr-3 h-5 w-5 animate-pulse rounded-full border-2 border-white"></div>
                  <span>{t('auth.pleaseWait')}</span>
                </>
              ) : (
                <>
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.5 3v8.5H3V3h8.5zm9 0v8.5h-8.5V3H20.5zM11.5 12.5v8.5H3v-8.5h8.5zm9 0v8.5h-8.5v-8.5H20.5z"/>
                  </svg>
                  <span>{t('auth.signInWithMicrosoft')}</span>
                </>
              )}
            </button>

            {/* Retry Button */}
            {authError && !isLoggingIn && (
              <button
                onClick={() => window.location.reload()}
                className="w-full mt-3 flex items-center justify-center px-6 py-3 text-almet-sapphire bg-transparent border border-almet-sapphire hover:bg-almet-sapphire hover:text-white font-medium rounded-xl transition-all duration-300 dark:text-almet-steel-blue dark:border-almet-steel-blue dark:hover:bg-almet-sapphire dark:hover:text-white"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('auth.refreshTryAgain')}
              </button>
            )}

            {/* Security Notice */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-almet-bali-hai">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>{t('auth.secure')}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{t('auth.trusted')}</span>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-almet-bali-hai">
                {t('auth.needHelp')}
              </p>
              {authError && authError.includes("interaction_in_progress") && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  {t('auth.ifProblemPersists')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
