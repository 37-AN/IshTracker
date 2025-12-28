import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Generate SOP from resolved issue
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the resolved issue
    const issue = await db.issue.findUnique({
      where: { id: params.id }
    })

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      )
    }

    if (issue.status !== 'RESOLVED') {
      return NextResponse.json(
        { error: 'Issue must be resolved before generating SOP' },
        { status: 400 }
      )
    }

    if (!issue.resolution) {
      return NextResponse.json(
        { error: 'Issue must have a resolution before generating SOP' },
        { status: 400 }
      )
    }

    // Call AI service to generate SOP
    try {
      const aiServiceResponse = await fetch('http://localhost:3001/api/sop/generate?XTransformPort=3001', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueTitle: issue.title,
          issueDescription: issue.description,
          symptoms: issue.symptoms,
          resolution: issue.resolution,
          rootCause: issue.rootCause,
          category: issue.category
        })
      })

      if (!aiServiceResponse.ok) {
        throw new Error('AI service request failed')
      }

      const sopData = await aiServiceResponse.json()

      // Create SOP in database
      const sop = await db.sOP.create({
        data: {
          title: sopData.title,
          problem: sopData.problem,
          symptoms: sopData.symptoms,
          cause: sopData.cause,
          steps: typeof sopData.steps === 'string' ? sopData.steps : JSON.stringify(sopData.steps || []),
          validation: sopData.validation,
          rollback: sopData.rollback,
          category: sopData.category || issue.category || 'General',
          issueId: issue.id,
          version: 1,
          active: true
        }
      })

      // Store embeddings for RAG
      const sopText = `SOP: ${sop.title}\nProblem: ${sop.problem}\nSteps: ${JSON.stringify(sop.steps)}\nValidation: ${sop.validation}`
      
      try {
        await fetch('http://localhost:3002/api/vectors?XTransformPort=3002', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `sop-${sop.id}`,
            content: sopText,
            vector: [],
            type: 'sop',
            sourceId: sop.id,
            metadata: {
              category: sop.category,
              version: sop.version
            }
          })
        })
      } catch (ragError) {
        console.error('Failed to store SOP embedding:', ragError)
        // Don't fail SOP creation if embedding fails
      }

      // Create audit log
      await db.auditLog.create({
        data: {
          userId: 'system',
          action: 'sop_generated',
          resource: 'sop',
          resourceId: sop.id,
          changes: JSON.stringify({ issueId: issue.id })
        }
      })

      return NextResponse.json({
        success: true,
        sop
      })
    } catch (aiError) {
      console.error('AI service error:', aiError)
      
      // Create a basic SOP as fallback
      const fallbackSOP = await db.sOP.create({
        data: {
          title: `SOP: ${issue.title}`,
          problem: issue.description,
          symptoms: issue.symptoms || 'Not specified',
          cause: issue.rootCause || 'Identified during investigation',
          steps: JSON.stringify([issue.resolution]),
          validation: 'Verify the system is functioning normally',
          rollback: 'Reverse the changes if issues persist',
          category: issue.category || 'General',
          issueId: issue.id,
          version: 1,
          active: true
        }
      })

      return NextResponse.json({
        success: true,
        sop: fallbackSOP,
        warning: 'AI service unavailable - using fallback SOP'
      })
    }
  } catch (error) {
    console.error('Failed to generate SOP:', error)
    return NextResponse.json(
      { error: 'Failed to generate SOP' },
      { status: 500 }
    )
  }
}
