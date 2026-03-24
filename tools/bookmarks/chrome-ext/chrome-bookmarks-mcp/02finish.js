#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')

// ANSI Color Codes for terminal output (matching 01setup.js)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
}

/**
 * Helper to limit global concurrency for file operations
 */
const createLimiter = (concurrency) => {
  let active = 0
  let head = null
  let tail = null

  const next = () => {
    if (active >= concurrency || !head) return

    active++
    const { fn, resolve, reject } = head

    // Dequeue using linked list (O(1))
    head = head.next
    if (!head) tail = null

    fn()
      .then(resolve, reject)
      .finally(() => {
        active--
        next()
      })
  }

  return (fn) =>
    new Promise((resolve, reject) => {
      const node = { fn, resolve, reject, next: null }
      if (!head) {
        head = node
        tail = node
      } else {
        tail.next = node
        tail = node
      }
      next()
    })
}

// Global limit for file operations to prevent EMFILE
const limit = createLimiter(50)

// Pre-allocated set for ignored files
const IGNORED_FILES = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini', '.gitignore', '.gitkeep'])

// Performance optimization: Hoist regexes and constants
const URL_REGEX = /URL=(.+)/
const CONTROL_CHARS = /[\x00-\x1F]/
const ALLOWED_PROTOCOLS = new Set([
  'http:',
  'https:',
  'ftp:',
  'mailto:',
  'file:',
  'data:',
  'javascript:',
])
const COLLATOR = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

/**
 * Chrome Bookmark Generator - Step 2: Generate JSON from Manual Organization
 *
 * This analyzes your manually organized filesystem structure
 * and generates the improved JSON for import back into Chrome
 */

class BookmarkGenerator {
  constructor() {
    this.workspaceDir = './workspace'
    this.outputFile = './output/Bookmarks-improved.json'
    this.stats = {
      folderCount: 0,
      bookmarkCount: 0,
      skippedCount: 0,
      previewFolders: [],
      previewBookmarks: [],
      skippedFiles: [],
    }
    this.lastDraw = 0
  }

  /**
   * Validate URL to prevent injection and ensure valid format
   */
  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false

    // Prevent control characters (newlines, etc.) which could inject INI properties
    if (CONTROL_CHARS.test(url)) return false

    try {
      const parsed = new URL(url)
      // Allow common protocols
      return ALLOWED_PROTOCOLS.has(parsed.protocol)
    } catch {
      return false
    }
  }

  /**
   * Check if file should be ignored (system files)
   */
  isIgnoredFile(name) {
    return IGNORED_FILES.has(name) || name.startsWith('._')
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Update progress indicator
   */
  updateProgress() {
    if (process.stdout.isTTY) {
      const now = Date.now()
      if (now - this.lastDraw < 50) return
      this.lastDraw = now

      process.stdout.write(
        `\r\x1b[K  ${colors.dim}Scanning... 📁 ${this.stats.folderCount} | 🔗 ${this.stats.bookmarkCount}${colors.reset}`
      )
    }
  }

  /**
   * Generate JSON from filesystem structure
   */
  async generateJSON() {
    console.log(
      `${colors.cyan}📤 Generating improved JSON and analyzing structure...${colors.reset}`
    )

    // Reset stats for fresh generation
    this.stats = {
      folderCount: 0,
      bookmarkCount: 0,
      skippedCount: 0,
      previewFolders: [],
      previewBookmarks: [],
      skippedFiles: [],
    }

    // Ensure output directory exists
    const outputDir = path.dirname(this.outputFile)
    try {
      await fs.access(outputDir)
    } catch {
      await fs.mkdir(outputDir, { recursive: true })
    }

    const generateFromFilesystem = async (dirPath, parentId = null, level = 0) => {
      // Limit readdir calls
      const items = await limit(() => fs.readdir(dirPath, { withFileTypes: true }))

      // Sort items to ensure deterministic output
      items.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1
        if (!a.isDirectory() && b.isDirectory()) return 1
        return COLLATOR.compare(a.name, b.name)
      })

      const mappedResults = await Promise.all(
        items.map(async (item) => {
          const itemPath = path.join(dirPath, item.name)

          if (item.isDirectory()) {
            // It's a folder
            this.stats.folderCount++
            this.updateProgress()
            if (this.stats.previewFolders.length < 10) {
              this.stats.previewFolders.push({
                name: item.name,
                level: level,
              })
            }

            const folder = {
              id: this.generateId(),
              title: item.name,
              children: [],
              parentId: parentId,
              dateAdded: Math.floor(Date.now() / 1000),
            }

            // Process subdirectory (unlimited recursion, I/O limited inside)
            const subItems = await generateFromFilesystem(itemPath, folder.id, level + 1)
            folder.children = subItems

            return folder
          } else if (item.name.endsWith('.url')) {
            // It's a bookmark
            // Limit readFile calls
            const urlContent = await limit(() => fs.readFile(itemPath, 'utf-8'))
            const urlMatch = urlContent.match(URL_REGEX)

            if (urlMatch) {
              const url = urlMatch[1].trim()

              // Validate URL
              if (!this.isValidUrl(url)) {
                return null
              }

              this.stats.bookmarkCount++
              this.updateProgress()
              const name = item.name.replace('.url', '')
              if (this.stats.previewBookmarks.length < 10) {
                this.stats.previewBookmarks.push({
                  name: name,
                  level: level,
                })
              }

              const bookmark = {
                id: this.generateId(),
                title: name,
                url: url,
                parentId: parentId,
                dateAdded: Math.floor(Date.now() / 1000),
              }
              return bookmark
            }
          } else if (!this.isIgnoredFile(item.name)) {
            // Track skipped file
            this.stats.skippedCount++
            if (this.stats.skippedFiles.length < 5) {
              this.stats.skippedFiles.push(item.name)
            }
          }
          return null
        })
      )

      return mappedResults.filter((item) => item !== null)
    }

    const workspacePath = this.workspaceDir
    const improvedBookmarks = await generateFromFilesystem(workspacePath)

    // Save to output
    await fs.writeFile(this.outputFile, JSON.stringify(improvedBookmarks, null, 2))
    if (process.stdout.isTTY) {
      process.stdout.write('\r\x1b[K') // Clear scanning progress
    }
    console.log(
      `  ${colors.green}✅ Saved improved bookmarks to ${colors.white}${this.outputFile}${colors.reset}`
    )

    return improvedBookmarks
  }

  /**
   * Generate summary report
   */
  generateReport() {
    // Generate analysis report (replaces old analyzeStructure output)
    console.log(`\n${colors.bright}📊 Your Organization:${colors.reset}`)
    console.log(`  ${colors.blue}📁 Folders:${colors.reset} ${this.stats.folderCount}`)
    console.log(`  ${colors.dim}🔗 Bookmarks:${colors.reset} ${this.stats.bookmarkCount}`)

    // Show folder structure
    console.log(`\n${colors.cyan}📁 Folder Structure (First 10):${colors.reset}`)
    this.stats.previewFolders.forEach((folder) => {
      const indent = '  '.repeat(folder.level)
      console.log(`${indent}${colors.blue}📁 ${folder.name}${colors.reset}`)
    })
    if (this.stats.folderCount > 10) {
      console.log(
        `  ${colors.dim}... and ${this.stats.folderCount - 10} more folders${colors.reset}`
      )
    }

    // Show bookmarks
    console.log(`\n${colors.cyan}🔗 Bookmarks (First 10):${colors.reset}`)
    this.stats.previewBookmarks.forEach((bookmark) => {
      const indent = '  '.repeat(bookmark.level)
      console.log(`${indent}🔗 ${bookmark.name}`)
    })
    if (this.stats.bookmarkCount > 10) {
      console.log(
        `  ${colors.dim}... and ${this.stats.bookmarkCount - 10} more bookmarks${colors.reset}`
      )
    }

    // Show skipped files warning
    if (this.stats.skippedCount > 0) {
      console.log(`\n${colors.yellow}⚠️  Skipped Files:${colors.reset}`)
      console.log(
        `  ${colors.dim}The following files were not included (only folders and .url files are supported):${colors.reset}`
      )
      this.stats.skippedFiles.forEach((name) => console.log(`  - ${name}`))
      if (this.stats.skippedCount > 5) {
        console.log(
          `  ${colors.dim}... and ${this.stats.skippedCount - 5} more files${colors.reset}`
        )
      }
    }

    console.log(`\n${colors.bright}📊 Generation Summary${colors.reset}`)
    console.log(colors.dim + '='.repeat(50) + colors.reset)
    console.log(`📁 Folders found:   ${colors.blue}${this.stats.folderCount}${colors.reset}`)
    console.log(`🔗 Bookmarks found: ${colors.green}${this.stats.bookmarkCount}${colors.reset}`)
    console.log(`📁 Workspace:       ${colors.yellow}${this.workspaceDir}${colors.reset}`)
    console.log(`📄 Output:          ${colors.green}${this.outputFile}${colors.reset}`)
    console.log(colors.dim + '='.repeat(50) + colors.reset)
  }

  /**
   * Show helpful instructions when workspace is missing
   */
  showMissingWorkspaceHelp() {
    console.log(`
${colors.yellow}⚠️  MISSING WORKSPACE DIRECTORY${colors.reset}
${colors.dim}The directory ${colors.white}${this.workspaceDir}${colors.dim} was not found.${colors.reset}

${colors.bright}How to fix this:${colors.reset}
This tool requires a filesystem structure to generate the bookmarks from.
You likely haven't run the setup step yet.

${colors.cyan}Please run step 1 first:${colors.reset}
${colors.green}node 01setup.js${colors.reset}

${colors.dim}This will create the ${colors.blue}workspace${colors.dim} folder from your input JSON.${colors.reset}
`)
  }

  /**
   * Main generation workflow
   */
  async generate() {
    try {
      console.log(`${colors.bright}🚀 Chrome Bookmark Generator${colors.reset}`)
      console.log(colors.dim + '='.repeat(50) + colors.reset)

      // Generate JSON (and analyze in the process)
      await this.generateJSON()

      // Generate report
      this.generateReport()

      console.log(`\n${colors.green}✅ Generation complete!${colors.reset}`)
      console.log(
        `\n${colors.bright}📄 Import this file:${colors.reset} ${colors.green}${this.outputFile}${colors.reset}`
      )
      console.log(`\n${colors.yellow}🔄 To make changes:${colors.reset}`)
      console.log(`  1. Modify the structure in ${colors.blue}workspace/${colors.reset}`)
      console.log(`  2. Run this script again: ${colors.cyan}node 02finish.js${colors.reset}`)
    } catch (error) {
      if (error.code === 'ENOENT' && error.path && error.path.includes('workspace')) {
        this.showMissingWorkspaceHelp()
      } else {
        console.error(`\n${colors.red}❌ Generation failed:${colors.reset}`, error.message)
      }
      process.exit(1)
    }
  }
}

// Run the generator
const generator = new BookmarkGenerator()
generator.generate()
