'use client'

import { CldImage } from "next-cloudinary"
import { useEffect, useRef, useState } from "react"

const socialFormats = {
  'Instagram Square (1:1)': {
    width: 1080,
    height: 1080,
    aspectRatio: '1:1'
  },
  'Instagram Portrait (4:5)': {
    width: 1080,
    height: 1350,
    aspectRatio: '4:5'
  },
  'Twitter Post (16:9)': {
    width: 1200,
    height: 675,
    aspectRatio: '16:9'
  },
  'Twitter Header (3:1)': {
    width: 1500,
    height: 500,
    aspectRatio: '3:1'
  },
  'FB Cover (205:78)': {
    width: 820,
    height: 312,
    aspectRatio: '205:78'
  },
}

type SocialFormats = keyof typeof socialFormats

const SocialShare = () => {
  const [uploadedImg, setUploadedImg] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<SocialFormats>('Instagram Square (1:1)')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isTransforming, setIsTransforming] = useState<boolean>(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileUploadHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/img-upload', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Failed to upload image')
      const data = await res.json()
      setUploadedImg(data.publicID)
    } catch (err) {
      console.log(err)
      alert('Failed to upload img')
    } finally {
      setIsUploading(false)
    }
  }
  const downloadHandler = () => {
    if (!imgRef.current) return
    fetch(imgRef.current.src)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${selectedFormat.replace(/\s+/g, '_').toLowerCase()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      })
  }
  useEffect(() => {
    if (uploadedImg) {
      setIsTransforming(true)
    }
  }, [uploadedImg, selectedFormat])
  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <h1 className="text-3xl font-bold mb-6 text-center">
        Social Media Image Creator
      </h1>
      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">
            Upload an Image
          </h2>
          <div className="form-control">
            <label htmlFor="" className="label">
              <span className="label-text">
                Choose an Image File
              </span>
            </label>
            <input type="file" onChange={fileUploadHandler} className="file-input file-input-bordered file-input-primary w-full text-white" />
          </div>
          {isUploading && (
            <div className="mt-4">
              <progress className="progress progress-primary w-full"></progress>
            </div>
          )}
          {uploadedImg && (
            <div className="mt-6">
              <h2 className="card-title mb-4">
                Select Social Media Format
              </h2>
              <div className="form-control">
                <select
                  className="select select-bordered w-full text-white"
                  value={selectedFormat}
                  onChange={e => setSelectedFormat(e.target.value as SocialFormats)}
                >
                  {Object.keys(socialFormats).map(format => (
                    <option value={format} key={format} className='text-white'>
                      {format}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 relative">
                <h3 className="text-lg font-semibold mb-2">
                  Preview
                </h3>
                <div className="flex justify-center">
                  {isTransforming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-10 z-10">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  )}
                  <CldImage
                    src={uploadedImg}
                    ref={imgRef}
                    width={socialFormats[selectedFormat].width}
                    height={socialFormats[selectedFormat].height}
                    aspectRatio={socialFormats[selectedFormat].aspectRatio}
                    // sizes="100vw"
                    crop='fill'
                    gravity="auto"
                    onLoad={() => setIsTransforming(false)}
                    alt="Description of img"
                  />
                </div>
              </div>
              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" onClick={downloadHandler}>
                  Download for {selectedFormat}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SocialShare