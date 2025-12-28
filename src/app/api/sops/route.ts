import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const sops = await db.sOP.findMany({
      include: {
        embeddings: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sops)
  } catch (error) {
    console.error('Failed to fetch SOPs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SOPs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, problem, symptoms, cause, steps, validation, rollback, category, issueId } = body

    if (!title || !problem || !steps) {
      return NextResponse.json(
        { error: 'Title, problem, and steps are required' },
        { status: 400 }
      )
    }

    const sop = await db.sOP.create({
      data: {
        title,
        problem,
        symptoms: symptoms || '',
        cause: cause || '',
        steps: typeof steps === 'string' ? steps : JSON.stringify(steps),
        validation: validation || '',
        rollback: rollback || '',
        category: category || 'General',
        issueId,
        version: 1,
        active: true
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: 'system',
        action: 'sop_created',
        resource: 'sop',
        resourceId: sop.id,
        changes: JSON.stringify({ title, category })
      }
    })

    return NextResponse.json(sop, { status: 201 })
  } catch (error) {
    console.error('Failed to create SOP:', error)
    return NextResponse.json(
      { error: 'Failed to create SOP' },
      { status: 500 }
    )
  }
}
