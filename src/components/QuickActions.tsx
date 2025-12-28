'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal,
  Copy,
  Share2,
  Link2,
  RefreshCw,
  FileText,
  Archive,
  Trash2,
  Star,
  Check
} from 'lucide-react'

interface QuickActionsProps {
  issueId: string
  issueTitle: string
  issueDescription: string
  onDuplicate?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onWatch?: () => void
  isWatched?: boolean
  onGenerateSOP?: () => void
}

export function QuickActions({ 
  issueId, 
  issueTitle, 
  issueDescription,
  onDuplicate,
  onArchive,
  onDelete,
  onWatch,
  isWatched = false,
  onGenerateSOP
}: QuickActionsProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    const text = `Issue: ${issueTitle}\n\nDescription: ${issueDescription}\n\nID: ${issueId}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareLink = () => {
    const url = `${window.location.origin}/issues/${issueId}`
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!')
    })
  }

  const generateShareableLink = () => {
    // Generate a unique shareable link
    const shareUrl = `${window.location.origin}/share/${issueId}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied!')
    })
  }

  const duplicateIssue = () => {
    if (onDuplicate) {
      onDuplicate()
    }
  }

  const archiveIssue = () => {
    if (onArchive) {
      if (confirm('Archive this issue?')) {
        onArchive()
      }
    }
  }

  const deleteIssue = () => {
    if (onDelete) {
      if (confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
        onDelete()
      }
    }
  }

  const toggleWatch = () => {
    if (onWatch) {
      onWatch()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Copy & Share */}
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="w-4 h-4 mr-2" />
          {copied ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Copied!
            </span>
          ) : 'Copy to Clipboard'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareLink}>
          <Link2 className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={generateShareableLink}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Issue
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Actions */}
        {onDuplicate && (
          <DropdownMenuItem onClick={duplicateIssue}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Duplicate Issue
          </DropdownMenuItem>
        )}

        {onWatch && (
          <DropdownMenuItem onClick={toggleWatch}>
            <Star className={`w-4 h-4 mr-2 ${isWatched ? 'fill-amber-400 text-amber-400' : ''}`} />
            {isWatched ? 'Unwatch' : 'Watch Issue'}
          </DropdownMenuItem>
        )}

        {onGenerateSOP && (
          <DropdownMenuItem onClick={onGenerateSOP}>
            <FileText className="w-4 h-4 mr-2" />
            Generate SOP
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Destructive Actions */}
        {onArchive && (
          <DropdownMenuItem onClick={archiveIssue}>
            <Archive className="w-4 h-4 mr-2 text-neutral-600" />
            Archive
          </DropdownMenuItem>
        )}

        {onDelete && (
          <DropdownMenuItem 
            onClick={deleteIssue}
            className="text-red-600 focus:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
