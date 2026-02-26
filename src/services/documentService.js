// services/documentService.js - Updated for New URL Structure

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DOCUMENTS_BASE = `${API_URL}/documents`; // Base URL: /api/documents/

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const getMultipartHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const documentService = {
  // ==================== COMPANIES ====================
  // Base: /api/documents/companies/
  
  getCompanies: async () => {
    const response = await fetch(`${DOCUMENTS_BASE}/companies/?is_active=true`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch companies');
    return response.json();
  },

  getCompany: async (id) => {
    const response = await fetch(`${DOCUMENTS_BASE}/companies/${id}/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch company');
    return response.json();
  },

  createCompany: async (data) => {
    const response = await fetch(`${DOCUMENTS_BASE}/companies/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create company');
    return response.json();
  },

  updateCompany: async (id, data) => {
    const response = await fetch(`${DOCUMENTS_BASE}/companies/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update company');
    return response.json();
  },

  deleteCompany: async (id) => {
    const response = await fetch(`${DOCUMENTS_BASE}/companies/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete company');
    return true;
  },

  getCompanyFolders: async (companyId) => {
    const response = await fetch(`${DOCUMENTS_BASE}/companies/${companyId}/folders/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch company folders');
    return response.json();
  },

  // ==================== FOLDERS ====================
  // Base: /api/documents/folders/
  
  getFolders: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${DOCUMENTS_BASE}/folders/?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch folders');
    return response.json();
  },

  getFolder: async (id) => {
    const response = await fetch(`${DOCUMENTS_BASE}/folders/${id}/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch folder');
    return response.json();
  },

  createFolder: async (data) => {
    const response = await fetch(`${DOCUMENTS_BASE}/folders/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create folder');
    return response.json();
  },

  updateFolder: async (id, data) => {
    const response = await fetch(`${DOCUMENTS_BASE}/folders/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update folder');
    return response.json();
  },

  deleteFolder: async (id) => {
    const response = await fetch(`${DOCUMENTS_BASE}/folders/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete folder');
    return true;
  },

  getFoldersByCompany: async (companyId) => {
    const response = await fetch(`${DOCUMENTS_BASE}/folders/by-company/${companyId}/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch folders by company');
    return response.json();
  },

  getFolderDocuments: async (folderId) => {
  // This should call: /api/documents/folders/{id}/documents/
  const response = await fetch(`${DOCUMENTS_BASE}/folders/${folderId}/documents/`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('getFolderDocuments error:', errorText);
    throw new Error('Failed to fetch folder documents');
  }
  
  const data = await response.json();

  
  // Return the data as-is (should be array from backend)
  return data;
},


  // ==================== DOCUMENTS (FILES) ====================
  // Base: /api/documents/files/
  
  getDocuments: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${DOCUMENTS_BASE}/files/?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  getDocument: async (id) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/${id}/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch document');
    return response.json();
  },

  createDocument: async (formData) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/`, {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create document');
    }
    return response.json();
  },

  updateDocument: async (id, formData) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/${id}/`, {
      method: 'PUT',
      headers: getMultipartHeaders(),
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update document');
    }
    return response.json();
  },

  deleteDocument: async (id) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete document');
    return true;
  },

  getDocumentsByFolder: async (folderId) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/by-folder/${folderId}/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch documents by folder');
    return response.json();
  },

  getDocumentsByType: async (docType) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/by-type/${docType}/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch documents by type');
    return response.json();
  },

  trackView: async (id) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/${id}/view/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to track view');
    return response.json();
  },

  trackDownload: async (id) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/${id}/download/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to track download');
    return response.json();
  },

  archiveDocument: async (id) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/${id}/archive/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to archive document');
    return response.json();
  },

  unarchiveDocument: async (id) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/${id}/unarchive/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to unarchive document');
    return response.json();
  },

  getRecentDocuments: async (limit = 10) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/recent/?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch recent documents');
    return response.json();
  },

  getPopularDocuments: async (limit = 10) => {
    const response = await fetch(`${DOCUMENTS_BASE}/files/popular/?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch popular documents');
    return response.json();
  },

  // ==================== STATISTICS ====================
  // Base: /api/documents/statistics/
  
  getStatistics: async () => {
    const response = await fetch(`${DOCUMENTS_BASE}/statistics/overview/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  },

  // ==================== SEARCH ====================
  
  searchDocuments: async (query, filters = {}) => {
    const params = new URLSearchParams({
      search: query,
      ...filters
    });
    
    const response = await fetch(`${DOCUMENTS_BASE}/files/?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to search documents');
    return response.json();
  },
};

/*
URL STRUCTURE:
==============

Base: /api/documents/

Companies:
  GET    /api/documents/companies/
  GET    /api/documents/companies/{id}/
  POST   /api/documents/companies/
  PUT    /api/documents/companies/{id}/
  DELETE /api/documents/companies/{id}/
  GET    /api/documents/companies/{id}/folders/

Folders:
  GET    /api/documents/folders/
  GET    /api/documents/folders/{id}/
  POST   /api/documents/folders/
  PUT    /api/documents/folders/{id}/
  DELETE /api/documents/folders/{id}/
  GET    /api/documents/folders/{id}/documents/
  GET    /api/documents/folders/by-company/{company_id}/

Files (Documents):
  GET    /api/documents/files/
  GET    /api/documents/files/{id}/
  POST   /api/documents/files/
  PUT    /api/documents/files/{id}/
  DELETE /api/documents/files/{id}/
  POST   /api/documents/files/{id}/view/
  POST   /api/documents/files/{id}/download/
  POST   /api/documents/files/{id}/archive/
  POST   /api/documents/files/{id}/unarchive/
  GET    /api/documents/files/by-folder/{folder_id}/
  GET    /api/documents/files/by-type/{doc_type}/
  GET    /api/documents/files/recent/
  GET    /api/documents/files/popular/

Statistics:
  GET    /api/documents/statistics/overview/
*/