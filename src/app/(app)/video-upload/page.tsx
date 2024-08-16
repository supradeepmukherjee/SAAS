'use client'

import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from 'react-hot-toast'

const VideoUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const max_size = 60 * 1024 * 1024
  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    if (file.size > max_size) return toast.error('Max. Size of video can be 60MB')
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('desc', desc)
    formData.append('origSize', file.size.toString())
    try {
      toast.dismiss()
      const toastId = toast.loading('Uploading Video. Please wait...')
      const { status } = await axios.post('/api/vid-upload', formData)
      if (status === 200) toast.success('Video Uploaded Successfully', { id: toastId })
      router.push('/')
    } catch (err) {
      toast.dismiss()
      console.log(err)
      toast.error('Failed to upload video')
    } finally {
      setIsUploading(false)
    }
  }
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Upload Video
      </h1>
      <form onSubmit={submitHandler} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text text-black font-semibold">
              Title
            </span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input input-bordered w-full text-white"
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text text-black font-semibold">
              Description
            </span>
          </label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="textarea textarea-bordered w-full text-white"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text text-black font-semibold">
              Video File
            </span>
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="file-input file-input-bordered w-full text-white"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isUploading}>
          {isUploading ? 'Uploading... Please Wait' : 'Upload File'}
        </button>
      </form>
    </div>
  )
}

export default VideoUpload