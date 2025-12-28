import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recommendations = await db.aIRecommendation.findMany({
      where: { issueId: params.id },
      include: {
        ratings: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Failed to fetch recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { recommendation, confidence, reasoning, context } = body

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation is required' },
        { status: 400 }
      )
    }

    const aiRecommendation = await db.aIRecommendation.create({
      data: {
        issueId: params.id,
        recommendation,
        confidence: confidence || 0.8,
        reasoning,
        context,
        accepted: null
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: 'system', // AI system
        action: 'recommendation_created',
        resource: 'recommendation',
        resourceId: aiRecommendation.id,
        changes: JSON.stringify({ issueId: params.id, confidence })
      }
    })

    return NextResponse.json(aiRecommendation, { status: 201 })
  } catch (error) {
    console.error('Failed to create recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to create recommendation' },
      { status: 500 }
    )
  }
}
