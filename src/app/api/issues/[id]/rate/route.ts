import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { score, feedback, recommendationId } = body

    if (!score || score < 1 || score > 5) {
      return NextResponse.json(
        { error: 'Valid score (1-5) is required' },
        { status: 400 }
      )
    }

    // Create a default user if none exists
    let user = await db.user.findFirst()
    if (!user) {
      user = await db.user.create({
        data: {
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'ENGINEER'
        }
      })
    }

    const rating = await db.rating.create({
      data: {
        issueId: params.id,
        recommendationId: recommendationId || null,
        userId: user.id,
        score,
        feedback: feedback || null
      }
    })

    // Update recommendation acceptance if score is 4 or 5
    if (recommendationId && score >= 4) {
      await db.aIRecommendation.update({
        where: { id: recommendationId },
        data: { accepted: true }
      })
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'rating_submitted',
        resource: 'rating',
        resourceId: rating.id,
        changes: JSON.stringify({ score, issueId: params.id, recommendationId })
      }
    })

    return NextResponse.json(rating, { status: 201 })
  } catch (error) {
    console.error('Failed to submit rating:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}
