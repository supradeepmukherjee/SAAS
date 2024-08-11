import { PrismaClient } from "@prisma/client";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
    try {
        const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } })
        return NextResponse.json(videos)
    } catch (err) {
        return NextResponse.json({
            error: 'Failed to Fetch videos',
            status: 500
        })
    }finally{
        await prisma.$disconnect()
    }
}