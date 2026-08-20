import client from './client';

export const enhanceSection = async (sectionType, content, jdContext = '', jobRole = '') => {
  const response = await client.post('/ai/enhance', {
    section_type: sectionType,
    content,
    jd_context: jdContext,
    job_role: jobRole,
  });
  return response.data;
};

export const enhanceBullet = async (bullet, context = '') => {
  const response = await client.post('/ai/enhance-bullet', {
    bullet,
    context,
  });
  return response.data;
};
