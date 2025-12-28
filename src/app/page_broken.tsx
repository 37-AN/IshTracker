'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { IssueComments } from '"@/components/IssueComments'

import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AIResolutionPanel } from '@/components/AIResolutionPanel'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { AlertCircle, CheckCircle2, Search, Plus, Filter, ChevronRight, FileCheck, Sparkles } from 'lucide-react'

interface Issue {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category?: string
  createdAt: string
  symptoms?: string
  resolution?: string
}

export default function IssueTracker() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'issues' | 'metrics'>('issues')
  
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

  const handleCreateIssue = async () => {
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIssue)
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

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-neutral-900 hover:bg-neutral-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Issue</DialogTitle>
                    <DialogDescription>Describe the issue you are experiencing</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-1">Title</label>
                      <Input
                        placeholder="Brief summary of the issue"
                        value={newIssue.title}
                        onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1">Description</label>
                      <Textarea
                        placeholder="Detailed description of the issue"
                        value={newIssue.description}
                        onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1">Priority</label>
                        <Select value={newIssue.priority} onValueChange={(v: any) => setNewIssue({ ...newIssue, priority: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1">Category</label>
                        <Input
                          placeholder="e.g., Bug, Feature, Incident"
                          value={newIssue.category}
                          onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1">Symptoms</label>
                      <Textarea
                        placeholder="What symptoms are you observing?"
                        value={newIssue.symptoms}
                        onChange={(e) => setNewIssue({ ...newIssue, symptoms: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateIssue} className="bg-neutral-900 hover:bg-neutral-800 text-white">Create Issue</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
                  <div className="p-4 border-b border-neutral-200">
                    <h2 className="font-semibold text-neutral-900">Issues</h2>
                    <p className="text-sm text-neutral-500">{filteredIssues.length} issues found</p>
                  </div>
                  <ScrollArea className="max-h-[calc(100vh-450px)]">
                    {filteredIssues.length === 0 ? (
                      <div className="p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500">No issues found</p>
                        <p className="text-sm text-neutral-400 mt-1">Create your first issue to get started</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {filteredIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className={`p-4 hover:bg-neutral-50 cursor-pointer transition-colors ${
                              selectedIssue?.id === issue.id ? 'bg-neutral-50' : ''
                            }`}
                            onClick={() => setSelectedIssue(issue)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium text-neutral-900">{issue.title}</h3>
                                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(issue.priority)}`}>{issue.priority}</span>
                                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(issue.status)}`}>{issue.status.replace('_', ' ')}</span>
                                </div>
                                <p className="text-sm text-neutral-600 line-clamp-2">{issue.description}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
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
                      <CardTitle className="text-lg">{selectedIssue.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-neutral-600">{selectedIssue.description}</p>
                      
                      {selectedIssue.symptoms && (
                        <div>
                          <h4 className="text-sm font-medium text-neutral-900 mb-2">Symptoms</h4>
                          <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">{selectedIssue.symptoms}</p>
                        </div>
                      )}

                      <AIResolutionPanel issue={selectedIssue} onRefresh={fetchIssues} onResolve={(resolution) => handleResolveIssue(selectedIssue.id, resolution)} />

                      <IssueComments issueId={selectedIssue.id} />


                      {selectedIssue.status === 'RESOLVED' ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-neutral-900 mb-2">Resolution</h4>
                            <p className="text-sm text-neutral-600 bg-green-50 p-3 rounded-lg border border-green-200">{selectedIssue.resolution || 'Resolution details not recorded'}</p>
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
                          <label className="text-sm font-medium text-neutral-900 mb-2 block">Mark as Resolved</label>
                          <Textarea
                            placeholder="Describe how you resolved this issue..."
                            rows={3}
                            id={`resolution-${selectedIssue.id}`}
                          />
                          <Button onClick={() => {
                            const textarea = document.getElementById(`resolution-${selectedIssue.id}`) as HTMLTextAreaElement
                            if (textarea.value) {
                              handleResolveIssue(selectedIssue.id, textarea.value)
                            }
                          }} className="mt-2 w-full bg-green-600 hover:bg-green-700">
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

          <TabsContent value="metrics">
            <AnalyticsDashboard />
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
