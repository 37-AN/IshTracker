import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get comments for an issue
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
        createdAt: 'asc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { content, parentId } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
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

    const comment = await db.issueComment.create({
      data: {
        issueId: params.id,
        content: content.trim(),
        userId: user.id,
        parentId: parentId || null
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'comment_created',
        resource: 'comment',
        resourceId: comment.id,
        changes: JSON.stringify({ issueId: params.id, parentId })
      }
    })

    // Also create activity entry
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'commented',
        resource: 'issue',
        resourceId: params.id,
        changes: JSON.stringify({ commentId: comment.id })
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
