import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucket = process.env.R2_BUCKET_NAME || 'adeen-media'
const publicUrl = process.env.R2_PUBLIC_URL || ''

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.warn('[R2] Missing env vars — file uploads will fail.')
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId || 'placeholder'}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || 'placeholder',
    secretAccessKey: secretAccessKey || 'placeholder',
  },
})

export async function uploadToR2(key, body, contentType) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  })
  await r2.send(cmd)
  return publicUrl ? `${publicUrl}/${key}` : `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${key}`
}

export async function deleteFromR2(key) {
  const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key })
  await r2.send(cmd)
}

export { r2, bucket }
