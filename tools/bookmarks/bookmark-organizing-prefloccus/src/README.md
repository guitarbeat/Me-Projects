# Bookmark Processing Toolkit

A comprehensive toolkit for extracting, organizing, and converting bookmarks between different formats. This toolkit provides a complete workflow for managing large bookmark collections with proper folder hierarchy preservation.

## 🔄 Process Overview

The toolkit follows a 3-step process, with each script numbered to show the workflow:

```
1️⃣ Extract    →    2️⃣ Convert    →    3️⃣ Verify
HTML → JSON    →    JSON → HTML    →    Compare URLs
```

## 📁 Files Structure

### Core Scripts (Numbered by Process Order)

- **`1_bookmark_extractor.py`** - Extract bookmarks from HTML to JSON
- **`2_json_to_html_converter.py`** - Convert organized JSON back to HTML  
- **`3_url_comparison.py`** - Compare original vs organized URLs

### Supporting Files

- **`README.md`** - This documentation file

## 🚀 Quick Start

### Step 1: Extract Bookmarks from HTML
```bash
python 1_bookmark_extractor.py bookmarks.html --output extracted_bookmarks.json
```

**What it does:**
- Parses HTML bookmark files (exported from Chrome, Firefox, etc.)
- Extracts bookmark metadata (title, URL, folder path, dates, icons)
- Outputs structured JSON with full folder hierarchy
- Provides filtering options for specific folders

**Key Features:**
- ✅ Accurate folder hierarchy parsing
- ✅ Metadata preservation (dates, icons)
- ✅ Folder filtering capabilities
- ✅ Multiple output formats (JSON, CSV)
- ✅ Comprehensive error handling

### Step 2: Convert JSON to HTML
```bash
python 2_json_to_html_converter.py
```

**What it does:**
- Reads organized JSON bookmark files
- Converts back to Chrome-compatible HTML format
- Preserves folder structure and metadata
- Creates importable bookmark files

**Key Features:**
- ✅ Chrome-compatible HTML generation
- ✅ Folder hierarchy preservation
- ✅ Metadata retention
- ✅ Proper HTML escaping

### Step 3: Verify URL Integrity
```bash
python 3_url_comparison.py
```

**What it does:**
- Compares original vs organized bookmark files
- Identifies removed, added, or moved URLs
- Generates detailed comparison reports
- Ensures data integrity throughout the process

**Key Features:**
- ✅ URL preservation verification
- ✅ Folder change tracking
- ✅ Detailed JSON reports
- ✅ Summary statistics

## 📊 Example Workflow

### Complete Bookmark Organization Process

1. **Extract from Browser Export**
   ```bash
   # Extract all bookmarks
   python 1_bookmark_extractor.py bookmarks.html
   
   # Or extract specific folders
   python 1_bookmark_extractor.py bookmarks.html --folder "Work" --folder "Personal"
   ```

2. **Organize Your Data**
   - Manually organize the JSON file or use additional tools
   - Remove unwanted bookmarks
   - Reorganize folder structures

3. **Convert Back to HTML**
   ```bash
   python 2_json_to_html_converter.py
   ```

4. **Verify Integrity**
   ```bash
   python 3_url_comparison.py
   ```

5. **Import to Browser**
   - Open Chrome → `chrome://bookmarks/`
   - Import the generated HTML file

## 🔧 Advanced Usage

### 1_bookmark_extractor.py Options

```bash
# List all folders in bookmark file
python 1_bookmark_extractor.py bookmarks.html --list-folders

# Extract with debugging
python 1_bookmark_extractor.py bookmarks.html --debug

# Export to CSV format
python 1_bookmark_extractor.py bookmarks.html --format csv

# Filter by multiple folders
python 1_bookmark_extractor.py bookmarks.html --folder "Work" --folder "Personal" --folder "Projects"

# Case-sensitive folder matching
python 1_bookmark_extractor.py bookmarks.html --folder "work" --case-sensitive
```

### 2_json_to_html_converter.py Configuration

The converter automatically:
- Reads from `outputs/organized_pile_of_clothes.json`
- Outputs to `outputs/organized_bookmarks.html`
- Preserves all folder hierarchies and metadata

### 3_url_comparison.py Output

Generates detailed reports showing:
- Total URL counts (original vs organized)
- Removed URLs with original folder locations
- Added URLs with new folder locations
- Folder path changes for existing URLs

## 📈 Statistics & Reporting

Each script provides comprehensive statistics:

- **Extraction Stats**: Total bookmarks, folders found, parsing errors
- **Conversion Stats**: Bookmarks converted, folders created
- **Comparison Stats**: URLs preserved, removed, added, moved

## 🛠️ Technical Details

### Supported Formats

**Input Formats:**
- HTML (Netscape bookmark format)
- JSON (structured bookmark data)

**Output Formats:**
- JSON (structured with metadata)
- CSV (tabular format)
- HTML (Chrome-compatible)

### Folder Hierarchy Handling

The toolkit uses a sophisticated folder path system:
- Paths use `>` separators (e.g., "Work > Projects > Current")
- Supports unlimited nesting depth
- Preserves folder metadata (creation dates, attributes)
- Handles special characters and Unicode

### Error Handling

Robust error handling includes:
- File validation and existence checks
- HTML parsing error recovery
- JSON format validation
- Unicode and encoding support
- Graceful degradation for corrupted data

## 🧪 Testing

Run the built-in test suite:
```bash
python 1_bookmark_extractor.py --test
```

This validates:
- Deep nested folder parsing
- Sibling folder handling
- Folder filtering functionality
- Edge case scenarios

## 📋 Requirements

- Python 3.6+
- Standard library only (no external dependencies)
- Works on Windows, macOS, and Linux

## 🎯 Use Cases

### Perfect for:
- **Large bookmark collections** (hundreds to thousands of bookmarks)
- **Cross-browser migrations** (Chrome, Firefox, Safari, Edge)
- **Bookmark organization projects** (cleaning up messy bookmark bars)
- **Backup and archival** (structured JSON format)
- **Data analysis** (CSV export for spreadsheet analysis)
- **Selective imports** (folder-based filtering)

### Example Scenarios:
- Migrating work bookmarks to a new computer
- Organizing personal bookmarks by topic
- Creating backup copies of important bookmark collections
- Sharing curated bookmark collections with others
- Analyzing bookmark usage patterns

## 🔍 Troubleshooting

### Common Issues:

**"No bookmarks found"**
- Check HTML file format (should be Netscape bookmark format)
- Verify file encoding (UTF-8 recommended)
- Try with `--debug` flag for detailed parsing info

**"Folder not found"**
- Use `--list-folders` to see available folder names
- Check folder name spelling and case sensitivity
- Use partial folder names (e.g., "Work" instead of "Bookmarks Bar > Work")

**"Import failed in Chrome"**
- Verify HTML file structure with a text editor
- Check for special characters in bookmark titles/URLs
- Try importing a smaller subset first

## 📄 License

This toolkit is provided as-is for bookmark management purposes. Feel free to modify and distribute according to your needs.

---

*Last updated: January 2025* 