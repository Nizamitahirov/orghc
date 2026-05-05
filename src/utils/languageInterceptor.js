/**
 * Language interceptor for axios.
 * Call `setupLanguageInterceptor(api)` once with the axios instance from api.js.
 * It reads 'appLanguage' from localStorage on every request and sets:
 *   Accept-Language: az | en | ru
 *   X-Language:      az | en | ru
 * The backend reads X-Language (or Accept-Language) to localise API responses.
 */

let interceptorId = null;

export function setupLanguageInterceptor(axiosInstance) {
  // Remove any previously registered interceptor to avoid duplicates
  if (interceptorId !== null) {
    axiosInstance.interceptors.request.eject(interceptorId);
  }

  interceptorId = axiosInstance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const lang = localStorage.getItem('appLanguage') || 'en';
      config.headers['Accept-Language'] = lang;
      config.headers['X-Language'] = lang;
    }
    return config;
  });
}

export function updateLanguageHeader(axiosInstance, lang) {
  // Convenience: force a specific language (useful for testing)
  if (typeof window !== 'undefined') {
    localStorage.setItem('appLanguage', lang);
  }
  // The interceptor will pick it up on the next request automatically.
}
