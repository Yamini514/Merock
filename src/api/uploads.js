import { api } from './client'

// Uploads one or more image files to S3 and returns their public URLs.
export function uploadFiles(files) {
  const formData = new FormData()
  Array.from(files).forEach(f => formData.append('files[]', f))
  return api.upload('/uploads', formData).then(r => r.data)
}
