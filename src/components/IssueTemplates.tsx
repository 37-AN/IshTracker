'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus,
  Zap,
  Bug,
  AlertTriangle,
  Lightbulb,
  FileText,
  Gauge,
  ShieldAlert
} from 'lucide-react'

interface IssueTemplate {
  id: string
  title: string
  description: string
  category: string
  priority: string
  symptoms: string
  icon: React.ReactNode
}

interface IssueTemplatesProps {
  onUseTemplate: (template: IssueTemplate) => void
}

const TEMPLATES: IssueTemplate[] = [
  {
    id: 'bug',
    title: 'Bug Report',
    description: 'Describe the bug in detail, including steps to reproduce',
    category: 'Bug',
    priority: 'HIGH',
    symptoms: 'What are the symptoms? When did this start?',
    icon: <Bug className="w-5 h-5 text-red-500" />
  },
  {
    id: 'incident',
    title: 'System Incident',
    description: 'Report a service outage or degradation',
    category: 'Incident',
    priority: 'CRITICAL',
    symptoms: 'What services are affected? How many users are impacted?',
    icon: <AlertTriangle className="w-5 h-5 text-orange-500" />
  },
  {
    id: 'feature',
    title: 'Feature Request',
    description: 'Describe the desired feature or improvement',
    category: 'Feature',
    priority: 'MEDIUM',
    symptoms: 'What problem would this solve? What value would it add?',
    icon: <Lightbulb className="w-5 h-5 text-amber-500" />
  },
  {
    id: 'performance',
    title: 'Performance Issue',
    description: 'Report slow response times or resource usage',
    category: 'Performance',
    priority: 'HIGH',
    symptoms: 'What metrics are affected? When does this occur?',
    icon: <Gauge className="w-5 h-5 text-blue-500" />
  },
  {
    id: 'documentation',
    title: 'Documentation Request',
    description: 'Request documentation or clarification',
    category: 'Documentation',
    priority: 'LOW',
    symptoms: 'What needs to be documented? Who is the audience?',
    icon: <FileText className="w-5 h-5 text-purple-500" />
  },
  {
    id: 'security',
    title: 'Security Concern',
    description: 'Report a potential security vulnerability',
    category: 'Security',
    priority: 'CRITICAL',
    symptoms: 'What is the potential impact? What evidence do you have?',
    icon: <ShieldAlert className="w-5 h-5 text-red-600" />
  },
  {
    id: 'improvement',
    title: 'Improvement Suggestion',
    description: 'Suggest an improvement to existing functionality',
    category: 'Improvement',
    priority: 'MEDIUM',
    symptoms: 'What is the current limitation? How should it work?',
    icon: <Zap className="w-5 h-5 text-teal-500" />
  }
]

export function IssueTemplates({ onUseTemplate }: IssueTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleUseTemplate = (template: IssueTemplate) => {
    onUseTemplate(template)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-neutral-900 hover:bg-neutral-800">
          <Plus className="w-4 h-4 mr-2" />
          Quick Create
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose an Issue Template</DialogTitle>
          <DialogDescription>
            Select a template to quickly create a new issue with pre-filled information
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleUseTemplate(template)}
              className="group relative p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 hover:shadow-md transition-all text-left bg-white"
            >
              <div className="flex items-center gap-3 mb-3">
                {template.icon}
                <div className="text-lg font-semibold text-neutral-900">
                  {template.title}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wide">Category</span>
                  <p className="text-sm text-neutral-700">{template.category}</p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wide">Priority</span>
                  <p className="text-sm text-neutral-700">{template.priority}</p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wide">Description</span>
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {template.description}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wide">Symptoms</span>
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {template.symptoms}
                  </p>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-neutral-900 text-white text-xs px-2 py-1 rounded">
                  Select
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
