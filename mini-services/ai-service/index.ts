import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import ZAI from 'z-ai-web-dev-sdk'

const app = new Hono()
const port = 3001

// Initialize AI SDK
let zaiInstance: any = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() })
})

// Generate AI recommendation for an issue
app.post('/api/recommendations', async (c) => {
  try {
    const body = await c.req.json()
    const { issueTitle, issueDescription, symptoms, category, similarIssues = [] } = body

    if (!issueTitle || !issueDescription) {
      return c.json({ error: 'Title and description are required' }, 400)
    }

    // Build context from similar issues
    const similarIssuesContext = similarIssues.length > 0
      ? `\n\nSimilar Past Issues:\n${similarIssues.map((issue: any) =>
          `- ${issue.title}: ${issue.resolution || 'No resolution yet'}`
        ).join('\n')}`
      : ''

    // Build prompt for AI recommendation
    const systemPrompt = `You are an expert systems engineer and incident response specialist. 
Analyze technical issues and provide step-by-step resolution recommendations.

Your response should include:
1. A clear recommendation for resolving the issue
2. Step-by-step instructions
3. Confidence level (0.0-1.0) based on available information
4. Reasoning behind your recommendation

Focus on practical, actionable steps. If you're uncertain, state it clearly.`

    const userPrompt = `Issue Details:
Title: ${issueTitle}
Description: ${issueDescription}
${symptoms ? `Symptoms: ${symptoms}` : ''}
${category ? `Category: ${category}` : ''}
${similarIssuesContext}

Provide a detailed resolution recommendation with confidence score.`

    // Call LLM
    const zai = await getZAI()
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      thinking: { type: 'disabled' }
    })

    // Extract recommendation and confidence
    const aiResponse = response.choices[0]?.message?.content || ''
    const confidence = extractConfidence(aiResponse)

    return c.json({
      recommendation: aiResponse,
      confidence: confidence || 0.7,
      reasoning: extractReasoning(aiResponse),
      context: similarIssues.map((i: any) => i.id)
    })
  } catch (error) {
    console.error('Error generating recommendation:', error)
    return c.json({ error: 'Failed to generate recommendation' }, 500)
  }
})

// Generate AI resolution for an issue (more detailed than recommendation)
app.post('/api/resolution', async (c) => {
  try {
    const body = await c.req.json()
    const { 
      issueTitle, 
      issueDescription, 
      symptoms, 
      category, 
      priority,
      similarIssues = [] 
    } = body

    if (!issueTitle || !issueDescription) {
      return c.json({ error: 'Title and description are required' }, 400)
    }

    // Build context from similar resolved issues
    const similarIssuesContext = similarIssues.length > 0
      ? `\n\nSimilar Resolved Issues and Their Solutions:\n${similarIssues.map((issue: any) => {
          const resolutionText = issue.resolution || 'No resolution recorded'
          return `Issue: ${issue.title}\nResolution: ${resolutionText}\n`
        }).join('')}`
      : ''

    // Build system prompt for resolution generation
    const systemPrompt = `You are a senior systems engineer and incident response expert with extensive experience in debugging and resolving technical issues.

Your task is to provide a detailed, step-by-step resolution for the reported issue.

Format your response as follows:

**Resolution Steps:**
1. [First step]
2. [Second step]
3. [Continue with detailed steps...]

**Root Cause Analysis:**
[Explain the likely root cause based on the symptoms]

**Confidence Level:**
[Provide a confidence score from 0.0 to 1.0 based on how certain you are]

**Validation:**
[How to verify the fix works]

**Prerequisites:**
[What needs to be done before starting the resolution]

**Risk Assessment:**
[Identify potential risks and how to mitigate them]

${priority === 'CRITICAL' ? 'CRITICAL PRIORITY: Provide the fastest resolution with clear rollback procedures.' : ''}
`

    const userPrompt = `Issue to Resolve:
**Title:** ${issueTitle}
**Priority:** ${priority || 'Not specified'}
**Description:** ${issueDescription}
${symptoms ? `**Symptoms:** ${symptoms}` : ''}
${category ? `**Category:** ${category}` : ''}
${similarIssuesContext}

Based on this information, provide a comprehensive, actionable resolution following the format specified above.`

    // Call LLM with higher temperature for more creative solutions
    const zai = await getZAI()
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      thinking: { type: 'disabled' },
      temperature: 0.4
    })

    const aiResponse = response.choices[0]?.message?.content || ''
    const confidence = extractConfidence(aiResponse)

    // Extract structured information from the response
    const steps = extractSteps(aiResponse)
    const reasoning = extractReasoning(aiResponse)

    return c.json({
      resolution: aiResponse,
      confidence: confidence || 0.7,
      reasoning: reasoning,
      steps: steps,
      canAutoResolve: (confidence || 0.7) > 0.85
    })
  } catch (error) {
    console.error('Error generating resolution:', error)
    return c.json({ error: 'Failed to generate resolution' }, 500)
  }
})

// Generate SOP from resolved issue
app.post('/api/sop/generate', async (c) => {
  try {
    const body = await c.req.json()
    const { issueTitle, issueDescription, symptoms, resolution, rootCause, category } = body

    if (!issueTitle || !resolution) {
      return c.json({ error: 'Title and resolution are required' }, 400)
    }

    const systemPrompt = `You are a technical documentation specialist. 
Generate a Standard Operating Procedure (SOP) from resolved issue.

The SOP should include:
1. Problem Statement
2. Symptoms observed
3. Root cause
4. Step-by-step resolution steps (numbered list)
5. Validation steps to confirm the fix
6. Rollback procedure if needed

Format as structured JSON.`

    const userPrompt = `Issue Details:
Title: ${issueTitle}
Description: ${issueDescription}
${symptoms ? `Symptoms: ${symptoms}` : ''}
Resolution: ${resolution}
${rootCause ? `Root Cause: ${rootCause}` : ''}
${category ? `Category: ${category}` : ''}

Generate a comprehensive SOP in JSON format with fields: problem, symptoms, cause, steps (array), validation, rollback.`

    const zai = await getZAI()
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      thinking: { type: 'disabled' }
    })

    // Parse response to extract JSON
    const aiResponse = response.choices[0]?.message?.content || ''
    let sopData

    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        sopData = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: create structured data from text
        sopData = {
          problem: issueTitle,
          symptoms: symptoms || 'Not specified',
          cause: rootCause || 'Identified during investigation',
          steps: [resolution],
          validation: 'Verify the system is functioning normally',
          rollback: 'Reverse the changes if issues persist'
        }
      }
    } catch (parseError) {
      console.error('Error parsing SOP:', parseError)
      sopData = {
        problem: issueTitle,
        symptoms: symptoms || 'Not specified',
        cause: rootCause || 'Identified during investigation',
        steps: [resolution],
        validation: 'Verify the system is functioning normally',
        rollback: 'Reverse the changes if issues persist'
      }
    }

    return c.json({
      title: `SOP: ${issueTitle}`,
      ...sopData,
      category: category || 'General'
    })
  } catch (error) {
    console.error('Error generating SOP:', error)
    return c.json({ error: 'Failed to generate SOP' }, 500)
  }
})

// Helper functions
function extractConfidence(text: string): number {
  const confidencePatterns = [
    /confidence[:\s]+([0-9.]+)/i,
    /([0-9.]+)%\s*confidence/i,
    /certainty[:\s]+([0-9.]+)/i
  ]

  for (const pattern of confidencePatterns) {
    const match = text.match(pattern)
    if (match) {
      const value = parseFloat(match[1])
      if (value <= 1) return value
      if (value <= 100) return value / 100
    }
  }

  // Default confidence based on content
  if (text.toLowerCase().includes('uncertain') || text.toLowerCase().includes('not sure')) {
    return 0.4
  }
  if (text.toLowerCase().includes('confident') || text.toLowerCase().includes('recommended')) {
    return 0.8
  }

  return 0.7
}

function extractReasoning(text: string): string {
  const reasoningPatterns = [
    /reasoning[:\s]+([^\n]+)/i,
    /because[:\s]+([^\n]+)/i,
    /analysis[:\s]+([^\n]+)/i,
    /root cause[:\s]+([^\n]+)/i
  ]

  for (const pattern of reasoningPatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  // Extract first paragraph if no pattern match
  const firstParagraph = text.split('\n\n')[0]
  if (firstParagraph && firstParagraph.length > 50) {
    return firstParagraph.substring(0, 200)
  }

  return text.substring(0, 200)
}

function extractSteps(text: string): string[] {
  // Try to extract numbered steps from the response
  const stepPattern = /\d+\.\s+([^\n]+)/g
  const steps: string[] = []
  let match

  while ((match = stepPattern.exec(text)) !== null) {
    steps.push(match[1].trim())
  }

  // If no numbered steps found, try to find resolution steps section
  if (steps.length === 0) {
    const resolutionStepsMatch = text.match(/\*\*Resolution Steps:\*\*([\s\S]*?)(?=\*\*|$)/i)
    if (resolutionStepsMatch && resolutionStepsMatch[1]) {
      const stepText = resolutionStepsMatch[1]
      const lines = stepText.split('\n').filter(line => line.trim().length > 0)
      lines.forEach(line => {
        const stepMatch = line.match(/^[\d\.\-\*]+\s*(.+)$/)
        if (stepMatch) {
          steps.push(stepMatch[1].trim())
        }
      })
    }
  }

  // Return extracted steps or empty array
  return steps.length > 0 ? steps : []
}

console.log(`AI Service starting on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
