import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const issue = await db.issue.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: true,
        createdBy: true,
        recommendations: true,
        comments: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        ratings: true
      }
    })

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(issue)
  } catch (error) {
    console.error('Failed to fetch issue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
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
    const { action, ...updateData } = body

    const issue = await db.issue.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedTo: true,
        createdBy: true
      }
    })

    // Create audit log
    if (action) {
      await db.auditLog.create({
        data: {
          userId: issue.createdById,
          action,
          resource: 'issue',
          resourceId: issue.id,
          changes: JSON.stringify(updateData)
        }
      })
    }

    return NextResponse.json(issue)
  } catch (error) {
    console.error('Failed to update issue:', error)
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    )
  }
}
