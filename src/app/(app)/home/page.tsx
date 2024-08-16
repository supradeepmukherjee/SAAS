'use client'

import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import toast from 'react-hot-toast'
import VidCard from "../../../../components/VidCard"
import { Video } from "../../../../types"

const Home = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const fetchVideos = useCallback(
    async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/videos')
        if (Array.isArray(data)) setVideos(data)
        else throw new Error('Unexpected Format of Response')
      } catch (err) {
        console.log(err)
        toast.error('Failed to Fetch videos')
      } finally {
        setLoading(false)
      }
    },
    [],
  )
  const downloadHandler = useCallback((url: string, title: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `${title}.mp4`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])
  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])
  if (loading) return <span className="loading loading-dots loading-lg"></span>
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {videos.length > 0 ?
          <div className="text-center text-lg text-gray-500">
            No Videos available
          </div>
          :
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(v => <VidCard onDownload={downloadHandler} vid={v} key={v.id} />)}
          </div>
        }
      </h1>
    </div>
  )
}

export default Home