import client from './client';

export const analyseResume = async ({ resume_text, job_role, jd_text, manual_skills }) => {
  const response = await client.post('/analyse', {
    resume_text,
    job_role,
    jd_text,
    manual_skills,
  });
  return response.data;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

export const rankMultipleResumes = async (resumes, jd_text, job_role) => {
  const response = await client.post('/analyse/rank-multiple', {
    resumes,
    jd_text,
    job_role,
  });
  return response.data;
};

export const getJobs = async (role, location) => {
  const response = await client.get('/jobs', {
    params: { role, location },
  });
  return response.data;
};
