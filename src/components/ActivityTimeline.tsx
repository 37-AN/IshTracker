'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, CheckCircle2, MessageSquare, UserPlus, Edit3, AlertTriangle, Sparkles, FileText, Star } from 'lucide-react'

interface Activity {
  id: string
  type: 'created' | 'updated' | 'commented' | 'resolved' | 'rated' | 'ai_resolution' | 'sop_generated' | 'assigned'
  userId?: string
  userName?: string
  userEmail?: string
  timestamp: string
  description: string
  metadata?: Record<string, any>
}

interface ActivityTimelineProps {
  issueId: string
}

const ACTIVITY_CONFIG: Record<string, { icon: React.ReactNode, color: string }> = {
  created: {
    icon: <UserPlus className="w-4 h-4 text-green-600" />,
    color: 'bg-green-50 border-green-200'
  },
  updated: {
    icon: <Edit3 className="w-4 h-4 text-blue-600" />,
    color: 'bg-blue-50 border-blue-200'
  },
  commented: {
    icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
    color: 'bg-purple-50 border-purple-200'
  },
  resolved: {
    icon: <CheckCircle2 className="w-4 h-4 text-teal-600" />,
    color: 'bg-teal-50 border-teal-200'
  },
  rated: {
    icon: <Star className="w-4 h-4 text-amber-600" />,
    color: 'bg-amber-50 border-amber-200'
  },
  ai_resolution: {
    icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
    color: 'bg-indigo-50 border-indigo-200'
  },
  sop_generated: {
    icon: <FileText className="w-4 h-4 text-cyan-600" />,
    color: 'bg-cyan-50 border-cyan-200'
  },
  assigned: {
    icon: <UserPlus className="w-4 h-4 text-emerald-600" />,
    color: 'bg-emerald-50 border-emerald-200'
  }
}

export function ActivityTimeline({ issueId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [issueId])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/issues/${issueId}/activity`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
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
    return `${Math.floor(seconds / 3600)}h ago`
  }

  const getActivityLabel = (activity: Activity) => {
    const labels: Record<string, string> = {
      created: 'Created issue',
      updated: 'Updated issue',
      commented: 'Added comment',
      resolved: 'Resolved issue',
      rated: 'Rated AI resolution',
      ai_resolution: 'Generated AI resolution',
      sop_generated: 'Generated SOP',
      assigned: 'Assigned to'
    }
    return labels[activity.type] || activity.type
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-600">No activity yet</p>
              <p className="text-xs text-neutral-500">
                Activity will appear here as the issue progresses
              </p>
            </div>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200" />
              
              <div className="space-y-0 pl-8">
                {activities.map((activity) => {
                  const config = ACTIVITY_CONFIG[activity.type] || {
                    icon: <Clock className="w-4 h-4 text-neutral-600" />,
                    color: 'bg-neutral-50 border-neutral-200'
                  }
                  return (
                    <div key={activity.id} className={`relative flex gap-4 py-4 ${config.color} rounded-lg border`}>
                      <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border-2">
                        {config.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-neutral-900">
                            {getActivityLabel(activity)}
                          </p>
                          <span className="text-xs text-neutral-500 whitespace-nowrap">
                            {getTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                        </div>

                        <p className="text-sm text-neutral-700 mt-2">
                          {activity.description}
                        </p>

                        {activity.metadata?.changes && (
                          <div className="mt-2 p-2 bg-neutral-50 rounded text-xs text-neutral-600">
                            <strong>Changed:</strong> {activity.metadata.changes}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          {activity.userName && (
                            <span className="text-xs text-neutral-600 truncate">
                              {activity.userName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
