import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { resolution, rootCause } = body

    if (!resolution) {
      return NextResponse.json(
        { error: 'Resolution is required' },
        { status: 400 }
      )
    }

    const issue = await db.issue.update({
      where: { id: params.id },
      data: {
        status: 'RESOLVED',
        resolution,
        resolvedAt: new Date(),
        rootCause: rootCause || null
      },
      include: {
        createdBy: true
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: issue.createdById,
        action: 'issue_resolved',
        resource: 'issue',
        resourceId: issue.id,
        changes: JSON.stringify({ status: 'RESOLVED', resolution, resolvedAt: new Date() })
      }
    })

    // Trigger SOP generation (will be handled by AI service)
    // This is a placeholder - actual SOP generation will happen in the AI service

    return NextResponse.json(issue)
  } catch (error) {
    console.error('Failed to resolve issue:', error)
    return NextResponse.json(
      { error: 'Failed to resolve issue' },
      { status: 500 }
    )
  }
}
