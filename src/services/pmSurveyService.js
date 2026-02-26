// services/pmSurveyService.js

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Token Management
const TokenManager = {
  getAccessToken: () => typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null,
  setAccessToken: (token) => typeof window !== 'undefined' && localStorage.setItem("accessToken", token),
  removeTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
};

// Interceptors
api.interceptors.request.use((config) => {
  const token = TokenManager.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Build Query Params
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

// ===================== SURVEY QUESTIONS =====================
export const surveyQuestionService = {
  list: async (params = {}) => {
    const queryString = buildQueryParams(params);
    const response = await api.get(`/pm-survey/questions/?${queryString}`);
    return response.data;
  },
  
  getBySection: async () => {
    const response = await api.get('/pm-survey/questions/by_section/');
    return response.data;
  },
  
  get: async (id) => {
    const response = await api.get(`/pm-survey/questions/${id}/`);
    return response.data;
  }
};

// ===================== SURVEY RESPONSES =====================
export const surveyResponseService = {
  list: async (params = {}) => {
    const queryString = buildQueryParams(params);
    const response = await api.get(`/pm-survey/responses/?${queryString}`);
    return response.data;
  },
  
  get: async (id) => {
    const response = await api.get(`/pm-survey/responses/${id}/`);
    return response.data;
  },
  
  initialize: async (data) => {
    const response = await api.post('/pm-survey/responses/initialize/', data);
    return response.data;
  },
  
  getMySurvey: async (year) => {
    const params = year ? { year } : {};
    const queryString = buildQueryParams(params);
    const response = await api.get(`/pm-survey/responses/my_survey/?${queryString}`);
    return response.data;
  },
  
  saveAnswers: async (surveyId, answers) => {
    const response = await api.post(
      `/pm-survey/responses/${surveyId}/save_answers/`,
      { answers }
    );
    return response.data;
  },
  
  submit: async (surveyId) => {
    const response = await api.post(`/pm-survey/responses/${surveyId}/submit/`, {});
    return response.data;
  },
  
  getTeamSurveys: async (year) => {
    const params = year ? { year } : {};
    const queryString = buildQueryParams(params);
    const response = await api.get(`/pm-survey/responses/team_surveys/?${queryString}`);
    return response.data;
  }
};


// ===================== COMBINED EXPORT =====================
const pmSurveyApi = {
  questions: surveyQuestionService,
  responses: surveyResponseService,
};

export default pmSurveyApi;