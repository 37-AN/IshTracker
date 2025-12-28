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

    // Build the prompt for AI recommendation
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

// Generate SOP from resolved issue
app.post('/api/sop/generate', async (c) => {
  try {
    const body = await c.req.json()
    const { issueTitle, issueDescription, symptoms, resolution, rootCause, category } = body

    if (!issueTitle || !resolution) {
      return c.json({ error: 'Title and resolution are required' }, 400)
    }

    const systemPrompt = `You are a technical documentation specialist. 
Generate a Standard Operating Procedure (SOP) from the resolved issue.

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

    // Parse the response to extract JSON
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

// Generate embeddings for RAG
app.post('/api/embeddings', async (c) => {
  try {
    const body = await c.req.json()
    const { text } = body

    if (!text) {
      return c.json({ error: 'Text is required' }, 400)
    }

    // Note: Using mock embedding for now
    // In production, this would call an embedding model
    const mockEmbedding = generateMockEmbedding(text)

    return c.json({
      vector: mockEmbedding,
      dimension: mockEmbedding.length
    })
  } catch (error) {
    console.error('Error generating embeddings:', error)
    return c.json({ error: 'Failed to generate embeddings' }, 500)
  }
})

// Analyze similar issues
app.post('/api/similar', async (c) => {
  try {
    const body = await c.req.json()
    const { issues, query } = body

    if (!query || !Array.isArray(issues)) {
      return c.json({ error: 'Query and issues array are required' }, 400)
    }

    // Simple similarity matching based on text content
    // In production, this would use vector similarity
    const scoredIssues = issues
      .map((issue: any) => {
        const titleScore = calculateSimilarity(query.toLowerCase(), issue.title.toLowerCase())
        const descScore = calculateSimilarity(query.toLowerCase(), issue.description.toLowerCase())
        const overallScore = (titleScore * 0.6) + (descScore * 0.4)
        return { ...issue, similarityScore: overallScore }
      })
      .filter((issue: any) => issue.similarityScore > 0.2)
      .sort((a: any, b: any) => b.similarityScore - a.similarityScore)
      .slice(0, 5)

    return c.json({
      similar: scoredIssues
    })
  } catch (error) {
    console.error('Error finding similar issues:', error)
    return c.json({ error: 'Failed to find similar issues' }, 500)
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
    /analysis[:\s]+([^\n]+)/i
  ]

  for (const pattern of reasoningPatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  // Extract first sentence if no pattern match
  const sentences = text.split('. ')
  if (sentences.length > 0) {
    return sentences[0] + '.'
  }

  return text.substring(0, 200)
}

function generateMockEmbedding(text: string): number[] {
  // Generate a deterministic pseudo-random embedding based on text
  const length = 384 // Common embedding dimension
  const embedding: number[] = []
  
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash = hash & hash
  }

  for (let i = 0; i < length; i++) {
    const value = ((hash + i) % 10000) / 10000
    embedding.push(value * 2 - 1) // Normalize to [-1, 1]
  }

  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple word overlap similarity
  const words1 = new Set(str1.toLowerCase().split(/\s+/))
  const words2 = new Set(str2.toLowerCase().split(/\s+/))
  
  const intersection = new Set([...words1].filter(word => words2.has(word)))
  const union = new Set([...words1, ...words2])
  
  return union.size > 0 ? intersection.size / union.size : 0
}

console.log(`AI Service starting on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
