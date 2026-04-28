import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// Mock data for when backend is not configured
const MOCK_POSTS = [
  {
    id: '1',
    media_url: 'https://picsum.photos/seed/adeen1/800/1200',
    type: 'image',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    metadata: { title: 'Mountain Sunrise', description: 'Beautiful morning light', youtube_url: '' },
    likes: 42,
    views: 128,
    last_seen: new Date(Date.now() - 1800000).toISOString(),
    time_viewed: 47,
  },
  {
    id: '2',
    media_url: 'https://picsum.photos/seed/adeen2/800/1200',
    type: 'image',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    metadata: { title: 'City Lights', description: 'Night photography', youtube_url: '' },
    likes: 87,
    views: 256,
    last_seen: new Date(Date.now() - 900000).toISOString(),
    time_viewed: 120,
  },
  {
    id: '3',
    media_url: 'https://picsum.photos/seed/adeen3/800/1200',
    type: 'image',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    metadata: { title: 'Ocean Waves', description: 'Peaceful seascape', youtube_url: '' },
    likes: 63,
    views: 189,
    last_seen: new Date(Date.now() - 600000).toISOString(),
    time_viewed: 83,
  },
  {
    id: '4',
    media_url: 'https://picsum.photos/seed/adeen4/800/1200',
    type: 'image',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    metadata: { title: 'Forest Path', description: 'Autumn walk', youtube_url: '' },
    likes: 29,
    views: 95,
    last_seen: new Date(Date.now() - 300000).toISOString(),
    time_viewed: 34,
  },
  {
    id: '5',
    media_url: 'https://picsum.photos/seed/adeen5/800/1200',
    type: 'image',
    created_at: new Date(Date.now() - 18000000).toISOString(),
    metadata: { title: 'Desert Dunes', description: 'Sahara expedition', youtube_url: '' },
    likes: 114,
    views: 342,
    last_seen: new Date(Date.now() - 120000).toISOString(),
    time_viewed: 201,
  },
]

const USE_MOCK = !import.meta.env.VITE_API_URL

if (USE_MOCK) {
  console.warn('[Adeen] VITE_API_URL is not set — running in mock mode with sample data.')
}

function withMockFallback(fn, mockResult) {
  if (USE_MOCK) return Promise.resolve(mockResult)
  return fn()
}

export const getPosts = (params = {}) =>
  withMockFallback(
    () => api.get('/posts', { params }).then((r) => r.data),
    { posts: MOCK_POSTS, total: MOCK_POSTS.length }
  )

export const getPost = (id) =>
  withMockFallback(
    () => api.get(`/posts/${id}`).then((r) => r.data),
    MOCK_POSTS.find((p) => p.id === id) || MOCK_POSTS[0]
  )

export const searchPosts = (query) =>
  withMockFallback(
    () => api.get('/posts/search', { params: { q: query } }).then((r) => r.data),
    {
      posts: MOCK_POSTS.filter(
        (p) =>
          p.metadata?.title?.toLowerCase().includes(query.toLowerCase()) ||
          p.metadata?.description?.toLowerCase().includes(query.toLowerCase())
      ),
    }
  )

export const likePost = (id) =>
  withMockFallback(
    () => api.post(`/posts/${id}/like`).then((r) => r.data),
    { success: true }
  )

export const viewPost = (id, timeViewed) =>
  withMockFallback(
    () => api.post(`/posts/${id}/view`, { timeViewed }).then((r) => r.data),
    { success: true }
  )

export const updatePost = (id, data) =>
  withMockFallback(
    () => api.put(`/posts/${id}`, data).then((r) => r.data),
    { success: true }
  )

export const deletePost = (id) =>
  withMockFallback(
    () => api.delete(`/posts/${id}`).then((r) => r.data),
    { success: true }
  )

export const uploadMedia = (formData, onProgress) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  }).then((r) => r.data)

export { MOCK_POSTS }
export default api
