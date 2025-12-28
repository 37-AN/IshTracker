import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Activity {
  id: string
  type: string
  userId?: string
  userName?: string
  userEmail?: string
  timestamp: string
  description: string
  metadata?: Record<string, any>
}

// Get activity timeline for an issue
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activities: Activity[] = []

    // Get comments
    const comments = await db.issueComment.findMany({
      where: { issueId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    comments.forEach(comment => {
      activities.push({
        id: `comment-${comment.id}`,
        type: 'commented',
        userId: comment.userId,
        userName: comment.user.name,
        userEmail: comment.user.email,
        timestamp: comment.createdAt,
        description: comment.content,
        metadata: {
          commentId: comment.id,
          parentId: comment.parentId
        }
      })
    })

    // Get AI recommendations
    const recommendations = await db.aIRecommendation.findMany({
      where: { issueId: params.id },
      orderBy: {
        createdAt: 'desc'
      }
    })

    recommendations.forEach(rec => {
      activities.push({
        id: `rec-${rec.id}`,
        type: 'ai_resolution',
        userId: 'system',
        timestamp: rec.createdAt,
        description: `AI generated resolution with ${Math.round(rec.confidence * 100)}% confidence`,
        metadata: {
          recommendationId: rec.id,
          confidence: rec.confidence,
          accepted: rec.accepted
        }
      })
    })

    // Get ratings
    const ratings = await db.rating.findMany({
      where: { issueId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    ratings.forEach(rating => {
      activities.push({
        id: `rating-${rating.id}`,
        type: 'rated',
        userId: rating.userId,
        userName: rating.user.name,
        userEmail: rating.user.email,
        timestamp: rating.createdAt,
        description: rating.feedback || `Rated resolution ${rating.score}/5 stars`,
        metadata: {
          ratingId: rating.id,
          score: rating.score,
          recommendationId: rating.recommendationId
        }
      })
    })

    // Get audit logs for the issue
    const auditLogs = await db.auditLog.findMany({
      where: {
        resource: 'issue',
        resourceId: params.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    auditLogs.forEach(log => {
      let type = 'updated'
      let description = log.action

      if (log.action === 'issue_created') {
        type = 'created'
        description = 'Created this issue'
      } else if (log.action === 'issue_updated') {
        type = 'updated'
        description = 'Updated issue'
      } else if (log.action === 'issue_resolved') {
        type = 'resolved'
        description = 'Resolved this issue'
      } else if (log.action === 'recommendation_created') {
        type = 'ai_resolution'
        description = 'AI generated a resolution recommendation'
      } else if (log.action === 'rating_submitted') {
        type = 'rated'
        description = 'Submitted a rating'
      }

      activities.push({
        id: `audit-${log.id}`,
        type,
        userId: log.userId,
        userName: log.user?.name,
        userEmail: log.user?.email,
        timestamp: log.createdAt,
        description,
        metadata: {
          action: log.action,
          changes: log.changes
        }
      })
    })

    // Sort all activities by timestamp
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json(activities.slice(0, 50)) // Return last 50 activities
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
