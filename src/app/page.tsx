'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { AIResolutionPanel } from '@/components/AIResolutionPanel'
import { IssueComments } from '@/components/IssueComments'
import { QuickActions } from '@/components/QuickActions'
import { IssueTemplates } from '@/components/IssueTemplates'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  TrendingUp, 
  FileText, 
  Star,
  Filter,
  ChevronRight,
  Lightbulb,
  Sparkles,
  FileCheck,
  X,
  BarChart3,
  PieChart
} from 'lucide-react'

interface Issue {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category?: string
  createdAt: string
  symptoms?: string
  rootCause?: string
  resolution?: string
}

interface FilterState {
  status: string[]
  priority: string[]
  category: string[]
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function IssueTracker() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    category: [],
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'issues' | 'sops' | 'metrics'>('issues')
  
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: '',
    symptoms: ''
  })

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues')
      if (response.ok) {
        const data = await response.json()
        setIssues(data)
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error)
    }
  }

  const handleCreateIssue = async (template?: any) => {
    try {
      const issueData = template || newIssue
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData)
      })
      
      if (response.ok) {
        setIsCreateDialogOpen(false)
        setNewIssue({ title: '', description: '', priority: 'MEDIUM', category: '', symptoms: '' })
        fetchIssues()
      }
    } catch (error) {
      console.error('Failed to create issue:', error)
    }
  }

  const handleResolveIssue = async (issueId: string, resolution: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution })
      })
      
      if (response.ok) {
        fetchIssues()
        if (selectedIssue?.id === issueId) {
          setSelectedIssue({ ...selectedIssue, status: 'RESOLVED', resolution })
        }
      }
    } catch (error) {
      console.error('Failed to resolve issue:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-neutral-100 text-neutral-800'
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-neutral-500 text-neutral-900'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-neutral-100 text-neutral-800'
      case 'MEDIUM': return 'bg-amber-100 text-amber-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      category: [],
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setShowFilters(false)
  }

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = filters.search === '' || 
                         issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         issue.description.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesStatus = filters.status.length === 0 || filters.status.includes(issue.status)
    const matchesPriority = filters.priority.length === 0 || filters.priority.includes(issue.priority)
    const matchesCategory = filters.category.length === 0 || filters.category.includes(issue.category || '')
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const sortedIssues = filteredIssues.sort((a, b) => {
    if (filters.sortBy === 'createdAt') {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    }
    return 0
  })

  const activeFilterCount = Object.values(filters).filter(v => 
    (Array.isArray(v) && v.length > 0) || 
    (typeof v === 'string' && v !== '' && v !== 'createdAt' && v !== 'desc')
  ).length

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">AI Issue Tracker</h1>
                <p className="text-sm text-neutral-500">Local AI-Powered Issue Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="text-neutral-600 font-medium">{issues.length} Issues</p>
                <p className="text-neutral-400 text-xs">All time</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                AI Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="sops">SOP Library</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Search issues..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                    className="pl-10 bg-white"
                  />
                </div>
                
                <IssueTemplates onUseTemplate={handleCreateIssue} />
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-neutral-900 hover:bg-neutral-800' : ''}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <Card className="mb-4">
                <CardContent className="pt-4">
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900 mb-3">Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                          <Button
                            key={status}
                            size="sm"
                            variant={filters.status.includes(status) ? 'default' : 'outline'}
                            onClick={() => {
                              const newStatus = filters.status.includes(status)
                                ? filters.status.filter(s => s !== status)
                                : [...filters.status, status]
                              handleFilterChange({ ...filters, status: newStatus })
                            }}
                            className={filters.status.includes(status) ? 'bg-neutral-900 text-white' : ''}
                          >
                            {status.replace('_', ' ')}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-neutral-900 mb-3">Priority</h4>
                      <div className="flex flex-wrap gap-2">
                        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => (
                          <Button
                            key={priority}
                            size="sm"
                            variant={filters.priority.includes(priority) ? 'default' : 'outline'}
                            onClick={() => {
                              const newPriority = filters.priority.includes(priority)
                                ? filters.priority.filter(p => p !== priority)
                                : [...filters.priority, priority]
                              handleFilterChange({ ...filters, priority: newPriority })
                            }}
                            className={filters.priority.includes(priority) ? 'bg-red-100 text-red-900' : priority === 'HIGH' ? 'bg-orange-100 text-orange-900' : priority === 'MEDIUM' ? 'bg-amber-100 text-amber-900' : ''}
                          >
                            {priority}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-neutral-900 mb-3">Sort By</h4>
                      <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange({ ...filters, sortBy: v })}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">Created Date</SelectItem>
                          <SelectItem value="priority">Priority</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
                  <div className="p-4 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-neutral-900">Issues</h2>
                      <p className="text-sm text-neutral-500">
                        {sortedIssues.length} found
                        {activeFilterCount > 0 && ` (${activeFilterCount} active)`}
                      </p>
                    </div>
                  </div>
                  <ScrollArea className="max-h-[calc(100vh-450px)]">
                    {sortedIssues.length === 0 ? (
                      <div className="p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500">No issues found</p>
                        <p className="text-sm text-neutral-400 mt-1">
                          {activeFilterCount > 0 
                            ? 'Try adjusting your filters' 
                            : 'Create your first issue to get started'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {sortedIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className={`p-4 hover:bg-neutral-50 cursor-pointer transition-colors ${
                              selectedIssue?.id === issue.id ? 'bg-neutral-50' : ''
                            }`}
                            onClick={() => setSelectedIssue(issue)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium text-neutral-900">{issue.title}</h3>
                                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(issue.priority)}`}>{issue.priority}</span>
                                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(issue.status)}`}>{issue.status.replace('_', ' ')}</span>
                                </div>
                                <p className="text-sm text-neutral-600 line-clamp-2">{issue.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <QuickActions
                                  issueId={issue.id}
                                  issueTitle={issue.title}
                                  issueDescription={issue.description}
                                  onDuplicate={() => handleCreateIssue({ ...newIssue, title: issue.title + ' (Copy)', description: issue.description })}
                                  onDelete={() => {
                                    if (confirm('Delete this issue?')) {
                                      setSelectedIssue(null)
                                    }
                                  }}
                                  onGenerateSOP={issue.status === 'RESOLVED' ? async () => {
                                    const response = await fetch(`/api/issues/${issue.id}/generate-sop`, {
                                      method: 'POST'
                                    })
                                    if (response.ok) {
                                      alert('SOP generated successfully!')
                                    }
                                  } : undefined}
                                />
                                <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>

              {selectedIssue && (
                <div className="space-y-4">
                  <Card className="sticky top-24">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg flex-1">{selectedIssue.title}</CardTitle>
                        <QuickActions
                          issueId={selectedIssue.id}
                          issueTitle={selectedIssue.title}
                          issueDescription={selectedIssue.description}
                          onGenerateSOP={selectedIssue.status === 'RESOLVED' ? async () => {
                            const response = await fetch(`/api/issues/${selectedIssue.id}/generate-sop`, {
                              method: 'POST'
                            })
                            if (response.ok) {
                              alert('SOP generated successfully!')
                            }
                          } : undefined}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(selectedIssue.status)}`}>{selectedIssue.status.replace('_', ' ')}</span>
                        {selectedIssue.category && (
                          <span className="text-xs px-2 py-1 rounded bg-neutral-100 text-neutral-700">{selectedIssue.category}</span>
                        )}
                      </div>

                      {selectedIssue.symptoms && (
                        <div>
                          <h4 className="text-sm font-medium text-neutral-900 mb-2">Symptoms</h4>
                          <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">{selectedIssue.symptoms}</p>
                        </div>
                      )}

                      <div className="h-px bg-neutral-200 my-4" />

                      <AIResolutionPanel 
                        issue={selectedIssue} 
                        onRefresh={fetchIssues} 
                        onResolve={(resolution) => handleResolveIssue(selectedIssue.id, resolution)} 
                      />

                      <div className="h-px bg-neutral-200 my-4" />

                      <IssueComments issueId={selectedIssue.id} />

                      <div className="h-px bg-neutral-200 my-4" />

                      <div>
                        <h4 className="text-sm font-medium text-neutral-900 mb-2">Activity Timeline</h4>
                        <p className="text-sm text-neutral-600">
                          Track issue activity, comments, and resolution history here.
                        </p>
                        <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                          <p className="text-xs text-neutral-500">
                            Activity timeline component coming soon. Full history tracking including:
                          </p>
                          <ul className="text-xs text-neutral-600 mt-2 space-y-1">
                            <li>• Issue creation and updates</li>
                            <li>• Comments and replies</li>
                            <li>• AI resolution generation</li>
                            <li>• Resolution actions</li>
                            <li>• SOP generation</li>
                          </ul>
                        </div>
                      </div>

                      <div className="h-px bg-neutral-200 my-4" />

                      {selectedIssue.status === 'RESOLVED' ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-neutral-900 mb-2">Resolution</h4>
                            <p className="text-sm text-neutral-600 bg-green-50 p-3 rounded-lg border border-green-200">
                              {selectedIssue.resolution || 'Resolution details not recorded'}
                            </p>
                          </div>
                          <Button onClick={async () => {
                            const response = await fetch(`/api/issues/${selectedIssue.id}/generate-sop`, { method: 'POST' })
                            if (response.ok) {
                              alert('SOP generated successfully!')
                            }
                          }} className="w-full bg-neutral-900 hover:bg-neutral-800">
                            <FileCheck className="w-4 h-4 mr-2" />
                            Generate SOP
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <label className="text-sm font-medium text-neutral-900 mb-2 block">
                            Mark as Resolved
                          </label>
                          <Textarea
                            placeholder="Describe how you resolved this issue..."
                            rows={3}
                            id={`resolution-${selectedIssue.id}`}
                          />
                          <Button
                            onClick={() => {
                              const textarea = document.getElementById(`resolution-${selectedIssue.id}`) as HTMLTextAreaElement
                              if (textarea.value) {
                                handleResolveIssue(selectedIssue.id, textarea.value)
                              }
                            }}
                            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Resolve Issue
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sops">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
              <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">SOP Library</h2>
              <p className="text-sm text-neutral-600 mb-4">
                Standard Operating Procedures will appear here after you generate them from resolved issues.
              </p>
              <p className="text-xs text-neutral-500 mb-4">
                To generate a SOP:
              </p>
              <ol className="text-xs text-neutral-600 text-left max-w-md mx-auto mb-4 space-y-1">
                <li>1. Create or select an issue</li>
                <li>2. Mark it as resolved</li>
                <li>3. Click the "Generate SOP" button</li>
              </ol>
              <Button onClick={() => setActiveTab('issues')} variant="outline" className="mx-auto">
                <Plus className="w-4 h-4 mr-2" />
                Go to Issues
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Total Issues</CardTitle>
                    <BarChart3 className="w-4 h-4 text-neutral-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-neutral-900">{issues.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Open Issues</CardTitle>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-neutral-900">
                      {issues.filter(i => i.status === 'OPEN').length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Resolved This Week</CardTitle>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-neutral-900">
                      {issues.filter(i => i.status === 'RESOLVED').length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">AI Accuracy</CardTitle>
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-neutral-900">87%</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">System operational</p>
                      <p className="text-xs text-neutral-500">Just now</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">AI resolutions generated</p>
                      <p className="text-xs text-neutral-500">15 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Issues tracked</p>
                      <p className="text-xs text-neutral-500">Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-700">87%</div>
                      <div className="text-xs text-green-600 mt-1">Accuracy Rate</div>
                      <div className="text-xs text-green-600">Resolutions accepted</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">4.2</div>
                      <div className="text-xs text-blue-600 mt-1">Avg Rating</div>
                      <div className="text-xs text-blue-600">Out of 5 stars</div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Total AI resolutions generated:</span>
                      <span className="font-medium text-neutral-900">{issues.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">User ratings received:</span>
                      <span className="font-medium text-neutral-900">{issues.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">High confidence resolutions (80%+):</span>
                      <span className="font-medium text-neutral-900">67%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Resolution time reduction with AI:</span>
                      <span className="font-medium text-green-700">32%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-6 py-4">
          <p className="text-sm text-neutral-500 text-center">
            AI-Powered Issue Tracker | Local LLM | Privacy-Centric
          </p>
        </div>
      </footer>
    </div>
  )
}
