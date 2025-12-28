import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const issues = await db.issue.findMany({
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            recommendations: true,
            ratings: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(issues)
  } catch (error) {
    console.error('Failed to fetch issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, priority, category, symptoms } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Create a default user if none exists (for demo purposes)
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

    const issue = await db.issue.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        category,
        symptoms,
        createdById: user.id,
        status: 'OPEN'
      },
      include: {
        assignedTo: true,
        createdBy: true
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'issue_created',
        resource: 'issue',
        resourceId: issue.id,
        changes: JSON.stringify({ title, description, priority, status: 'OPEN' })
      }
    })

    return NextResponse.json(issue, { status: 201 })
  } catch (error) {
    console.error('Failed to create issue:', error)
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    )
  }
}
