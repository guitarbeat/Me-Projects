const http = require('http')
const fs = require('fs').promises
const path = require('path')
const { exec } = require('child_process')

const PORT = 3000
const WORKSPACE_DIR = path.join(__dirname, 'workspace')
const PUBLIC_DIR = path.join(__dirname, 'public')

const server = http.createServer(async (req, res) => {
  // Enable CORS for testing
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)

  try {
    if (req.method === 'GET') {
      if (url.pathname === '/') {
        await serveFile(res, path.join(PUBLIC_DIR, 'index.html'), 'text/html')
      } else if (url.pathname === '/style.css') {
        await serveFile(res, path.join(PUBLIC_DIR, 'style.css'), 'text/css')
      } else if (url.pathname === '/app.js') {
        await serveFile(res, path.join(PUBLIC_DIR, 'app.js'), 'application/javascript')
      } else if (url.pathname === '/api/structure') {
        const structure = await getDirectoryStructure(WORKSPACE_DIR)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(structure))
      } else {
        res.writeHead(404)
        res.end('Not Found')
      }
    } else if (req.method === 'POST') {
      const body = await parseBody(req)

      if (url.pathname === '/api/move') {
        const { source, destination } = body
        const sourcePath = path.join(WORKSPACE_DIR, source)
        const destPath = path.join(WORKSPACE_DIR, destination)
        await fs.rename(sourcePath, destPath)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true }))
      } else if (url.pathname === '/api/mkdir') {
        const { path: folderPath } = body
        const fullPath = path.join(WORKSPACE_DIR, folderPath)
        await fs.mkdir(fullPath, { recursive: true })
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true }))
      } else if (url.pathname === '/api/rename') {
        const { oldPath, newPath } = body
        const sourcePath = path.join(WORKSPACE_DIR, oldPath)
        const destPath = path.join(WORKSPACE_DIR, newPath)
        await fs.rename(sourcePath, destPath)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true }))
      } else if (url.pathname === '/api/delete') {
        const { path: itemPath } = body
        const fullPath = path.join(WORKSPACE_DIR, itemPath)
        const stats = await fs.stat(fullPath)
        if (stats.isDirectory()) {
          await fs.rmdir(fullPath) // Only deletes empty directories
        } else {
          await fs.unlink(fullPath)
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true }))
      } else if (url.pathname === '/api/generate') {
        exec('node 02finish.js', { cwd: __dirname }, (error, stdout, stderr) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: error.message, stderr }))
            return
          }
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true, stdout }))
        })
      } else {
        res.writeHead(404)
        res.end('Not Found')
      }
    } else {
      res.writeHead(405)
      res.end('Method Not Allowed')
    }
  } catch (error) {
    console.error(error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: error.message }))
  }
})

async function serveFile(res, filePath, contentType) {
  try {
    const data = await fs.readFile(filePath)
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404)
      res.end('File Not Found')
    } else {
      throw error
    }
  }
}

async function getDirectoryStructure(dirPath) {
  const items = await fs.readdir(dirPath, { withFileTypes: true })
  // Sort directories first, then files
  items.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })

  const structure = await Promise.all(
    items.map(async (item) => {
      const relativePath = path.relative(WORKSPACE_DIR, path.join(dirPath, item.name))
      if (item.isDirectory()) {
        return {
          name: item.name,
          type: 'folder',
          path: relativePath,
          children: await getDirectoryStructure(path.join(dirPath, item.name)),
        }
      } else if (item.name.endsWith('.url')) {
        // Read URL content to get the actual URL for display if needed
        // For now, just return name
        return {
          name: item.name,
          type: 'file',
          path: relativePath,
        }
      }
      return null
    })
  )
  return structure.filter((item) => item !== null)
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        if (!body) {
          resolve({})
        } else {
          resolve(JSON.parse(body))
        }
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`)
  console.log('Press Ctrl+C to stop')
})
