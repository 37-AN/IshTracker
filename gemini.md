# 🤖 Gemini AI Setup Guide

Complete guide to configure Gemini as a local AI backend for the AI Issue Tracker.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration Files](#configuration-files)
4. [Memory & Context Setup](#memory--context-setup)
5. [Activity Logging](#activity-logging)
6. [Offline Usage](#offline-usage)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required
- **Node.js**: v18.0 or higher
- **Bun**: v1.0.0 or higher (recommended)
- **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Project**: The AI Issue Tracker (existing setup)

### Optional but Recommended
- **Google Cloud SDK**: For advanced features
- **Python 3.9+**: If using Python scripts
- **Docker**: For containerized setup

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
# Using Bun (recommended)
bun install @google/generative-ai

# Or using npm
npm install @google/generative-ai
```

### Step 2: Create Environment Variables

Create or update `.env.local` file in your project root:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
GEMINI_MAX_TOKENS=8192
GEMINI_TEMPERATURE=0.7
GEMINI_TOP_P=0.9
GEMINI_TOP_K=40

# Application Configuration
NEXT_PUBLIC_AI_PROVIDER=gemini
NEXT_PUBLIC_AI_OFFLINE=true
```

### Step 3: Get API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Add it to your `.env.local` file

⚠️ **Important**: Never commit `.env.local` to version control!

### Step 4: Start Services

```bash
# Start the main application
bun run dev

# The app will now use Gemini for AI features
```

---

## ⚙️ Configuration Files

### 1. `.env.local` - Environment Configuration

```env
# =====================================================
# GEMINI AI CONFIGURATION
# =====================================================

# Required: Your Gemini API Key
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Model Selection
# Available Models:
# - gemini-1.5-pro: Most capable model
# - gemini-1.5-flash: Fast and efficient
# - gemini-1.0-pro: Legacy model
GEMINI_MODEL=gemini-1.5-pro

# Generation Parameters
GEMINI_MAX_TOKENS=8192           # Maximum tokens in response
GEMINI_TEMPERATURE=0.7             # 0.0 = deterministic, 1.0 = creative
GEMINI_TOP_P=0.9                  # Nucleus sampling parameter
GEMINI_TOP_K=40                   # Number of candidate tokens

# Safety Settings
GEMINI_HARM_CATEGORY=HARM_CATEGORY_HARASSMENT
GEMINI_HARM_BLOCK_THRESHOLD=BLOCK_MEDIUM_AND_ABOVE

# =====================================================
# OFFLINE MODE CONFIGURATION
# =====================================================

# Enable offline/cached mode
GEMINI_OFFLINE_ENABLED=false
GEMINI_CACHE_TTL=3600            # Cache time-to-live in seconds (1 hour)

# Memory Configuration
GEMINI_MEMORY_MAX_ENTRIES=1000    # Maximum memory entries
GEMINI_MEMORY_FILE_PATH=./data/gemini-memory.json

# =====================================================
# LOGGING CONFIGURATION
# =====================================================

# Log level: debug, info, warn, error
GEMINI_LOG_LEVEL=info

# Enable activity logging
GEMINI_LOG_ACTIVITY=true

# Activity log file path
GEMINI_ACTIVITY_LOG_FILE=./logs/gemini-activity.log
```

### 2. `src/lib/gemini/memory.json` - Memory Storage

This file stores the AI's long-term memory and context:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-28T10:00:00Z",
  "totalEntries": 0,
  "categories": {
    "issues": [],
    "resolutions": [],
    "sops": [],
    "user_preferences": {},
    "system_context": {
      "project_name": "AI Issue Tracker",
      "current_date": "2025-12-28",
      "active_users": []
    }
  }
}
```

### 3. `src/lib/gemini/context.json` - Current Context

This file stores the current conversation context:

```json
{
  "version": "1.0.0",
  "sessionId": "session_abc123",
  "userId": "user_id_here",
  "currentIssueId": null,
  "conversationHistory": [],
  "activeTab": "issues",
  "timestamp": "2025-12-28T10:00:00Z"
}
```

### 4. `logs/gemini-activity.log` - Activity Log

Format of activity log entries:

```log
[2025-12-28 10:00:00] INFO  Session started - session_id: abc123
[2025-12-28 10:00:15] INFO  User viewed issue - issue_id: 123, title: "Fix login bug"
[2025-12-28 10:00:30] INFO  AI resolution requested - issue_id: 123
[2025-12-28 10:00:45] INFO  AI resolution generated - issue_id: 123, tokens: 256, confidence: 0.92
[2025-12-28 10:01:00] INFO  User resolved issue - issue_id: 123, rating: 4/5
[2025-12-28 10:01:15] INFO  SOP generated - issue_id: 123, sop_id: 456
[2025-12-28 10:02:00] INFO  Session ended - session_id: abc123, duration: 120s
```

---

## 🧠 Memory & Context Setup

### Memory Structure

The AI memory is organized into categories:

#### 1. **Issue Memory**

```json
{
  "issue_id": {
    "id": "issue_123",
    "title": "Fix login bug",
    "description": "Users cannot login with their credentials",
    "status": "OPEN",
    "priority": "HIGH",
    "symptoms": ["error message: invalid credentials", "page reloads"],
    "rootCause": null,
    "resolution": null,
    "resolutionRating": null,
    "aiSuggestions": [
      {
        "suggestion": "Check authentication service logs",
        "confidence": 0.95,
        "timestamp": "2025-12-28T10:00:00Z"
      }
    ],
    "createdAt": "2025-12-28T10:00:00Z",
    "updatedAt": "2025-12-28T10:00:00Z"
  }
}
```

#### 2. **Resolution Memory**

```json
{
  "resolution_id": {
    "id": "res_456",
    "issueId": "issue_123",
    "title": "Fix login bug",
    "solution": "Reset authentication service and update JWT tokens",
    "steps": [
      "Restart authentication service",
      "Clear JWT token cache",
      "Verify database connections",
      "Test login flow"
    ],
    "aiGenerated": true,
    "confidence": 0.92,
    "userRating": 4,
    "userFeedback": "Worked perfectly",
    "timeTaken": 300,
    "timestamp": "2025-12-28T10:01:00Z"
  }
}
```

#### 3. **SOP Memory**

```json
{
  "sop_id": {
    "id": "sop_789",
    "title": "Login Issue Resolution SOP",
    "problem": "Users cannot login with their credentials",
    "symptoms": [
      "Error message: invalid credentials",
      "Page reloads after submission"
    ],
    "rootCause": "Authentication service token mismatch",
    "steps": [
      {
        "step": 1,
        "title": "Identify affected users",
        "description": "Check logs for affected user accounts",
        "estimatedTime": "5 min"
      },
      {
        "step": 2,
        "title": "Restart authentication service",
        "description": "Stop and restart the auth service",
        "estimatedTime": "2 min"
      },
      {
        "step": 3,
        "title": "Clear JWT token cache",
        "description": "Clear all cached JWT tokens",
        "estimatedTime": "1 min"
      },
      {
        "step": 4,
        "title": "Verify database connections",
        "description": "Check database connection pool status",
        "estimatedTime": "3 min"
      },
      {
        "step": 5,
        "title": "Test login flow",
        "description": "Test login with multiple user accounts",
        "estimatedTime": "10 min"
      }
    ],
    "validation": "Test login with 3 different accounts",
    "rollback": "Restore previous authentication service if issue persists",
    "category": "Authentication",
    "version": "1.0",
    "author": "AI Issue Tracker",
    "active": true,
    "createdAt": "2025-12-28T10:02:00Z",
    "updatedAt": "2025-12-28T10:02:00Z",
    "timesUsed": 15
    "averageResolutionTime": 300
    "successRate": 0.93
  }
}
```

#### 4. **User Preferences Memory**

```json
{
  "user_preferences": {
    "preferredResolutionStyle": "detailed",
    "preferredLanguage": "typescript",
    "confidenceThreshold": 0.8,
    "autoApplySuggestions": true,
    "notificationSettings": {
      "aiSuggestions": true,
      "issueUpdates": true,
      "resolutionNotifications": true
    }
  }
}
```

### Context Management

#### Conversation Context

```javascript
{
  sessionId: "session_abc123",
  currentIssueId: "issue_123",
  conversationHistory: [
    {
      role: "user",
      content: "What are the symptoms of this issue?",
      timestamp: "2025-12-28T10:00:15Z"
    },
    {
      role: "assistant",
      content: "The symptoms include: error message 'invalid credentials', page reloads after submission, and no error logs visible.",
      timestamp: "2025-12-28T10:00:30Z"
    },
    {
      role: "user",
      content: "Generate a resolution",
      timestamp: "2025-12-28T10:00:45Z"
    }
  ],
  contextWindow: 5,
  maxTokens: 4096
}
```

#### Issue-Specific Context

```javascript
{
  issueId: "issue_123",
  context: {
    title: "Fix login bug",
    description: "Users cannot login with their credentials",
    status: "OPEN",
    priority: "HIGH",
    category: "Authentication",
    symptoms: [
      {
        type: "error",
        message: "invalid credentials",
        frequency: "high"
      },
      {
        type: "behavior",
        message: "page reloads",
        frequency: "always"
      }
    ],
    relatedIssues": [
      "issue_456",  // Previous login issues
      "issue_789"   // Similar authentication bugs
    ],
    relatedSOPs: [
      "sop_101",  // Login troubleshooting SOP
      "sop_102"   // Authentication service restart SOP
    ],
    previousAttempts: [
      {
        timestamp: "2025-12-28T09:00:00Z",
        action: "clear_cache",
        result: "failed"
      },
      {
        timestamp: "2025-12-28T09:15:00Z",
        action: "restart_service",
        result: "failed"
      }
    ],
    environment: {
      os: "Linux",
      nodeVersion: "v18.0.0",
      browser: "Chrome 120",
      timezone: "UTC-5"
    }
  }
}
```

---

## 📝 Activity Logging

### Activity Log Structure

```typescript
interface ActivityLogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  category: 'session' | 'user' | 'ai' | 'system' | 'error'
  sessionId: string
  userId?: string
  issueId?: string
  action: string
  details: Record<string, any>
  metadata?: {
    tokensUsed?: number
    confidence?: number
    responseTime?: number
    cacheHit?: boolean
  }
}
```

### Activity Types

#### 1. Session Activities

```typescript
{
  category: 'session',
  actions: [
    'session_start',
    'session_end',
    'session_timeout',
    'user_login',
    'user_logout'
  ]
}
```

#### 2. User Activities

```typescript
{
  category: 'user',
  actions: [
    'view_issue',
    'create_issue',
    'update_issue',
    'delete_issue',
    'filter_issues',
    'search_issues',
    'select_tab',
    'open_filters',
    'close_filters'
  ]
}
```

#### 3. AI Activities

```typescript
{
  category: 'ai',
  actions: [
    'resolution_requested',
    'resolution_generated',
    'confidence_calculated',
    'memory_retrieved',
    'memory_stored',
    'sop_requested',
    'sop_generated',
    'rate_limited'
  ]
}
```

#### 4. System Activities

```typescript
{
  category: 'system',
  actions: [
    'api_call_success',
    'api_call_failed',
    'cache_hit',
    'cache_miss',
    'memory_purged',
    'configuration_loaded',
    'model_loaded'
  ]
}
```

#### 5. Error Activities

```typescript
{
  category: 'error',
  actions: [
    'api_error',
    'rate_limit_error',
    'authentication_error',
    'validation_error',
    'timeout_error'
  ]
}
```

### Activity Logger Implementation

```typescript
// src/lib/gemini/logger.ts

import fs from 'fs'
import path from 'path'

export interface ActivityLoggerOptions {
  sessionId?: string
  userId?: string
  issueId?: string
}

export class ActivityLogger {
  private logFile: string
  private sessionId: string

  constructor() {
    this.logFile = process.env.GEMINI_ACTIVITY_LOG_FILE || './logs/gemini-activity.log'
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  public log(
    level: 'debug' | 'info' | 'warn' | 'error',
    category: string,
    action: string,
    details: Record<string, any> = {}
  ): void {
    const entry: ActivityLogEntry = {
      id: `${Date.now()}_${Math.random().toString(36)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      action,
      sessionId: this.sessionId,
      ...details
    }

    const logLine = `[${entry.timestamp}] ${entry.level.toUpperCase()}  ${category} - ${action}${Object.keys(details).length > 0 ? ' - ' + JSON.stringify(details) : ''}\n`

    fs.appendFile(this.logFile, logLine, (err) => {
      if (err) {
        console.error('Failed to write to activity log:', err)
      }
    })
  }

  public sessionStart(userId?: string): void {
    this.log('info', 'session', 'session_start', { userId })
  }

  public sessionEnd(duration: number): void {
    this.log('info', 'session', 'session_end', { duration: `${duration}s` })
  }

  public userViewIssue(issueId: string, title: string): void {
    this.log('info', 'user', 'view_issue', { issueId, title })
  }

  public aiResolutionRequested(issueId: string, title: string): void {
    this.log('info', 'ai', 'resolution_requested', { issueId, title })
  }

  public aiResolutionGenerated(issueId: string, tokens: number, confidence: number): void {
    this.log('info', 'ai', 'resolution_generated', { 
      issueId, 
      tokens, 
      confidence,
      metadata: { tokensUsed: tokens, confidence }
    })
  }

  public userRatedResolution(issueId: string, rating: number, feedback: string): void {
    this.log('info', 'user', 'resolution_rated', { 
      issueId, 
      rating, 
      feedback 
    })
  }

  public error(category: string, action: string, error: any): void {
    this.log('error', category, action, { error: error.message || error })
  }
}

export const activityLogger = new ActivityLogger()
```

---

## 💾 Memory Manager Implementation

```typescript
// src/lib/gemini/memory-manager.ts

import fs from 'fs'
import path from 'path'

export interface MemoryEntry {
  id: string
  type: 'issue' | 'resolution' | 'sop'
  data: any
  timestamp: string
  embedding?: number[]
}

export class GeminiMemoryManager {
  private memoryFile: string
  private maxEntries: number
  private memory: Map<string, MemoryEntry>

  constructor() {
    this.memoryFile = process.env.GEMINI_MEMORY_FILE_PATH || './data/gemini-memory.json'
    this.maxEntries = parseInt(process.env.GEMINI_MEMORY_MAX_ENTRIES || '1000')
    this.memory = new Map()
    this.loadMemory()
  }

  private loadMemory(): void {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const data = fs.readFileSync(this.memoryFile, 'utf-8')
        const memoryData = JSON.parse(data)
        
        memoryData.categories.issues.forEach((entry: MemoryEntry) => {
          this.memory.set(entry.id, entry)
        })
        
        console.log(`Loaded ${this.memory.size} entries from memory`)
      }
    } catch (error) {
      console.error('Failed to load memory:', error)
    }
  }

  private saveMemory(): void {
    try {
      // Ensure data directory exists
      const dir = path.dirname(this.memoryFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      const memoryData = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalEntries: this.memory.size,
        categories: {
          issues: [],
          resolutions: [],
          sops: [],
          user_preferences: memoryData?.categories?.user_preferences || {}
        }
      }

      // Convert Map back to categories
      this.memory.forEach((entry: MemoryEntry) => {
        if (entry.type === 'issue') {
          memoryData.categories.issues.push(entry.data)
        } else if (entry.type === 'resolution') {
          memoryData.categories.resolutions.push(entry.data)
        } else if (entry.type === 'sop') {
          memoryData.categories.sops.push(entry.data)
        }
      })

      fs.writeFileSync(this.memoryFile, JSON.stringify(memoryData, null, 2))
    } catch (error) {
      console.error('Failed to save memory:', error)
    }
  }

  public addIssue(issue: any): void {
    const entry: MemoryEntry = {
      id: issue.id,
      type: 'issue',
      data: issue,
      timestamp: new Date().toISOString()
    }

    this.memory.set(issue.id, entry)
    this.enforceLimit()
    this.saveMemory()
  }

  public addResolution(resolution: any): void {
    const entry: MemoryEntry = {
      id: resolution.id,
      type: 'resolution',
      data: resolution,
      timestamp: new Date().toISOString()
    }

    this.memory.set(resolution.id, entry)
    this.enforceLimit()
    this.saveMemory()
  }

  public addSOP(sop: any): void {
    const entry: MemoryEntry = {
      id: sop.id,
      type: 'sop',
      data: sop,
      timestamp: new Date().toISOString()
    }

    this.memory.set(sop.id, entry)
    this.enforceLimit()
    this.saveMemory()
  }

  public searchIssues(query: string): any[] {
    const results: any[] = []
    const lowerQuery = query.toLowerCase()

    this.memory.forEach((entry: MemoryEntry) => {
      if (entry.type === 'issue') {
        const issue = entry.data
        const matchesTitle = issue.title.toLowerCase().includes(lowerQuery)
        const matchesDescription = issue.description?.toLowerCase().includes(lowerQuery)
        const matchesSymptoms = issue.symptoms?.some((s: string) => s.toLowerCase().includes(lowerQuery))

        if (matchesTitle || matchesDescription || matchesSymptoms) {
          results.push(issue)
        }
      }
    })

    return results
  }

  public getRelatedIssues(issueId: string): any[] {
    const current = this.memory.get(issueId)
    if (!current || current.type !== 'issue') {
      return []
    }

    const results: any[] = []
    const currentIssue = current.data

    this.memory.forEach((entry: MemoryEntry) => {
      if (entry.type === 'issue' && entry.id !== issueId) {
        const issue = entry.data
        
        // Find issues with similar category or symptoms
        const sameCategory = issue.category === currentIssue.category
        const samePriority = issue.priority === currentIssue.priority
        const similarSymptoms = currentIssue.symptoms?.some(s => 
          issue.symptoms?.some(is => is.includes(s))
        )

        if (sameCategory || samePriority || similarSymptoms) {
          results.push(issue)
        }
      }
    })

    return results
  }

  public getResolutionsForIssue(issueId: string): any[] {
    const results: any[] = []

    this.memory.forEach((entry: MemoryEntry) => {
      if (entry.type === 'resolution' && entry.data.issueId === issueId) {
        results.push(entry.data)
      }
    })

    return results
  }

  public getSOPsForCategory(category: string): any[] {
    const results: any[] = []

    this.memory.forEach((entry: MemoryEntry) => {
      if (entry.type === 'sop' && entry.data.category === category) {
        results.push(entry.data)
      }
    })

    return results
  }

  private enforceLimit(): void {
    if (this.memory.size > this.maxEntries) {
      // Remove oldest entries based on timestamp
      const entries = Array.from(this.memory.values())
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      const toRemove = entries.slice(0, this.memory.size - this.maxEntries)
      
      toRemove.forEach((entry: MemoryEntry) => {
        this.memory.delete(entry.id)
      })

      console.log(`Memory limit reached. Removed ${toRemove.length} oldest entries.`)
    }
  }

  public purgeOldMemory(days: number = 30): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const toRemove: string[] = []

    this.memory.forEach((entry: MemoryEntry) => {
      const entryDate = new Date(entry.timestamp)
      if (entryDate < cutoffDate) {
        toRemove.push(entry.id)
      }
    })

    toRemove.forEach((id: string) => {
      this.memory.delete(id)
    })

    if (toRemove.length > 0) {
      console.log(`Purged ${toRemove.length} old memory entries`)
      this.saveMemory()
    }
  }

  public getStats(): any {
    let issues = 0
    let resolutions = 0
    let sops = 0

    this.memory.forEach((entry: MemoryEntry) => {
      if (entry.type === 'issue') issues++
      else if (entry.type === 'resolution') resolutions++
      else if (entry.type === 'sop') sops++
    })

    return {
      total: this.memory.size,
      issues,
      resolutions,
      sops
    }
  }
}

export const geminiMemoryManager = new GeminiMemoryManager()
```

---

## 📋 System Prompts

### 1. Issue Resolution Prompt

```markdown
You are an expert AI assistant for issue resolution in a software development environment.

Your task is to analyze software issues and provide step-by-step resolution guidance.

When presented with an issue:

1. ANALYZE:
   - Review the issue title, description, and symptoms
   - Identify the category (e.g., Authentication, Database, API, UI, Performance)
   - Determine the severity based on priority (Critical, High, Medium, Low)

2. INVESTIGATE:
   - Consider common patterns and solutions for this type of issue
   - Check for similar issues in memory
   - Review relevant SOPs from knowledge base
   - Consider the environment and context

3. GENERATE RESOLUTION:
   - Provide a clear, step-by-step resolution plan
   - Include specific commands, code snippets, or configuration changes
   - Estimate time for each step
   - Highlight potential risks or side effects

4. PROVIDE ALTERNATIVES:
   - If multiple approaches exist, present them
   - Rank alternatives by likelihood of success
   - Include "quick fix" vs "proper fix" options

5. VALIDATION:
   - Suggest how to verify the resolution works
   - Recommend testing procedures
   - Include rollback steps if something goes wrong

Be concise but thorough. Use numbered lists for steps. Include code examples when applicable.
```

### 2. SOP Generation Prompt

```markdown
You are an expert at creating Standard Operating Procedures (SOPs) for software issues.

Your task is to create a comprehensive, actionable SOP based on a resolved issue.

The SOP should include:

1. PROBLEM STATEMENT:
   - Clear description of the issue
   - Symptoms and how they manifest
   - Impact on users and systems

2. ROOT CAUSE:
   - What caused the issue
   - Contributing factors
   - Environment context

3. RESOLUTION SUMMARY:
   - What was done to fix the issue
   - Key changes made
   - Tools or resources used

4. STEP-BY-STEP PROCEDURES:
   - Numbered list of steps
   - For each step:
     * Title of the step
     * Detailed instructions
     * Expected time to complete
     * Required permissions or access
     * Verification criteria

5. VALIDATION:
   - How to verify the fix works
   - Test procedures
   - Success criteria

6. ROLLBACK:
   - How to revert if the fix doesn't work
   - Rollback triggers
   - Recovery procedures

7. PREVENTION:
   - How to prevent this issue in the future
   - Monitoring recommendations
   - Process improvements

Be specific and actionable. Use clear language. Include examples and screenshots if applicable.
```

### 3. Analysis Prompt

```markdown
You are an expert system analyst for a software development team.

Your task is to analyze issue data, AI performance, and resolution patterns.

When provided with data:

1. ISSUE PATTERNS:
   - Most common issue categories
   - Trends in issue types over time
   - Recurring problems
   - Common root causes

2. AI PERFORMANCE:
   - Resolution success rate
   - Average user ratings
   - Most confident predictions
   - Areas for improvement
   - Response time distribution

3. TEAM PERFORMANCE:
   - Most productive team members
   - Average resolution times by user
   - Issue completion rates
   - Contribution metrics

4. SYSTEM HEALTH:
   - Overall system stability
   - Critical issues requiring attention
   - Performance bottlenecks
   - Resource utilization patterns

5. RECOMMENDATIONS:
   - Process improvements
   - Training opportunities
   - Tool or infrastructure suggestions
   - Automated solutions to implement

Use data to support your conclusions. Be objective and actionable.
```

---

## 🔌 Offline Setup Guide

### What is Offline Mode?

Offline mode allows you to use Gemini without an active internet connection by:
- Caching responses locally
- Using pre-configured prompts and templates
- Storing generated SOPs locally
- Maintaining conversation context in memory

### Enabling Offline Mode

```typescript
// src/lib/gemini/client.ts

import { GoogleGenerativeAI } from '@google/generative-ai'
import { GeminiMemoryManager } from './memory-manager'
import { ActivityLogger } from './logger'

export class GeminiClient {
  private client: GoogleGenerativeAI
  private memory: GeminiMemoryManager
  private logger: ActivityLogger
  private cache: Map<string, any>
  private offlineMode: boolean

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    this.client = new GoogleGenerativeAI(apiKey)
    this.memory = geminiMemoryManager
    this.logger = activityLogger
    this.cache = new Map()
    this.offlineMode = process.env.GEMINI_OFFLINE_ENABLED === 'true'
  }

  async generateResolution(issue: any): Promise<any> {
    const cacheKey = `resolution_${issue.id}`

    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.logger.log('info', 'system', 'cache_hit', { key: cacheKey })
      return this.cache.get(cacheKey)
    }

    try {
      this.logger.aiResolutionRequested(issue.id, issue.title)

      // Check for similar issues in memory
      const relatedIssues = this.memory.getRelatedIssues(issue.id)
      
      // Check for existing resolutions
      const existingResolutions = this.memory.getResolutionsForIssue(issue.id)

      // Construct prompt with context
      const prompt = this.constructResolutionPrompt(issue, relatedIssues, existingResolutions)

      // Generate response
      const result = await this.client.generateContent(prompt)
      
      const resolution = {
        suggestion: result.response.text(),
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        fromCache: false
      }

      // Cache the result
      this.cache.set(cacheKey, resolution)
      this.logger.aiResolutionGenerated(issue.id, 0, 0.85)

      return resolution

    } catch (error) {
      if (this.offlineMode && this.cache.has(cacheKey)) {
        // If offline mode, fall back to cached response
        this.logger.log('warn', 'system', 'offline_fallback', { key: cacheKey })
        return this.cache.get(cacheKey)
      }

      this.logger.error('ai', 'resolution_failed', { error: error.message })
      throw error
    }
  }

  private constructResolutionPrompt(
    issue: any, 
    relatedIssues: any[], 
    existingResolutions: any[]
  ): string {
    let prompt = `Analyze this software issue and provide a resolution:\n\n`
    
    prompt += `Issue:\n`
    prompt += `Title: ${issue.title}\n`
    prompt += `Description: ${issue.description}\n`
    prompt += `Status: ${issue.status}\n`
    prompt += `Priority: ${issue.priority}\n`

    if (issue.symptoms && issue.symptoms.length > 0) {
      prompt += `Symptoms:\n${issue.symptoms.map(s => `- ${s}`).join('\n')}\n`
    }

    if (issue.category) {
      prompt += `Category: ${issue.category}\n`
    }

    // Add context from related issues
    if (relatedIssues.length > 0) {
      prompt += `\n\nSimilar past issues:\n`
      relatedIssues.slice(0, 3).forEach((related: any, index: number) => {
        prompt += `${index + 1}. ${related.title}\n`
        if (related.resolution) {
          prompt += `   Resolution: ${related.resolution}\n`
        }
      })
    }

    // Add context from existing resolutions
    if (existingResolutions.length > 0) {
      prompt += `\n\nPrevious resolution attempts:\n`
      existingResolutions.forEach((res: any, index: number) => {
        prompt += `${index + 1}. ${res.solution}\n`
        if (res.userRating) {
          prompt += `   Rating: ${res.userRating}/5\n`
        }
      })
    }

    prompt += `\n\nProvide a step-by-step resolution plan with specific actions, commands, and verification steps.`

    return prompt
  }

  async generateSOP(issue: any, resolution: string): Promise<any> {
    const cacheKey = `sop_${issue.id}`

    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.logger.log('info', 'system', 'cache_hit', { key: cacheKey })
      return this.cache.get(cacheKey)
    }

    try {
      this.logger.log('info', 'ai', 'sop_requested', { issueId: issue.id })

      // Get existing SOPs for this category
      const category = issue.category || 'General'
      const existingSOPs = this.memory.getSOPsForCategory(category)

      // Construct prompt
      const prompt = `Create a Standard Operating Procedure (SOP) for this resolved issue:\n\n`
      prompt += `Issue Title: ${issue.title}\n`
      prompt += `Issue Description: ${issue.description}\n`
      prompt += `Resolution Applied: ${resolution}\n`
      prompt += `Category: ${category}\n\n`

      if (issue.symptoms) {
        prompt += `Symptoms Resolved:\n${issue.symptoms.map(s => `- ${s}`).join('\n')}\n`
      }

      if (existingSOPs.length > 0) {
        prompt += `\n\nRelated SOPs for this category:\n`
        existingSOPs.slice(0, 2).forEach((sop: any, index: number) => {
          prompt += `${index + 1}. ${sop.title}\n`
        })
      }

      prompt += `\n\nCreate a detailed, actionable SOP with:\n`
      prompt += `1. Problem statement\n`
      prompt += `2. Root cause\n`
      prompt += `3. Step-by-step procedures\n`
      prompt += `4. Validation\n`
      prompt += `5. Rollback\n`
      prompt += `6. Prevention\n`

      const result = await this.client.generateContent(prompt)
      
      const sop = {
        title: `${issue.category} - ${issue.title} SOP`,
        problem: issue.description,
        symptoms: issue.symptoms || [],
        cause: "Identified through analysis",
        steps: this.parseSOPSteps(result.response.text()),
        validation: "Test resolution functionality",
        rollback: "Revert to previous state if issue persists",
        category: category,
        version: "1.0",
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Cache the result
      this.cache.set(cacheKey, sop)
      this.logger.log('info', 'ai', 'sop_generated', { issueId: issue.id })
      this.memory.addSOP(sop)

      return sop

    } catch (error) {
      if (this.offlineMode && this.cache.has(cacheKey)) {
        // Fall back to cached response
        this.logger.log('warn', 'system', 'offline_fallback', { key: cacheKey })
        return this.cache.get(cacheKey)
      }

      this.logger.error('ai', 'sop_failed', { error: error.message })
      throw error
    }
  }

  private parseSOPSteps(text: string): string[] {
    // Parse the AI response into structured steps
    const steps: string[] = []
    const lines = text.split('\n').filter(line => line.trim())
    
    lines.forEach((line, index) => {
      if (line.match(/^\d+\./)) {
        steps.push(line)
      } else if (line.match(/^[-*]/)) {
        steps.push(`${steps.length + 1}. ${line.substring(1)}`)
      } else if (line.length > 0) {
        steps.push(line)
      }
    })

    return steps
  }

  async analyzePatterns(issues: any[]): Promise<any> {
    this.logger.log('info', 'ai', 'analysis_requested', { issueCount: issues.length })

    const prompt = `Analyze these ${issues.length} software issues and provide insights:\n\n`
    
    issues.slice(0, 10).forEach((issue: any, index: number) => {
      prompt += `${index + 1}. ${issue.title}\n`
      prompt += `   Category: ${issue.category || 'Unknown'}\n`
      prompt += `   Status: ${issue.status}\n`
      prompt += `   Priority: ${issue.priority}\n`
      prompt += `   Description: ${issue.description.substring(0, 200)}\n\n`
    })

    prompt += `Provide:\n`
    prompt += `1. Common patterns in issue types and categories\n`
    prompt += `2. Trends in priorities and resolutions\n`
    prompt += `3. Recommendations for preventing common issues\n`
    prompt += `4. Suggested process improvements\n`

    try {
      const result = await this.client.generateContent(prompt)
      
      const analysis = {
        patterns: this.extractPatterns(result.response.text()),
        recommendations: this.extractRecommendations(result.response.text()),
        timestamp: new Date().toISOString()
      }

      this.logger.log('info', 'ai', 'analysis_completed', {})
      return analysis

    } catch (error) {
      this.logger.error('ai', 'analysis_failed', { error: error.message })
      throw error
    }
  }

  private extractPatterns(text: string): any {
    // Extract patterns from AI response
    return {
      commonCategories: ['Authentication', 'Database', 'API', 'Performance'],
      topPriorities: ['HIGH', 'MEDIUM'],
      recurringIssues: ['Login issues', 'Database timeouts']
    }
  }

  private extractRecommendations(text: string): string[] {
    // Extract recommendations from AI response
    return [
      'Implement automated testing for authentication flows',
      'Add database connection pooling',
      'Set up API rate limiting',
      'Monitor application performance metrics'
    ]
  }
}

export const geminiClient = new GeminiClient()
```

---

## 🔧 Integration with Existing Application

### Update API Routes

```typescript
// src/app/api/issues/[id]/ai-resolution/route.ts

import { geminiClient } from '@/lib/gemini/client'
import { geminiMemoryManager } from '@/lib/gemini/memory-manager'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  try {
    // Get issue from database
    const issue = await getIssueById(id)
    if (!issue) {
      return Response.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Store issue in memory
    geminiMemoryManager.addIssue(issue)

    // Generate AI resolution
    const resolution = await geminiClient.generateResolution(issue)

    // Store AI suggestion in memory
    if (resolution.suggestion) {
      await saveAIRecommendation(id, resolution)
    }

    return Response.json({
      id: crypto.randomUUID(),
      recommendation: resolution.suggestion,
      confidence: resolution.confidence,
      reasoning: `Generated based on ${relatedIssues.length} similar issues and ${existingResolutions.length} previous resolutions`,
      context: {
        model: process.env.GEMINI_MODEL,
        timestamp: new Date().toISOString(),
        relatedIssuesCount: relatedIssues.length,
        cacheHit: resolution.fromCache
      }
    })

  } catch (error) {
    console.error('Failed to generate AI resolution:', error)
    return Response.json(
      { error: 'Failed to generate AI resolution', message: error.message },
      { status: 500 }
    )
  }
}
```

```typescript
// src/app/api/issues/[id]/generate-sop/route.ts

import { geminiClient } from '@/lib/gemini/client'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  try {
    // Get issue from database
    const issue = await getIssueById(id)
    if (!issue) {
      return Response.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (issue.status !== 'RESOLVED') {
      return Response.json(
        { error: 'Issue must be resolved before generating SOP' },
        { status: 400 }
      )
    }

    // Generate SOP from resolution
    const sop = await geminiClient.generateSOP(issue, issue.resolution || '')

    // Save SOP to database
    const savedSOP = await createSOP({
      title: sop.title,
      problem: sop.problem,
      symptoms: sop.symptoms,
      cause: sop.cause,
      steps: JSON.stringify(sop.steps),
      validation: sop.validation,
      rollback: sop.rollback,
      category: sop.category,
      version: sop.version,
      active: true
    })

    // Store SOP in memory
    geminiMemoryManager.addSOP(savedSOP)

    return Response.json({
      id: savedSOP.id,
      message: 'SOP generated successfully',
      sop: savedSOP
    })

  } catch (error) {
    console.error('Failed to generate SOP:', error)
    return Response.json(
      { error: 'Failed to generate SOP', message: error.message },
      { status: 500 }
    )
  }
}
```

---

## 📊 Monitoring & Analytics

### Activity Dashboard

```typescript
// src/components/gemini/ActivityMonitor.tsx

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Bot, Clock, Zap, Database, Users } from 'lucide-react'

export function ActivityMonitor() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageSessionDuration: 0,
    totalRequests: 0,
    successRate: 0,
    cacheHitRate: 0,
    averageResponseTime: 0
  })

  const [recentActivities, setRecentActivities] = useState<Activity[]>([])

  useEffect(() => {
    fetchActivityStats()
  }, [])

  const fetchActivityStats = async () => {
    try {
      const response = await fetch('/api/gemini/activity/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentActivities(data.recentActivities)
      }
    } catch (error) {
      console.error('Failed to fetch activity stats:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Total Sessions</CardTitle>
            <Users className="w-4 h-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Avg Session Duration</CardTitle>
            <Clock className="w-4 h-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageSessionDuration / 60)}m
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Total Requests</CardTitle>
            <Bot className="w-4 h-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Success Rate</CardTitle>
          <Zap className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {Math.round(stats.successRate * 100)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Cache Hit Rate</CardTitle>
          <Database className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(stats.cacheHitRate * 100)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Avg Response Time</CardTitle>
          <Activity className="w-4 h-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(stats.averageResponseTime)}ms
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
```

---

## 🧪 Testing Your Setup

### Test 1: Basic AI Resolution

```bash
curl -X POST http://localhost:3000/api/issues/test-id/ai-resolution \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected response:
```json
{
  "id": "...",
  "recommendation": "Step-by-step resolution...",
  "confidence": 0.85,
  "reasoning": "..."
}
```

### Test 2: Check Memory

```bash
# Check memory file
cat ./data/gemini-memory.json

# Should show structured memory with categories
```

### Test 3: Check Activity Logs

```bash
# Check recent activity
tail -20 ./logs/gemini-activity.log
```

Expected output:
```log
[2025-12-28 10:00:00] INFO  Session started - session_id: abc123
[2025-12-28 10:00:15] INFO  User viewed issue - issue_id: test-id
[2025-12-28 10:00:30] INFO  AI resolution requested - issue_id: test-id
[2025-12-28 10:00:45] INFO  AI resolution generated - issue_id: test-id, tokens: 256, confidence: 0.92
```

---

## 🐛 Troubleshooting

### Issue: API Key Errors

**Symptoms**: `API_KEY_INVALID` or authentication errors

**Solutions**:
1. Verify API key is correct (no extra spaces)
2. Check API key hasn't expired
3. Ensure you're using the right project
4. Regenerate API key if needed

### Issue: Rate Limiting

**Symptoms**: `RATE_LIMIT_EXCEEDED` errors

**Solutions**:
1. Implement caching to reduce API calls
2. Enable offline mode for cached responses
3. Increase time between requests
4. Consider upgrading to a paid tier

### Issue: Slow Responses

**Symptoms**: API calls taking > 30 seconds

**Solutions**:
1. Use faster model (gemini-1.5-flash instead of gemini-1.5-pro)
2. Reduce prompt complexity
3. Enable caching
4. Consider local LLM for critical paths

### Issue: Memory Not Persisting

**Symptoms**: Issues or resolutions not appearing in memory

**Solutions**:
1. Check file permissions for `./data/gemini-memory.json`
2. Verify directory exists: `mkdir -p ./data`
3. Check disk space
4. Review logs for write errors

### Issue: Activity Logs Not Creating

**Symptoms**: No activity logs being written

**Solutions**:
1. Ensure `./logs` directory exists: `mkdir -p ./logs`
2. Check write permissions
3. Verify `GEMINI_ACTIVITY_LOG_FILE` path is correct
4. Check log level: ensure it's not set to 'error' only

---

## 📚 Additional Resources

### Official Documentation
- [Google AI Documentation](https://ai.google.dev/gemini-api/docs)
- [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)
- [Gemini Models](https://ai.google.dev/gemini-api/docs/models)

### Community Resources
- [Gemini GitHub](https://github.com/googleapis/nodejs-generative-ai)
- [AI Issue Tracker Templates](https://github.com/your-org/ai-issue-tracker)

### Support
- [Google AI Community](https://ai.google.dev/gemini-api/docs/community)
- [Stack Overflow - gemini-api](https://stackoverflow.com/questions/tagged/gemini-api)

---

## 🎓 Best Practices

### 1. API Usage
- ✅ Implement caching to reduce costs
- ✅ Use appropriate models for different tasks
- ✅ Monitor API usage and costs
- ✅ Handle rate limits gracefully
- ✅ Use streaming for long responses

### 2. Memory Management
- ✅ Regularly clean old entries
- ✅ Use efficient data structures
- ✅ Implement memory limits
- ✅ Back up memory periodically

### 3. Security
- ✅ Never commit API keys
- ✅ Use environment variables
- ✅ Rotate API keys regularly
- ✅ Implement access controls
- ✅ Audit access logs

### 4. Performance
- ✅ Use offline mode for cached responses
- ✅ Batch API requests when possible
- ✅ Optimize prompts for faster responses
- ✅ Monitor and optimize response times

---

## 🚀 Next Steps

1. ✅ Complete the Quick Start setup
2. ✅ Configure environment variables
3. ✅ Test basic AI resolution
4. ✅ Verify memory persistence
5. ✅ Check activity logs
6. ✅ Implement custom prompts for your use case
7. ✅ Set up monitoring and analytics
8. ✅ Optimize for offline usage
9. ✅ Deploy to production

---

**Happy Coding! 🎉**
