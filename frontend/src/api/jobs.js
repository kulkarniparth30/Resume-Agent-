import client from './client';

export const fetchJobs = async (role, location = 'India', skills = []) => {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (location) params.set('location', location);
  if (skills.length > 0) params.set('skills', skills.join(','));
  const response = await client.get(`/jobs?${params.toString()}`);
  return response.data;
};
