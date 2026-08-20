import client from './client';

export const generateRoadmap = async ({ candidate_skills, skill_gaps, job_role, rank_score }) => {
  const response = await client.post('/roadmap/generate', {
    candidate_skills,
    skill_gaps,
    job_role,
    rank_score,
  });
  return response.data;
};
