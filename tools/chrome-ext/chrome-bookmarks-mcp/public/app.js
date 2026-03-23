document.addEventListener('DOMContentLoaded', () => {
  const fileTree = document.getElementById('file-tree')
  const refreshBtn = document.getElementById('refresh-btn')
  const generateBtn = document.getElementById('generate-btn')
  const createFolderBtn = document.getElementById('create-folder-btn')
  const statusMessage = document.getElementById('status-message')

  let currentFocus = null
  let treeData = []

  // Helper to announce status for screen readers
  function announce(message, type = 'polite') {
    statusMessage.textContent = message
    statusMessage.setAttribute('aria-live', type)
    setTimeout(() => {
      statusMessage.textContent = ''
    }, 3000)
  }

  // Fetch structure
  async function loadStructure() {
    try {
      fileTree.innerHTML = '<div class="loading">Loading...</div>'
      const response = await fetch('/api/structure')
      if (!response.ok) throw new Error('Failed to load structure')
      treeData = await response.json()
      renderTree(treeData, fileTree)
      announce('Workspace loaded successfully.')
    } catch (error) {
      fileTree.innerHTML = `<div class="error">Error: ${error.message}</div>`
      announce('Error loading workspace.', 'assertive')
    }
  }

  // Render tree
  function renderTree(items, container, level = 1) {
    if (level === 1) container.innerHTML = ''

    const ul = document.createElement('ul')
    ul.setAttribute('role', level === 1 ? 'tree' : 'group')
    if (level === 1) ul.id = 'tree-root'

    items.forEach((item, index) => {
      const li = document.createElement('li')
      li.setAttribute('role', 'treeitem')
      li.setAttribute('aria-level', level)
      li.setAttribute('aria-setsize', items.length)
      li.setAttribute('aria-posinset', index + 1)
      li.setAttribute('tabindex', '-1')
      if (level === 1 && index === 0) li.setAttribute('tabindex', '0')

      li.dataset.path = item.path
      li.dataset.type = item.type
      li.dataset.name = item.name
      li.classList.add('tree-item')

      const content = document.createElement('div')
      content.classList.add('tree-content')
      content.style.display = 'flex'
      content.style.alignItems = 'center'

      const icon = document.createElement('span')
      icon.classList.add(item.type === 'folder' ? 'folder-icon' : 'file-icon')
      icon.textContent = item.type === 'folder' ? '📁' : '📄'
      icon.setAttribute('aria-hidden', 'true')
      icon.style.marginRight = '8px'

      const label = document.createElement('span')
      label.textContent = item.name

      content.appendChild(icon)
      content.appendChild(label)
      li.appendChild(content)

      if (item.type === 'folder') {
        li.setAttribute('aria-expanded', 'false')
        const childrenContainer = document.createElement('div')
        childrenContainer.style.display = 'none'
        childrenContainer.classList.add('tree-children')

        if (item.children && item.children.length > 0) {
          renderTree(item.children, childrenContainer, level + 1)
        }
        li.appendChild(childrenContainer)
      }

      // Click handler
      li.addEventListener('click', (e) => {
        e.stopPropagation()
        focusItem(li)
        if (item.type === 'folder') {
          toggleFolder(li)
        }
      })

      // Keydown handler (Enter to toggle)
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          if (item.type === 'folder') {
            toggleFolder(li)
          }
        }
      })

      ul.appendChild(li)
    })

    container.appendChild(ul)

    if (level === 1) {
      // Setup global tree navigation on the root UL
      ul.addEventListener('keydown', handleTreeKeydown)
    }
  }

  function toggleFolder(li) {
    const isExpanded = li.getAttribute('aria-expanded') === 'true'
    li.setAttribute('aria-expanded', !isExpanded)
    const children = li.querySelector('.tree-children')
    if (children) {
      children.style.display = !isExpanded ? 'block' : 'none'
    }
  }

  function focusItem(li) {
    if (currentFocus) {
      currentFocus.setAttribute('tabindex', '-1')
      currentFocus.classList.remove('focused')
    }
    currentFocus = li
    li.setAttribute('tabindex', '0')
    li.focus()
    li.classList.add('focused')
  }

  function handleTreeKeydown(e) {
    if (!currentFocus) return

    // Ensure we are operating on tree items
    if (!currentFocus.closest('[role="treeitem"]')) return

    let nextItem = null

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const expanded = currentFocus.getAttribute('aria-expanded') === 'true'
      const children = currentFocus.querySelector('.tree-children > ul > li') // First child

      if (expanded && children) {
        nextItem = children
      } else {
        nextItem = getNextVisualSibling(currentFocus)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevSibling = currentFocus.previousElementSibling
      if (prevSibling) {
        nextItem = getLastVisibleDescendant(prevSibling)
      } else {
        const parentGroup = currentFocus.parentElement // ul
        if (parentGroup && parentGroup.getAttribute('role') !== 'tree') {
          // Go up to parent folder li
          // parentGroup is ul. tree-children is parent of ul. li is parent of tree-children.
          nextItem = parentGroup.parentElement.parentElement
        }
      }
    } else if (e.key === 'ArrowRight') {
      if (currentFocus.dataset.type === 'folder') {
        e.preventDefault()
        if (currentFocus.getAttribute('aria-expanded') === 'false') {
          toggleFolder(currentFocus)
        } else {
          const firstChild = currentFocus.querySelector('.tree-children > ul > li')
          if (firstChild) {
            nextItem = firstChild
            focusItem(nextItem)
          }
        }
      }
    } else if (e.key === 'ArrowLeft') {
      if (
        currentFocus.dataset.type === 'folder' &&
        currentFocus.getAttribute('aria-expanded') === 'true'
      ) {
        e.preventDefault()
        toggleFolder(currentFocus)
      } else {
        e.preventDefault()
        // Go to parent
        const parentGroup = currentFocus.parentElement
        if (parentGroup && parentGroup.getAttribute('role') !== 'tree') {
          nextItem = parentGroup.parentElement.parentElement
          focusItem(nextItem)
        }
      }
    }

    if (nextItem) {
      focusItem(nextItem)
    }
  }

  function getNextVisualSibling(node) {
    if (node.nextElementSibling) return node.nextElementSibling

    // Go up to parent and find its next sibling
    const parentGroup = node.parentElement // ul
    if (parentGroup && parentGroup.getAttribute('role') !== 'tree') {
      const parentLi = parentGroup.parentElement.parentElement
      return getNextVisualSibling(parentLi)
    }
    return null
  }

  function getLastVisibleDescendant(node) {
    if (node.dataset.type === 'folder' && node.getAttribute('aria-expanded') === 'true') {
      const childrenContainer = node.querySelector('.tree-children')
      if (childrenContainer && childrenContainer.style.display !== 'none') {
        const ul = childrenContainer.querySelector('ul')
        if (ul && ul.lastElementChild) {
          return getLastVisibleDescendant(ul.lastElementChild)
        }
      }
    }
    return node
  }

  // Actions
  refreshBtn.addEventListener('click', loadStructure)

  generateBtn.addEventListener('click', async () => {
    if (!confirm('Generate output JSON from current workspace?')) return
    try {
      announce('Generating...', 'assertive')
      const res = await fetch('/api/generate', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        announce('Generation complete! Check output folder.')
      } else {
        announce('Generation failed: ' + data.error, 'assertive')
      }
    } catch (e) {
      announce('Network error', 'assertive')
    }
  })

  createFolderBtn.addEventListener('click', async () => {
    const name = prompt('Enter folder name:')
    if (name) {
      let parentPath = ''
      if (currentFocus && currentFocus.dataset.type === 'folder') {
        parentPath = currentFocus.dataset.path
      } else if (currentFocus && currentFocus.dataset.type === 'file') {
        // Create in parent folder
        // path is relative, e.g. "Folder/File.url"
        // dirname
        const pathParts = currentFocus.dataset.path.split('/')
        pathParts.pop()
        parentPath = pathParts.join('/')
      }

      // Normalize path (remove leading/trailing slashes if any)
      // My server uses path.join(WORKSPACE, folderPath)

      const fullPath = parentPath ? parentPath + '/' + name : name

      try {
        const res = await fetch('/api/mkdir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: fullPath }),
        })
        if (res.ok) {
          loadStructure()
          announce(`Created folder ${name}`)
        }
      } catch (e) {
        announce('Error creating folder', 'assertive')
      }
    }
  })

  // Initial load
  loadStructure()
})
