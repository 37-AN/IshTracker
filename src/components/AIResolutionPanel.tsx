'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Lightbulb, 
  TrendingUp, 
  Star,
  CheckCircle2,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'

interface AIResolution {
  id: string
  resolution: string
  confidence: number
  reasoning?: string
  steps?: string[]
  canAutoResolve?: boolean
  accepted?: boolean
  userRating?: number
  userFeedback?: string
}

interface Issue {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category?: string
  symptoms?: string
}

interface AIResolutionPanelProps {
  issue: Issue
  onResolve?: (resolution: string) => void
  onRefresh?: () => void
}

export function AIResolutionPanel({ issue, onResolve, onRefresh }: AIResolutionPanelProps) {
  const [resolutions, setResolutions] = useState<AIResolution[]>([])
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [selectedResolution, setSelectedResolution] = useState<AIResolution | null>(null)
  const [submittingRating, setSubmittingRating] = useState(false)

  useEffect(() => {
    fetchResolutions()
  }, [issue.id])

  const fetchResolutions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/issues/${issue.id}/recommendations`)
      if (response.ok) {
        const data = await response.json()
        setResolutions(data)
      }
    } catch (error) {
      console.error('Failed to fetch resolutions:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIResolution = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/issues/${issue.id}/ai-resolution`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.recommendation) {
          setResolutions(prev => [data.recommendation, ...prev])
          setSelectedResolution(data.recommendation)
        }
      }
    } catch (error) {
      console.error('Failed to generate AI resolution:', error)
      alert('Failed to generate AI resolution. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitRating = async (resolutionId: string, score: number) => {
    setSubmittingRating(true)
    try {
      await fetch(`/api/issues/${issue.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          score, 
          feedback: feedback || undefined,
          recommendationId: resolutionId 
        })
      })

      // Update local state
      setResolutions(prev => 
        prev.map(res => 
          res.id === resolutionId 
            ? { ...res, userRating: score, userFeedback: feedback }
            : res
        )
      )

      setRating(null)
      setFeedback('')
      alert('Rating submitted successfully!')
      
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      setSubmittingRating(false)
    }
  }

  const acceptResolution = async (resolution: AIResolution) => {
    if (!window.confirm('Are you sure you want to accept this AI resolution and resolve the issue?')) {
      return
    }

    if (onResolve) {
      onResolve(resolution.resolution)
      // Update local state
      setResolutions(prev => 
        prev.map(res => 
          res.id === resolution.id ? { ...res, accepted: true } : res
        )
      )
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-50 text-green-700 border-green-200'
    if (confidence >= 0.6) return 'bg-amber-50 text-amber-700 border-amber-200'
    if (confidence >= 0.4) return 'bg-orange-50 text-orange-700 border-orange-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    if (confidence >= 0.4) return 'Low'
    return 'Very Low'
  }

  const renderStars = (currentRating: number | undefined, onRate?: (star: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate && onRate(star)}
            disabled={!onRate || submittingRating}
            className={`hover:scale-110 transition-transform ${
              !onRate ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            title={onRate ? `Rate ${star} star${star > 1 ? 's' : ''}` : `Rated ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-5 h-5 ${
                currentRating !== undefined && star <= currentRating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-neutral-300'
              } ${
                !onRate ? 'opacity-50' : ''
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-medium text-neutral-900">AI-Powered Resolutions</h4>
          {loading && <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />}
        </div>
        {issue.status !== 'RESOLVED' && (
          <Button
            onClick={generateAIResolution}
            disabled={loading}
            size="sm"
            className="bg-neutral-900 hover:bg-neutral-800"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Resolution
          </Button>
        )}
      </div>

      {resolutions.length === 0 && !loading ? (
        <div className="text-center py-8 bg-neutral-50 rounded-lg border border-neutral-200">
          <Lightbulb className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-600 mb-2">No AI resolutions yet</p>
          <p className="text-xs text-neutral-500 mb-4">
            Generate an AI resolution to get step-by-step guidance on resolving this issue
          </p>
          <Button
            onClick={generateAIResolution}
            variant="outline"
            size="sm"
            className="text-neutral-900"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate AI Resolution
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {resolutions.map((resolution) => (
            <Card 
              key={resolution.id} 
              className={`${
                resolution.accepted ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <CheckCircle2 className={`w-5 h-5 ${
                      resolution.accepted ? 'text-green-600' : 'text-neutral-400'
                    }`} />
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {resolution.accepted ? 'Accepted AI Resolution' : 'AI Resolution'}
                      </CardTitle>
                      {resolution.accepted && (
                        <Badge className="bg-green-100 text-green-700 text-xs mt-1">
                          Issue Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getConfidenceColor(resolution.confidence)}
                  >
                    {Math.round(resolution.confidence * 100)}% confidence
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {getConfidenceLabel(resolution.confidence)} Confidence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resolution Text */}
                <div>
                  <h5 className="text-sm font-medium text-neutral-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Proposed Resolution
                  </h5>
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {resolution.resolution}
                    </p>
                  </div>
                </div>

                {/* Extracted Steps */}
                {resolution.steps && resolution.steps.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-neutral-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Step-by-Step Instructions
                    </h5>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <ol className="space-y-2">
                        {resolution.steps.map((step, index) => (
                          <li 
                            key={index} 
                            className="text-sm text-neutral-700 flex gap-3"
                          >
                            <span className="bg-amber-200 text-amber-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {resolution.reasoning && (
                  <div>
                    <h5 className="text-sm font-medium text-neutral-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      AI Reasoning
                    </h5>
                    <div className="bg-white p-3 rounded-lg border border-neutral-200">
                      <p className="text-xs text-neutral-600">
                        {resolution.reasoning}
                      </p>
                    </div>
                  </div>
                )}

                {/* User Rating */}
                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-neutral-900">Rate This Resolution</h5>
                    {resolution.userRating !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        You rated: {resolution.userRating}/5
                      </Badge>
                    )}
                  </div>
                  
                  {resolution.userRating === undefined ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-neutral-600">How helpful was this resolution?</p>
                        {renderStars(undefined, (score) => setRating(score))}
                      </div>
                      
                      <Textarea
                        placeholder="Add optional feedback to help improve future AI resolutions..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => rating && submitRating(resolution.id, rating)}
                          disabled={!rating || submittingRating}
                          size="sm"
                          className="flex-1"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          {submittingRating ? 'Submitting...' : 'Submit Rating'}
                        </Button>
                        
                        {issue.status !== 'RESOLVED' && !resolution.accepted && resolution.confidence > 0.7 && (
                          <Button
                            onClick={() => acceptResolution(resolution)}
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Accept & Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center justify-center gap-2">
                        <ThumbsUp className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-neutral-700">
                          Thank you for rating this resolution!
                        </p>
                      </div>
                      {resolution.userFeedback && (
                        <p className="text-xs text-neutral-500 mt-2 italic">
                          "{resolution.userFeedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confidence Indicator */}
                {resolution.canAutoResolve && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      High confidence resolution - AI believes this will resolve the issue
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rating Guide */}
      {resolutions.length > 0 && (
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <h5 className="text-xs font-medium text-neutral-900 mb-2">Rating Guide</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-start gap-2">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-600">1-2: Not helpful</span>
            </div>
            <div className="flex items-start gap-2">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-600">3: Somewhat helpful</span>
            </div>
            <div className="flex items-start gap-2">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-600">4: Very helpful</span>
            </div>
            <div className="flex items-start gap-2">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-600">5: Perfectly resolved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
