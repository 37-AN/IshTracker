import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Generate AI resolution for an issue
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the issue
    const issue = await db.issue.findUnique({
      where: { id: params.id },
      include: {
        recommendations: true
      }
    })

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      )
    }

    if (issue.status === 'RESOLVED') {
      return NextResponse.json(
        { error: 'Issue is already resolved' },
        { status: 400 }
      )
    }

    // Check for recent AI resolution (within last hour)
    const recentResolution = issue.recommendations.find(
      rec => rec.accepted === true && 
             Date.now() - new Date(rec.createdAt).getTime() < 60 * 60 * 1000
    )

    if (recentResolution) {
      return NextResponse.json({
        message: 'Recent AI resolution exists',
        recommendation: recentResolution
      })
    }

    // Fetch similar resolved issues for context
    const similarIssues = await db.issue.findMany({
      where: {
        status: 'RESOLVED',
        OR: [
          { category: issue.category || undefined },
          { priority: issue.priority }
        ],
        NOT: { id: issue.id }
      },
      take: 5,
      orderBy: {
        resolvedAt: 'desc'
      }
    })

    // Call AI service for resolution
    try {
      const aiServiceResponse = await fetch('http://localhost:3001/api/resolution?XTransformPort=3001', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueTitle: issue.title,
          issueDescription: issue.description,
          symptoms: issue.symptoms,
          category: issue.category,
          priority: issue.priority,
          similarIssues: similarIssues.map(i => ({
            title: i.title,
            description: i.description,
            resolution: i.resolution
          }))
        })
      })

      if (!aiServiceResponse.ok) {
        throw new Error('AI service request failed')
      }

      const aiData = await aiServiceResponse.json()

      // Store the AI-generated resolution as a recommendation marked for resolution
      const resolutionRecommendation = await db.aIRecommendation.create({
        data: {
          issueId: issue.id,
          recommendation: aiData.resolution,
          confidence: aiData.confidence || 0.7,
          reasoning: aiData.reasoning,
          context: aiData.steps ? JSON.stringify(aiData.steps) : null,
          accepted: null
        }
      })

      return NextResponse.json({
        success: true,
        recommendation: resolutionRecommendation,
        canAutoResolve: aiData.confidence > 0.8
      })
    } catch (aiError) {
      console.error('AI service error:', aiError)
      
      // Create a fallback resolution recommendation
      const fallbackResolution = await db.aIRecommendation.create({
        data: {
          issueId: issue.id,
          recommendation: `AI Resolution Suggestion for: ${issue.title}\n\nBased on the issue description and symptoms, here's a proposed resolution:\n\n1. Analyze the system logs for errors related to ${issue.title}\n2. Check if there have been recent configuration changes\n3. Review similar past incidents and their resolutions\n4. Implement a fix based on findings\n5. Test the resolution thoroughly\n\nPlease verify this resolution applies to your specific situation before implementing.`,
          confidence: 0.5,
          reasoning: 'AI service unavailable - using template-based resolution',
          context: null,
          accepted: null
        }
      })

      return NextResponse.json({
        success: true,
        recommendation: fallbackResolution,
        warning: 'AI service unavailable - using fallback resolution',
        canAutoResolve: false
      })
    }
  } catch (error) {
    console.error('Failed to generate AI resolution:', error)
    return NextResponse.json(
      { error: 'Failed to generate resolution' },
      { status: 500 }
    )
  }
}
