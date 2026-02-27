# Chrome Bookmark Organizer

[![CI](https://github.com/username/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/username/repo/actions/workflows/ci.yml)
[![Code Style: Airbnb](https://img.shields.io/badge/code%20style-airbnb-brightgreen.svg)](https://github.com/airbnb/javascript)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A comprehensive system for transforming disorganized Chrome bookmarks into a clean, consolidated structure using filesystem-based organization.

## 🎯 **Project Overview**

This project provides a flexible framework for organizing Chrome bookmarks by creating a filesystem-based structure that can be easily managed and then converted back to Chrome's JSON format for import.

## 📁 **Project Structure**

```
chrome-bookmarks-mcp/
├── input/                    # Input directory
│   └── Bookmarks.json        # Original Chrome bookmarks (export from Chrome)
├── output/                   # Output directory
│   └── Bookmarks-improved.json  # Optimized bookmarks (import to Chrome)
├── workspace/                # Filesystem-based organization
│   ├── 🎓 Knowledge Hub/     # Academic & research content
│   ├── 🎧 AudioHub/          # Music & audio tools
│   ├── 🎨 Creative Hub/      # Design & creative tools
│   ├── 🏢 Work Hub/          # Professional resources
│   └── 🤖 AI & ML Experiments/ # AI tools & experiments
├── 01setup.js               # Step 1: Create filesystem structure
├── 02finish.js              # Step 2: Generate optimized JSON
├── server.js                # Web Interface Server
├── public/                  # Web Interface Assets
└── README.md                # This file
```

## 🚀 **How to Use**

### **Step 1: Export Bookmarks**

1. Export your bookmarks from Chrome as JSON
2. Save the file as `input/Bookmarks.json`

### **Step 2: Create Structure**

```bash
node 01setup.js
```

This creates the filesystem-based organization in the `workspace/` directory.

### **Step 3: Organize Content**

#### **Option A: Web Interface (Recommended)**

Start the accessible web interface to manage your bookmarks with ease:

```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Accessible Design**: Fully supports keyboard navigation and screen readers.
- **Easy Management**: Create folders, move items, and rename directly in the browser.
- **Instant Updates**: Changes are immediately reflected in the filesystem.

#### **Option B: Manual Organization**

- Navigate to the `workspace/` directory
- Organize your bookmarks by moving `.url` files into appropriate folders
- Create subfolders as needed for better organization
- Use emojis and descriptive names for easy navigation

### **Step 4: Generate Optimized JSON**

If you used the Web Interface, click the **"Generate Output"** button.

If you organized manually:

```bash
node 02finish.js
```

This converts your organized filesystem structure back into Chrome's JSON format.

### **Step 5: Import to Chrome**

1. Open Chrome and go to Bookmarks Manager
2. Import the generated `output/Bookmarks-improved.json` file
3. Your organized bookmarks are now ready to use!

## 🏗️ **Current Organization Structure**

The workspace currently contains 5 main thematic hubs:

- **🎓 Knowledge Hub**: Academic content, research tools, tutorials, and scholarly resources
- **🎧 AudioHub**: Music education, AI music tools, and audio production resources
- **🎨 Creative Hub**: UI design, games, creative tools, and visual resources
- **🏢 Work Hub**: Professional portals, banking, career, and legal resources
- **🤖 AI & ML Experiments**: Various AI tools, GPT variants, and ML playgrounds

## ✨ **Features**

- **Filesystem-based organization**: Easy to manage with any file explorer
- **Flexible structure**: Adapt the organization to your specific needs
- **Emoji support**: Visual organization with emojis for quick identification
- **Hierarchical organization**: Support for multiple levels of subcategorization
- **Chrome compatibility**: Seamless import/export with Chrome's bookmark system

## 🔧 **Customization**

You can easily customize the organization by:

- Modifying the folder structure in `workspace/`
- Adding or removing main categories
- Creating subcategories that match your workflow
- Using consistent naming conventions and emojis

## 💻 **Development**

This project uses standard coding practices.

### Linting & Formatting

We use **ESLint** (Airbnb config) and **Prettier**.

```bash
# Install dependencies
npm install

# Run Lint
npm run lint

# Check Format
npm run check-format

# Fix Format
npm run format
```

## 📝 **Notes**

- All bookmark files are stored as `.url` files for easy management
- The system preserves all bookmark metadata during conversion
- You can reorganize as many times as needed before final import
