#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')

/**
 * Chrome Bookmark Setup - Step 1: Create Filesystem Structure
 *
 * This creates the filesystem structure from your original JSON
 * so you can manually organize it using your file explorer
 */

// ANSI Color Codes for terminal output
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

// Pre-compiled regexes for sanitization
const INVALID_CHARS = /[<>:"/\\|?*]/g
const CONTROL_CHARS = /[\x00-\x1F]/g

class BookmarkSetup {
  constructor() {
    this.inputFile = './input/Bookmarks.json'
    this.workspaceDir = './workspace'
    this.lastDraw = 0
  }

  /**
   * Validate URL to prevent injection and ensure valid format
   */
  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false

    // Prevent control characters (newlines, etc.) which could inject INI properties
    if (/[\x00-\x1F]/.test(url)) return false

    try {
      const parsed = new URL(url)
      // Allow common protocols
      return ['http:', 'https:', 'ftp:', 'mailto:', 'file:', 'data:', 'javascript:'].includes(
        parsed.protocol
      )
    } catch {
      return false
    }
  }

  /**
   * Load original JSON
   */
  async loadOriginalJSON() {
    console.log(`${colors.cyan}📥 Loading original bookmarks...${colors.reset}`)

    try {
      const data = await fs.readFile(this.inputFile, 'utf-8')
      const parsed = JSON.parse(data)

      // Handle Chrome's root object structure or standard array
      if (parsed.roots) {
        this.bookmarks = [
          parsed.roots.bookmark_bar,
          parsed.roots.other,
          parsed.roots.synced,
        ].filter(Boolean)
      } else {
        this.bookmarks = Array.isArray(parsed) ? parsed : [parsed]
      }

      this.totalItems = this.countBookmarks(this.bookmarks)
      console.log(`  ${colors.green}✅ Loaded ${this.totalItems} items${colors.reset}`)
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.showMissingFileHelp()
        process.exit(1)
      } else {
        console.error(`${colors.red}❌ Error loading original JSON:${colors.reset}`, error.message)
        throw error
      }
    }
  }

  /**
   * Check if workspace is empty and prompt user if not
   */
  async checkWorkspaceEmpty() {
    try {
      const files = await fs.readdir(this.workspaceDir)
      if (files.length > 0) {
        if (!process.stdout.isTTY) {
          console.log(
            `${colors.yellow}⚠️  Workspace not empty, proceeding (non-interactive mode)${colors.reset}`
          )
          return
        }

        const rl = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout,
        })

        const answer = await new Promise((resolve) => {
          rl.question(
            `\n${colors.yellow}⚠️  The workspace directory is not empty.${colors.reset}\nRunning setup might overwrite your changes. Continue? (y/N) `,
            resolve
          )
        })

        rl.close()

        if (!answer.match(/^y(es)?$/i)) {
          console.log(`\n${colors.blue}Setup cancelled.${colors.reset}`)
          process.exit(0)
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      // If directory doesn't exist, that's fine, we'll create it later
    }
  }

  /**
   * Show helpful instructions when input file is missing
   */
  showMissingFileHelp() {
    console.log(`
${colors.yellow}⚠️  MISSING INPUT FILE${colors.reset}
${colors.dim}The file ${colors.white}${this.inputFile}${colors.dim} was not found.${colors.reset}

${colors.bright}How to get your bookmarks file:${colors.reset}
Chrome's export feature creates an HTML file, but this tool needs the raw JSON.
Please copy the ${colors.green}Bookmarks${colors.reset} file from your Chrome profile:

${colors.cyan}Windows:${colors.reset} %LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Bookmarks
${colors.cyan}macOS:${colors.reset}   ~/Library/Application Support/Google/Chrome/Default/Bookmarks
${colors.cyan}Linux:${colors.reset}   ~/.config/google-chrome/Default/Bookmarks

1. Create a folder named ${colors.blue}input${colors.reset} in this project
2. Copy the file above to: ${colors.blue}input/Bookmarks.json${colors.reset}

${colors.dim}Then run this script again.${colors.reset}
`)
  }

  /**
   * Sanitize filename/foldername to be safe for filesystem while preserving emojis and spaces
   */
  sanitizeName(name) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) return 'Untitled'

    let sanitized = name
      .replace(INVALID_CHARS, '-') // Replace invalid chars including / and \
      .replace(CONTROL_CHARS, '') // Remove control chars
      .trim() // Trim whitespace

    // Prevent directory traversal and reserved names
    if (sanitized === '.' || sanitized === '..') return 'Untitled'

    // Remove leading/trailing dots to prevent issues
    sanitized = sanitized.replace(/^\.+|\.+$/g, '')

    if (sanitized.length === 0) return 'Untitled'

    return sanitized
  }

  /**
   * Draw a progress bar
   */
  drawProgressBar(current, total) {
    if (!process.stdout.isTTY) return

    const width = 30
    // Ensure ratio is between 0 and 1 to prevent crashes
    const ratio = Math.min(1, Math.max(0, current / total)) || 0
    const percent = Math.round(ratio * 100)

    // Throttle updates to ~50ms to improve performance
    // Always draw if 0% or 100%
    const now = Date.now()
    if (now - this.lastDraw < 50 && percent !== 100 && current !== 0) return
    this.lastDraw = now

    const filled = Math.round(width * ratio)
    const empty = width - filled

    // Using ANSI block characters for a smooth bar
    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    const color = percent === 100 ? colors.green : colors.cyan

    process.stdout.write(
      `\r  ${color}[${bar}]${colors.reset} ${percent}% | ${current}/${total} items`
    )
  }

  /**
   * Create filesystem structure
   */
  async createFilesystemStructure() {
    console.log(`\n${colors.cyan}📁 Creating filesystem structure...${colors.reset}`)

    // Create workspace directory
    await fs.mkdir(this.workspaceDir, { recursive: true })

    let processedItems = 0

    // Recreate the original structure from JSON
    const createStructure = async (items, parentPath = '') => {
      // Use Promise.all to process items concurrently
      await Promise.all(
        items.map(async (item) => {
          const rawTitle = item.title || item.name || 'Untitled'
          const title = this.sanitizeName(rawTitle)

          if (item.children) {
            // It's a folder
            // Clear current line to remove bookmark progress
            if (process.stdout.isTTY) {
              process.stdout.write('\r\x1b[K')
            }

            const folderPath = path.join(this.workspaceDir, parentPath, title)
            await limit(() => fs.mkdir(folderPath, { recursive: true }))

            processedItems++
            if (process.stdout.isTTY) {
              console.log(
                `  ${colors.blue}📁 Created folder:${colors.reset} ${parentPath}/${title}`
              )
            } else {
              // For logs, simple output
              console.log(`📁 Created folder: ${parentPath}/${title}`)
            }

            // Process children
            await createStructure(item.children, path.join(parentPath, title))
          } else if (item.url) {
            // It's a bookmark
            // Validate URL
            if (!this.isValidUrl(item.url)) {
              // Skip invalid URLs or maybe log them?
              // For now, we skip to prevent creating bad files.
              processedItems++
              this.drawProgressBar(processedItems, this.totalItems)
              return
            }

            const fileName = title + '.url'
            const filePath = path.join(this.workspaceDir, parentPath, fileName)

            const urlContent = `[InternetShortcut]
URL=${item.url}
IDList=
HotKey=0
IconFile=
IconIndex=0`

            await limit(() => fs.writeFile(filePath, urlContent))

            processedItems++

            // Show progress bar
            this.drawProgressBar(processedItems, this.totalItems)
          }
        })
      )
    }

    await createStructure(this.bookmarks)
    process.stdout.write('\n') // Final newline
  }

  /**
   * Count bookmarks recursively
   */
  countBookmarks(items) {
    let count = 0
    for (const item of items) {
      count++
      if (item.children) {
        count += this.countBookmarks(item.children)
      }
    }
    return count
  }

  /**
   * Main setup workflow
   */
  async setup() {
    try {
      console.log(`${colors.bright}🚀 Chrome Bookmark Setup${colors.reset}`)
      console.log(colors.dim + '='.repeat(50) + colors.reset)

      // Load original JSON
      await this.loadOriginalJSON()

      // Check for existing workspace
      await this.checkWorkspaceEmpty()

      // Create filesystem structure
      await this.createFilesystemStructure()

      console.log(`\n${colors.green}✅ Setup complete!${colors.reset}`)
      console.log(
        `\n${colors.blue}📁 Manual organization workspace:${colors.reset} ${this.workspaceDir}`
      )
      console.log(`\n${colors.bright}📋 Next steps:${colors.reset}`)
      console.log('  1. Open the workspace folder in your file explorer')
      console.log('  2. Create new folders and move .url files as needed')
      console.log(`  3. Run: ${colors.cyan}node 02finish.js${colors.reset}`)
      console.log(`\n${colors.yellow}💡 Tips:${colors.reset}`)
      console.log('  - Create folders by right-clicking in file explorer')
      console.log('  - Move .url files by dragging them to new folders')
      console.log("  - Delete empty folders you don't need")
    } catch (error) {
      console.error(`\n${colors.red}❌ Setup failed:${colors.reset}`, error.message)
      process.exit(1)
    }
  }
}

// Run the setup
const setup = new BookmarkSetup()
setup.setup()
