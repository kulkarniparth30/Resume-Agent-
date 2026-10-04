import client from './client';

export const fetchJobs = async (role, location = 'India', skills = [], userId = '') => {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (location) params.set('location', location);
  if (skills.length > 0) params.set('skills', skills.join(','));
  if (userId) params.set('user_id', userId);
  const response = await client.get(`/jobs?${params.toString()}`);
  return response.data;
};

export const autoApplyToJob = async ({ userId, jobTitle, company, jobUrl = '', jobSkills = [] }) => {
  const response = await client.post('/jobs/auto-apply', {
    user_id: userId,
    job_title: jobTitle,
    company: company,
    job_url: jobUrl,
    job_skills: jobSkills,
  });
  return response.data;
};

export const fetchApplications = async (userId) => {
  const response = await client.get(`/jobs/applications/${userId}`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await client.patch(`/jobs/applications/${applicationId}/status`, { status });
  return response.data;
};

export const deleteApplication = async (applicationId) => {
  const response = await client.delete(`/jobs/applications/${applicationId}`);
  return response.data;
};
