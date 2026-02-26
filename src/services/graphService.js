// src/services/graphService.js
import { graphConfig } from "@/auth/authConfig";

/**
 * Graph API-dən məlumat əldə etmək üçün yardımçı funksiya
 * @param {string} endpoint - Graph API endpoint URL
 * @param {string} accessToken - Microsoft accessToken
 * @returns {Promise<object>} API response
 */
export async function callMsGraph(endpoint, accessToken) {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);

  const options = {
    method: 'GET',
    headers: headers
  };

  try {
    const response = await fetch(endpoint, options);
    return await response.json();
  } catch (error) {
    console.error('Error calling MS Graph API:', error);
    throw error;
  }
}

/**
 * Cari istifadəçinin profilini əldə etmək üçün funksiya
 * @param {string} accessToken - Microsoft accessToken
 * @returns {Promise<object>} User profile
 */
export async function getUserProfile(accessToken) {
  return callMsGraph(graphConfig.graphMeEndpoint, accessToken);
}

/**
 * Cari istifadəçinin e-poçtlarını əldə etmək üçün funksiya
 * @param {string} accessToken - Microsoft accessToken
 * @returns {Promise<object>} User emails
 */
export async function getUserEmails(accessToken) {
  return callMsGraph(graphConfig.graphMailEndpoint, accessToken);
}

/**
 * Təşkilatdakı istifadəçiləri əldə etmək üçün funksiya
 * @param {string} accessToken - Microsoft accessToken
 * @returns {Promise<object>} Users list
 */
export async function getOrganizationUsers(accessToken) {
  return callMsGraph(graphConfig.graphUsersEndpoint, accessToken);
}