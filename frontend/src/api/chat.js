import client, { API_BASE_URL } from './client';

export const sendChatMessage = async ({ userId, threadId, message }) => {
  const response = await client.post('/chat', {
    user_id: userId,
    thread_id: threadId,
    message,
  });
  return response.data;
};

export const sendChatMessageStream = async ({
  userId,
  threadId,
  message,
  onToken,
  onToolStart,
  onToolEnd,
  onDone,
  onError,
}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/chat/stream`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userId,
        thread_id: threadId,
        message,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep last incomplete fragment

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'token') {
              onToken?.(data.content);
            } else if (data.type === 'tool_start') {
              onToolStart?.(data.tool, data.input);
            } else if (data.type === 'tool_end') {
              onToolEnd?.(data.tool);
            } else if (data.type === 'done') {
              onDone?.(data);
            } else if (data.type === 'error') {
              onError?.(data.error);
            }
          } catch (pe) {
            console.warn('SSE parse error:', pe);
          }
        }
      }
    }
  } catch (err) {
    onError?.(err.message || 'Stream connection error');
  }
};

export const fetchUserProfile = async (userId) => {
  const response = await client.get(`/chat/profile/${userId}`);
  return response.data;
};

export const updateUserPreference = async (userId, key, value) => {
  const response = await client.post(`/chat/profile/${userId}/preference`, {
    key,
    value,
  });
  return response.data;
};
