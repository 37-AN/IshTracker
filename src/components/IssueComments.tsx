'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare,
  Send,
  MoreHorizontal,
  Trash2,
  Edit3
} from 'lucide-react'

interface Comment {
  id: string
  content: string
  userId: string
  userName?: string
  userEmail?: string
  createdAt: string
  updatedAt?: string
}

interface IssueCommentsProps {
  issueId: string
}

export function IssueComments({ issueId }: IssueCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [issueId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/issues/${issueId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          parentId: replyTo || undefined
        })
      })

      if (response.ok) {
        setNewComment('')
        setReplyTo(null)
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('Failed to add comment. Please try again.')
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId))
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('Failed to delete comment.')
    }
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'AN'
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return `${Math.floor(seconds / 604800)}w ago`
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-neutral-500" />
        <h3 className="text-sm font-medium text-neutral-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          {replyTo && (
            <div className="flex items-center justify-between bg-neutral-100 p-2 rounded-lg mb-3">
              <span className="text-xs text-neutral-600">
                Replying to comment #{replyTo.substring(0, 8)}...
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyTo(null)}
                className="text-neutral-600 h-6"
              >
                Cancel
              </Button>
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-neutral-900 text-white text-xs">
                  ME
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={submitComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="bg-neutral-900 hover:bg-neutral-800"
                >
                  <Send className="w-3 h-3 mr-2" />
                  {replyTo ? 'Reply' : 'Comment'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-600">No comments yet</p>
                <p className="text-xs text-neutral-500">
                  Be the first to share your thoughts
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-neutral-100 text-neutral-600 text-xs">
                          {getInitials(comment.userName, comment.userEmail)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-900">
                            {comment.userName || comment.userEmail || 'Anonymous'}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {getTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-neutral-400 hover:text-neutral-600"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-neutral-700 mt-1 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyTo(comment.id)}
                          className="h-6 text-xs text-neutral-600 hover:text-neutral-900 px-2"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteComment(comment.id)}
                          className="h-6 text-xs text-red-500 hover:text-red-700 px-2"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
