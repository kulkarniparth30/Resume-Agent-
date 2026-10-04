import client from './client';

export const generateRoadmap = async ({ candidate_skills, skill_gaps, job_role, rank_score, user_id }) => {
  const response = await client.post('/roadmap/generate', {
    candidate_skills,
    skill_gaps,
    job_role,
    rank_score,
    user_id: user_id || 'default_user',
  });
  return response.data;
};

export const fetchSavedRoadmaps = async (userId = 'default_user') => {
  const response = await client.get(`/roadmap/saved/${encodeURIComponent(userId)}`);
  return response.data;
};

export const saveRoadmapApi = async ({ userId = 'default_user', role, roadmapData, rankScore = 50, timeline = '', title = '' }) => {
  const response = await client.post('/roadmap/save', {
    user_id: userId,
    role,
    roadmap_data: roadmapData,
    rank_score: rankScore,
    timeline,
    title,
  });
  return response.data;
};

export const deleteRoadmapApi = async (roadmapId, userId) => {
  const url = userId 
    ? `/roadmap/saved/${roadmapId}?user_id=${encodeURIComponent(userId)}`
    : `/roadmap/saved/${roadmapId}`;
  const response = await client.delete(url);
  return response.data;
};
