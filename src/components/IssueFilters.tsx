'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Filter,
  X,
  SlidersHorizontal,
  Calendar,
  User,
  Tag,
  ChevronDown,
  Check
} from 'lucide-react'

interface IssueFiltersProps {
  onFilterChange: (filters: FilterState) => void
  totalIssues: number
  filteredCount: number
}

export interface FilterState {
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

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open', color: 'bg-neutral-100 text-neutral-700' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-100 text-green-700' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-neutral-500 text-neutral-900' }
]

const PRIORITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'LOW', label: 'Low', color: 'bg-neutral-100 text-neutral-700' }
]

const CATEGORY_OPTIONS = [
  'Bug', 'Feature', 'Incident', 'Improvement', 'Question', 'Documentation', 'Performance', 'Security', 'Infrastructure'
]

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' }
]

export function IssueFilters({ onFilterChange, totalIssues, filteredCount }: IssueFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    category: [],
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    
    const updated = { ...filters, status: newStatus }
    setFilters(updated)
    onFilterChange(updated)
  }

  const togglePriority = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority]
    
    const updated = { ...filters, priority: newPriority }
    setFilters(updated)
    onFilterChange(updated)
  }

  const toggleCategory = (category: string) => {
    const newCategory = filters.category.includes(category)
      ? filters.category.filter(c => c !== category)
      : [...filters.category, category]
    
    const updated = { ...filters, category: newCategory }
    setFilters(updated)
    onFilterChange(updated)
  }

  const clearFilters = () => {
    const cleared: FilterState = {
      status: [],
      priority: [],
      category: [],
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    setFilters(cleared)
    onFilterChange(cleared)
  }

  const activeFilterCount = 
    filters.status.length + 
    filters.priority.length + 
    filters.category.length + 
    (filters.search ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Filter Button with Badge */}
      <div className="flex items-center gap-3">
        <Button
          variant={isOpen ? 'default' : 'outline'}
          onClick={() => setIsOpen(!isOpen)}
          className={isOpen ? 'bg-neutral-900 hover:bg-neutral-800' : ''}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
        
        {activeFilterCount > 0 && (
          <Badge className="bg-neutral-900 text-white">
            {activeFilterCount} active
          </Badge>
        )}
        
        <span className="text-sm text-neutral-600">
          Showing {filteredCount} of {totalIssues} issues
        </span>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-neutral-600 hover:text-neutral-900"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isOpen && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {STATUS_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={() => toggleStatus(option.value)}
                  />
                  <Badge className={option.color} variant="outline">
                    {option.label}
                  </Badge>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Priority Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PRIORITY_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={filters.priority.includes(option.value)}
                    onCheckedChange={() => togglePriority(option.value)}
                  />
                  <Badge className={option.color} variant="outline">
                    {option.label}
                  </Badge>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Category Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {CATEGORY_OPTIONS.map(category => (
                  <label
                    key={category}
                    className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={filters.category.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Range Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">From</label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => {
                    const updated = { ...filters, dateFrom: e.target.value }
                    setFilters(updated)
                    onFilterChange(updated)
                  }}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">To</label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => {
                    const updated = { ...filters, dateTo: e.target.value }
                    setFilters(updated)
                    onFilterChange(updated)
                  }}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Assigned To Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Assigned To
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by name or email..."
                value={filters.assignedTo || ''}
                onChange={(e) => {
                  const updated = { ...filters, assignedTo: e.target.value }
                  setFilters(updated)
                  onFilterChange(updated)
                }}
                className="text-sm"
              />
            </CardContent>
          </Card>

          {/* Sort Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Sort By
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Sort Field</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    const updated = { ...filters, sortBy: e.target.value }
                    setFilters(updated)
                    onFilterChange(updated)
                  }}
                  className="w-full p-2 border border-neutral-300 rounded-lg text-sm"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Sort Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => {
                    const updated = { ...filters, sortOrder: e.target.value as 'asc' | 'desc' }
                    setFilters(updated)
                    onFilterChange(updated)
                  }}
                  className="w-full p-2 border border-neutral-300 rounded-lg text-sm"
                >
                  <option value="desc">Descending (Newest First)</option>
                  <option value="asc">Ascending (Oldest First)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
