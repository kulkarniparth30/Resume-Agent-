import client from './client';

export const fetchLearnResources = async (skill, jobRole, userLevel = 'intermediate') => {
  const response = await client.post('/learn/resources', {
    skill,
    job_role: jobRole,
    user_level: userLevel,
  });
  return response.data;
};
