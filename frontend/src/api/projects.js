import client from './client';

export const fetchProjectGuide = async (name, description, skills) => {
  const response = await client.post('/projects/guide', {
    name,
    description,
    skills,
  });
  return response.data;
};
