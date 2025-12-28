import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()
const port = 3002

// In-memory vector store (in production, use a proper vector DB)
interface VectorEntry {
  id: string
  vector: number[]
  content: string
  metadata: {
    type: 'issue' | 'sop' | 'log'
    sourceId: string
    createdAt: string
    [key: string]: any
  }
}

let vectorStore: VectorEntry[] = []

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    service: 'rag-service', 
    vectorsCount: vectorStore.length,
    timestamp: new Date().toISOString() 
  })
})

// Store embedding
app.post('/api/vectors', async (c) => {
  try {
    const body = await c.req.json()
    const { id, content, vector, type, sourceId, metadata = {} } = body

    if (!id || !content || !vector || !type || !sourceId) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const entry: VectorEntry = {
      id,
      vector,
      content,
      metadata: {
        type,
        sourceId,
        createdAt: new Date().toISOString(),
        ...metadata
      }
    }

    // Remove existing entry with same ID
    vectorStore = vectorStore.filter(v => v.id !== id)
    vectorStore.push(entry)

    return c.json({ 
      success: true, 
      id,
      storedAt: entry.metadata.createdAt 
    })
  } catch (error) {
    console.error('Error storing vector:', error)
    return c.json({ error: 'Failed to store vector' }, 500)
  }
})

// Batch store embeddings
app.post('/api/vectors/batch', async (c) => {
  try {
    const body = await c.req.json()
    const { entries } = body

    if (!Array.isArray(entries)) {
      return c.json({ error: 'entries must be an array' }, 400)
    }

    const stored: string[] = []

    for (const entry of entries) {
      const { id, content, vector, type, sourceId, metadata = {} } = entry
      
      if (!id || !content || !vector || !type || !sourceId) {
        continue
      }

      // Remove existing entry with same ID
      vectorStore = vectorStore.filter(v => v.id !== id)
      vectorStore.push({
        id,
        vector,
        content,
        metadata: {
          type,
          sourceId,
          createdAt: new Date().toISOString(),
          ...metadata
        }
      })

      stored.push(id)
    }

    return c.json({ 
      success: true, 
      storedCount: stored.length,
      ids: stored 
    })
  } catch (error) {
    console.error('Error batch storing vectors:', error)
    return c.json({ error: 'Failed to batch store vectors' }, 500)
  }
})

// Search for similar vectors
app.post('/api/vectors/search', async (c) => {
  try {
    const body = await c.req.json()
    const { query, topK = 5, filter = {} } = body

    if (!query) {
      return c.json({ error: 'Query is required' }, 400)
    }

    // Generate embedding for query
    const queryVector = generateEmbedding(query)

    // Calculate similarity scores
    const scored = vectorStore
      .filter(entry => {
        // Apply filters
        if (filter.type && entry.metadata.type !== filter.type) return false
        if (filter.sourceId && entry.metadata.sourceId !== filter.sourceId) return false
        return true
      })
      .map(entry => ({
        ...entry,
        score: cosineSimilarity(queryVector, entry.vector)
      }))
      .filter(entry => entry.score > 0.3) // Minimum similarity threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    return c.json({
      results: scored.map(entry => ({
        id: entry.id,
        content: entry.content,
        score: entry.score,
        metadata: entry.metadata
      }))
    })
  } catch (error) {
    console.error('Error searching vectors:', error)
    return c.json({ error: 'Failed to search vectors' }, 500)
  }
})

// Get vector by ID
app.get('/api/vectors/:id', (c) => {
  try {
    const id = c.req.param('id')
    const entry = vectorStore.find(v => v.id === id)

    if (!entry) {
      return c.json({ error: 'Vector not found' }, 404)
    }

    return c.json(entry)
  } catch (error) {
    console.error('Error getting vector:', error)
    return c.json({ error: 'Failed to get vector' }, 500)
  }
})

// Delete vector
app.delete('/api/vectors/:id', (c) => {
  try {
    const id = c.req.param('id')
    const index = vectorStore.findIndex(v => v.id === id)

    if (index === -1) {
      return c.json({ error: 'Vector not found' }, 404)
    }

    vectorStore.splice(index, 1)

    return c.json({ success: true, id })
  } catch (error) {
    console.error('Error deleting vector:', error)
    return c.json({ error: 'Failed to delete vector' }, 500)
  }
})

// Clear all vectors (use with caution)
app.delete('/api/vectors', (c) => {
  try {
    vectorStore = []
    return c.json({ success: true, message: 'All vectors cleared' })
  } catch (error) {
    console.error('Error clearing vectors:', error)
    return c.json({ error: 'Failed to clear vectors' }, 500)
  }
})

// Get stats
app.get('/api/stats', (c) => {
  const stats = {
    totalVectors: vectorStore.length,
    byType: {
      issue: vectorStore.filter(v => v.metadata.type === 'issue').length,
      sop: vectorStore.filter(v => v.metadata.type === 'sop').length,
      log: vectorStore.filter(v => v.metadata.type === 'log').length
    },
    oldestEntry: vectorStore.length > 0 
      ? vectorStore.reduce((oldest, entry) => 
          entry.metadata.createdAt < oldest.metadata.createdAt ? entry : oldest
        ).metadata.createdAt
      : null,
    newestEntry: vectorStore.length > 0
      ? vectorStore.reduce((newest, entry) =>
          entry.metadata.createdAt > newest.metadata.createdAt ? entry : newest
        ).metadata.createdAt
      : null
  }

  return c.json(stats)
})

// Helper functions
function generateEmbedding(text: string): number[] {
  // Generate a deterministic pseudo-random embedding based on text
  const length = 384
  const embedding: number[] = []
  
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash = hash & hash
  }

  for (let i = 0; i < length; i++) {
    const value = ((hash + i) % 10000) / 10000
    embedding.push(value * 2 - 1)
  }

  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}

function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    return 0
  }

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2)
  return denominator === 0 ? 0 : dotProduct / denominator
}

console.log(`RAG Service starting on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
