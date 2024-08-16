import { auth } from "@clerk/nextjs/server"
import { PrismaClient } from "@prisma/client"
import { v2 as cloudinary } from "cloudinary"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
})

interface CloudinaryUploadResult {
    public_id: string
    bytes: number
    duration?: number
    [key: string]: any
}

export async function POST(req: NextRequest) {
    const { userId } = auth()
    if (!userId) return NextResponse.json({
        error: 'Unauthorised',
        status: 401
    })
    try {
        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUD_KEY ||
            !process.env.CLOUD_SECRET
        ) return NextResponse.json({
            error: 'Cloudinary Credentials not found',
            status: 500
        })
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const title = formData.get('title') as string
        const desc = formData.get('desc') as string
        const origSize = formData.get('origSize') as string
        if (!file) return NextResponse.json({
            error: 'File not found',
            status: 400
        })
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const res = await new Promise<CloudinaryUploadResult>((res, rej) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'first-saas-vid',
                    resource_type: 'video',
                    transformation: [{
                        quality: 'auto',
                        fetch_format: 'mp4'
                    }]
                },
                (err, result) => {
                    if (err) rej(err)
                    else res(result as CloudinaryUploadResult)
                }
            )
            uploadStream.end(buffer)
        })
        const vid = await prisma.video.create({
            data: {
                title,
                desc,
                publicID: res.public_id,
                origSize,
                compressedSize: String(res.bytes),
                duration: res.duration || 0
            }
        })
        return NextResponse.json(vid)
    } catch (err) {
        console.log(err)
        return NextResponse.json({
            error: 'Failed to Upload Vid',
            status: 500
        })
    } finally {
        await prisma.$disconnect()
    }
}