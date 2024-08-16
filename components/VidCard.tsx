import { Video } from '@prisma/client'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { filesize } from 'filesize'
import { Clock, Download, FileDown, FileUp } from 'lucide-react'
import { getCldImageUrl, getCldVideoUrl } from 'next-cloudinary'
import { FC, useCallback, useEffect, useState } from 'react'

dayjs.extend(relativeTime)

interface VidCardProps {
    vid: Video
    onDownload: (url: string, title: string) => void
}

const VidCard: FC<VidCardProps> = ({ vid, onDownload }) => {
    const { compressedSize, createdAt, desc, duration, origSize, publicID, title } = vid
    const totalPreviewDuration = 15
    const maxSegmentDuration = 9
    const minSegmentDuration = 1
    const [isHover, setIsHover] = useState(false)
    const [previewError, setPreviewError] = useState(false)
    const getThumbnailURL = useCallback(
        (id: string) => getCldImageUrl({
            src: id,
            width: 360,
            height: 250,
            crop: 'fill',
            gravity: 'auto',
            format: 'jpg',
            quality: 'auto',
            assetType: 'video'
        }),
        [],
    )
    const getFullVidURL = useCallback(
        (id: string) => getCldVideoUrl({
            src: id,
            width: 640,
            height: 360,
        }),
        [],
    )
    const getPreviewVidURL = useCallback(
        (id: string) => getCldVideoUrl({
            src: id,
            width: 320,
            height: 180,
            rawTransformations: [`e_preview:duration_${totalPreviewDuration}:max_seg_${maxSegmentDuration}:min_seg_dur_${minSegmentDuration}`]
        }),
        [],
    )
    const formatSize = useCallback((size: number) => filesize(size), [])
    const formatDuration = useCallback(
        (sec: number) => {
            const min = Math.floor(sec / 60)
            const remSec = Math.round(sec % 60)
            return `${min}:${remSec.toString().padStart(2, '0')}`
        },
        [],
    )
    const compressionPercentage = Math.round((1 - Number(compressedSize) / Number(origSize)) * 100)
    useEffect(() => {
        setPreviewError(false)
    }, [isHover])
    return (
        <div className='card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300'>
            <figure
                className="aspect-video relative"
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
            >
                {isHover ? (
                    previewError ?
                        (
                            <div className="w-full h-full flex items-center justify-center g-gray-200">
                                <p className="text-red-500">
                                    Preview not available
                                </p>
                            </div>
                        )
                        :
                        <video
                            src={getPreviewVidURL(vid.publicID)}
                            className='w-full h-full object-cover'
                            autoPlay
                            muted
                            loop
                            onError={() => setPreviewError(true)}
                        />
                )
                    :
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={getThumbnailURL(publicID)}
                        className='w-full h-full object-cover'
                        alt={title}
                    />
                }
                <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center text-white">
                    <Clock size={16} className='mr-1' />
                    {formatDuration(duration)}
                </div>
            </figure>
            <div className="card-body p-4">
                <h2 className="card-title text-lg font-bold text-white">
                    {title}
                </h2>
                <p className="text-sm text-base-content opacity-70 mb-4">
                    {desc}
                </p>
                <p className="text-sm text-base-content opacity-70 mb-4">
                    Uploaded {dayjs(createdAt).fromNow()}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                        <FileUp size={18} className='mr-2 text-primary' />
                        <div>
                            <div className="font-semibold text-white">
                                Original
                            </div>
                            <div className='text-white'>
                                {formatSize(Number(origSize))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <FileDown size={18} className='mr-2 text-white' />
                        <div>
                            <div className="font-semibold text-white">
                                Compressed
                            </div>
                            <div className='text-white'>
                                {formatSize(Number(compressedSize))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4 text-white">
                    <div className="text-sm font-semibold">
                        Compression: <span className="text-accent">{compressionPercentage}%</span>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onDownload(getFullVidURL(publicID), title)}
                    >
                        <Download size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VidCard