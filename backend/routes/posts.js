import express from 'express'
import supabase from '../lib/supabase.js'

const router = express.Router()

// GET /api/posts - list all posts with interaction data
router.get('/', async (req, res, next) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        interactions (likes, views, last_seen, time_viewed)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const normalized = (posts || []).map((p) => {
      const interaction = p.interactions?.[0] || {}
      return {
        ...p,
        likes: interaction.likes || 0,
        views: interaction.views || 0,
        last_seen: interaction.last_seen,
        time_viewed: interaction.time_viewed || 0,
        interactions: undefined,
      }
    })

    res.json({ posts: normalized, total: normalized.length })
  } catch (err) {
    next(err)
  }
})

// GET /api/posts/search - search posts
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q) return res.json({ posts: [] })

    const { data, error } = await supabase
      .from('posts')
      .select('*, interactions (likes, views, last_seen, time_viewed)')
      .or(`metadata->>title.ilike.%${q}%,metadata->>description.ilike.%${q}%`)
      .order('created_at', { ascending: false })

    if (error) throw error

    const posts = (data || []).map((p) => {
      const interaction = p.interactions?.[0] || {}
      return { ...p, likes: interaction.likes || 0, views: interaction.views || 0, interactions: undefined }
    })

    res.json({ posts })
  } catch (err) {
    next(err)
  }
})

// GET /api/posts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, interactions (likes, views, last_seen, time_viewed)')
      .eq('id', req.params.id)
      .single()

    if (error || !data) return res.status(404).json({ error: 'Post not found' })

    const interaction = data.interactions?.[0] || {}
    res.json({
      ...data,
      likes: interaction.likes || 0,
      views: interaction.views || 0,
      last_seen: interaction.last_seen,
      time_viewed: interaction.time_viewed || 0,
      interactions: undefined,
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/posts/:id/like
router.post('/:id/like', async (req, res, next) => {
  try {
    const { id } = req.params
    const { data: existing } = await supabase
      .from('interactions')
      .select('id, likes')
      .eq('post_id', id)
      .single()

    if (existing) {
      await supabase
        .from('interactions')
        .update({ likes: (existing.likes || 0) + 1 })
        .eq('id', existing.id)
    } else {
      await supabase.from('interactions').insert({ post_id: id, likes: 1 })
    }

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// POST /api/posts/:id/view
router.post('/:id/view', async (req, res, next) => {
  try {
    const { id } = req.params
    const { timeViewed = 0 } = req.body

    const { data: existing } = await supabase
      .from('interactions')
      .select('id, views, time_viewed')
      .eq('post_id', id)
      .single()

    if (existing) {
      await supabase
        .from('interactions')
        .update({
          views: (existing.views || 0) + 1,
          time_viewed: (existing.time_viewed || 0) + timeViewed,
          last_seen: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('interactions').insert({
        post_id: id,
        views: 1,
        time_viewed: timeViewed,
        last_seen: new Date().toISOString(),
      })
    }

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// PUT /api/posts/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { metadata } = req.body
    const { data, error } = await supabase
      .from('posts')
      .update({ metadata })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/posts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
