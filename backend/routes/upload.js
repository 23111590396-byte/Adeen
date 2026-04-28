import express from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { uploadToR2 } from '../lib/r2.js'
import supabase from '../lib/supabase.js'

const router = express.Router()

// Store in memory buffer (max 55MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 55 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Unsupported file type.'))
    }
  },
})

// POST /api/upload
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided.' })
    }

    const { title = '', description = '', youtube_url = '' } = req.body
    const ext = path.extname(req.file.originalname) || (req.file.mimetype.startsWith('video/') ? '.mp4' : '.jpg')
    const key = `media/${uuidv4()}${ext}`
    const isVideo = req.file.mimetype.startsWith('video/')

    // Upload to R2
    const mediaUrl = await uploadToR2(key, req.file.buffer, req.file.mimetype)

    // Create post record in Supabase
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        media_url: mediaUrl,
        type: isVideo ? 'video' : 'image',
        metadata: { title, description, youtube_url, r2_key: key },
      })
      .select()
      .single()

    if (error) throw error

    // Initialize interactions
    await supabase.from('interactions').insert({ post_id: post.id })

    res.status(201).json({ success: true, post })
  } catch (err) {
    next(err)
  }
})

export default router
