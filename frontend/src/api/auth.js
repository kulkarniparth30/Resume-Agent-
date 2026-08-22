import client from './client';

export const login = async (email, password) => {
  const response = await client.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  if (response.data.user) {
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (email, password, name) => {
  const response = await client.post('/auth/signup', { email, password, name });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  if (response.data.user) {
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await client.get('/auth/me');
  if (response.data.user) {
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
  }
  return response.data.user;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('auth_user');
};

export const fetchHistory = async () => {
  const response = await client.get('/history');
  return response.data;
};

export const saveHistory = async ({ jobRole, jdText, resumeText, analysisResult }) => {
  const response = await client.post('/history', {
    job_role: jobRole,
    jd_text: jdText || '',
    resume_text: resumeText || '',
    analysis_result: analysisResult,
  });
  return response.data;
};

export const deleteHistory = async (analysisId) => {
  const response = await client.delete(`/history/${analysisId}`);
  return response.data;
};
