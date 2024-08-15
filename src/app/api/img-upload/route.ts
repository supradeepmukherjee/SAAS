import { auth } from "@clerk/nextjs/server"
import { v2 as cloudinary } from "cloudinary"
import { NextRequest, NextResponse } from "next/server"

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
})

interface CloudinaryUploadResult {
    public_id: string
    [key: string]: any
}

export async function POST(req: NextRequest) {
    const { userId } = auth()
    if (!userId) return NextResponse.json({
        error: 'Unauthorised',
        status: 401
    })
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        if (!file) return NextResponse.json({
            error: 'File not found',
            status: 400
        })
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const res = await new Promise<CloudinaryUploadResult>((res, rej) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'first-saas-img' },
                (err, result) => {
                    if (err) rej(err)
                    else res(result as CloudinaryUploadResult)
                }
            )
            uploadStream.end(buffer)
        })
        return NextResponse.json(
            { publicID: res.public_id },
            { status: 200 }
        )
    } catch (err) {
        console.log(err)
        return NextResponse.json({
            error: 'Failed to Upload Img',
            status: 500
        })
    }
}