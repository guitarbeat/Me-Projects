#!/bin/bash

# Chrome Bookmark Helper - Simple manual organization assistant
# Provides helpful tools for manual bookmark organization without doing the work for you

set -e

# * Configuration
WORKSPACE_DIR="./workspace"
LOG_FILE="./bookmark-helper.log"

# * Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# * Logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo -e "$1"
}

# * Show workspace overview
show_overview() {
    log "${BLUE}📊 Workspace Overview${NC}"
    echo "====================="
    
    if [ ! -d "$WORKSPACE_DIR" ]; then
        log "${RED}❌ Workspace not found. Run 01setup.js first.${NC}"
        return 1
    fi
    
    local total_files=$(find "$WORKSPACE_DIR" -name "*.url" | wc -l)
    local total_dirs=$(find "$WORKSPACE_DIR" -type d | wc -l)
    
    echo "Total bookmarks: $total_files"
    echo "Total directories: $total_dirs"
    echo ""
    
    # Show main categories
    echo "Main Categories:"
    for category in "$WORKSPACE_DIR"/*; do
        if [ -d "$category" ]; then
            category_name=$(basename "$category")
            file_count=$(find "$category" -name "*.url" | wc -l)
            echo -e "${CYAN}📁 $category_name${NC}: $file_count bookmarks"
        fi
    done
    
    # Show unorganized files
    local unorganized=$(find "$WORKSPACE_DIR" -maxdepth 1 -name "*.url" | wc -l)
    if [ $unorganized -gt 0 ]; then
        echo -e "\n${YELLOW}⚠️  Unorganized files: $unorganized${NC}"
    fi
    
    echo ""
}

# * Find unorganized files
find_unorganized() {
    log "${YELLOW}🔍 Unorganized Files${NC}"
    echo "==================="
    
    local unorganized_files=()
    while IFS= read -r -d '' file; do
        unorganized_files+=("$file")
    done < <(find "$WORKSPACE_DIR" -maxdepth 1 -name "*.url" -print0)
    
    if [ ${#unorganized_files[@]} -eq 0 ]; then
        log "${GREEN}✅ All files are organized!${NC}"
        return 0
    fi
    
    log "${YELLOW}Found ${#unorganized_files[@]} unorganized files:${NC}"
    for i in "${!unorganized_files[@]}"; do
        filename=$(basename "${unorganized_files[$i]}")
        echo -e "${CYAN}$((i+1)).${NC} $filename"
    done
    
    return ${#unorganized_files[@]}
}

# * Preview file contents
preview_files() {
    log "${BLUE}📖 File Preview${NC}"
    echo "=============="
    
    local unorganized_files=()
    while IFS= read -r -d '' file; do
        unorganized_files+=("$file")
    done < <(find "$WORKSPACE_DIR" -maxdepth 1 -name "*.url" -print0)
    
    if [ ${#unorganized_files[@]} -eq 0 ]; then
        log "${GREEN}✅ No unorganized files to preview${NC}"
        return 0
    fi
    
    for i in "${!unorganized_files[@]}"; do
        filename=$(basename "${unorganized_files[$i]}")
        echo -e "${CYAN}$((i+1)).${NC} $filename"
        
        # Extract URL from .url file
        url=$(grep "^URL=" "${unorganized_files[$i]}" | cut -d'=' -f2-)
        if [ -n "$url" ]; then
            echo "   🔗 $url"
        fi
        echo ""
    done
}

# * Suggest categories based on URL patterns
suggest_categories() {
    log "${BLUE}💡 Category Suggestions${NC}"
    echo "======================"
    
    local unorganized_files=()
    while IFS= read -r -d '' file; do
        unorganized_files+=("$file")
    done < <(find "$WORKSPACE_DIR" -maxdepth 1 -name "*.url" -print0)
    
    if [ ${#unorganized_files[@]} -eq 0 ]; then
        log "${GREEN}✅ No unorganized files to suggest categories for${NC}"
        return 0
    fi
    
    # URL pattern suggestions
    declare -A suggestions=(
        ["github.com"]="Development Tools"
        ["stackoverflow.com"]="Development Tools"
        ["youtube.com"]="Tutorials/Videos"
        ["coursera.org"]="Courses/Learning"
        ["udemy.com"]="Courses/Learning"
        ["medium.com"]="Articles/Blogs"
        ["arxiv.org"]="Research/Papers"
        ["scholar.google.com"]="Research/Papers"
        ["nature.com"]="Research/Papers"
        ["kaggle.com"]="Data Science"
        ["openai.com"]="AI Tools"
        ["chatgpt.com"]="AI Tools"
        ["claude.ai"]="AI Tools"
        ["perplexity.ai"]="AI Tools"
        ["bank"]="Banking/Finance"
        ["investment"]="Investments"
        ["legal"]="Legal"
        ["career"]="Career"
        ["music"]="Music"
        ["design"]="Design"
        ["game"]="Games"
        ["art"]="Art/Design"
    )
    
    echo "Based on URL patterns, here are suggestions:"
    echo ""
    
    for file in "${unorganized_files[@]}"; do
        filename=$(basename "$file")
        url=$(grep "^URL=" "$file" | cut -d'=' -f2-)
        
        if [ -n "$url" ]; then
            echo -e "${CYAN}$filename${NC}"
            echo "   🔗 $url"
            
            local suggested=false
            for pattern in "${!suggestions[@]}"; do
                if [[ "$url" == *"$pattern"* ]]; then
                    echo -e "   💡 Suggested category: ${YELLOW}${suggestions[$pattern]}${NC}"
                    suggested=true
                    break
                fi
            done
            
            if [ "$suggested" = false ]; then
                echo -e "   💡 ${YELLOW}No automatic suggestion - categorize manually${NC}"
            fi
            echo ""
        fi
    done
}

# * Count files by category
count_by_category() {
    log "${BLUE}📊 File Counts by Category${NC}"
    echo "==========================="
    
    for category in "$WORKSPACE_DIR"/*; do
        if [ -d "$category" ]; then
            category_name=$(basename "$category")
            file_count=$(find "$category" -name "*.url" | wc -l)
            
            if [ $file_count -gt 0 ]; then
                echo -e "${CYAN}📁 $category_name${NC}: $file_count bookmarks"
                
                # Show subcategories
                for subcategory in "$category"/*; do
                    if [ -d "$subcategory" ]; then
                        subcategory_name=$(basename "$subcategory")
                        sub_file_count=$(find "$subcategory" -name "*.url" | wc -l)
                        if [ $sub_file_count -gt 0 ]; then
                            echo -e "  └─ ${YELLOW}$subcategory_name${NC}: $sub_file_count bookmarks"
                        fi
                    fi
                done
                echo ""
            fi
        fi
    done
}

# * Find empty directories
find_empty_dirs() {
    log "${YELLOW}📁 Empty Directories${NC}"
    echo "==================="
    
    local empty_dirs=()
    while IFS= read -r -d '' dir; do
        if [ -d "$dir" ] && [ -z "$(find "$dir" -type f -name "*.url" | head -1)" ]; then
            empty_dirs+=("$dir")
        fi
    done < <(find "$WORKSPACE_DIR" -type d -print0)
    
    if [ ${#empty_dirs[@]} -eq 0 ]; then
        log "${GREEN}✅ No empty directories found${NC}"
        return 0
    fi
    
    log "${YELLOW}Found ${#empty_dirs[@]} empty directories:${NC}"
    for dir in "${empty_dirs[@]}"; do
        echo -e "${CYAN}📁${NC} $(basename "$dir")"
    done
    
    echo ""
    echo "You can manually delete these if they're not needed:"
    for dir in "${empty_dirs[@]}"; do
        echo "rmdir \"$dir\""
    done
}

# * Validate .url files
validate_files() {
    log "${BLUE}🔍 Validating .url Files${NC}"
    echo "========================"
    
    local valid=0
    local invalid=0
    
    find "$WORKSPACE_DIR" -name "*.url" | while read -r file; do
        if grep -q "^URL=" "$file"; then
            ((valid++))
        else
            log "${RED}❌ Invalid .url file: $file${NC}"
            ((invalid++))
        fi
    done
    
    log "${GREEN}✅ Valid files: $valid${NC}"
    if [ $invalid -gt 0 ]; then
        log "${RED}❌ Invalid files: $invalid${NC}"
    fi
}

# * Generate simple report
generate_report() {
    log "${BLUE}📊 Simple Report${NC}"
    echo "==============="
    
    local report_file="bookmark_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Chrome Bookmark Organization Report"
        echo "Generated: $(date)"
        echo "=================================="
        echo ""
        
        local total_files=$(find "$WORKSPACE_DIR" -name "*.url" | wc -l)
        local total_dirs=$(find "$WORKSPACE_DIR" -type d | wc -l)
        local unorganized=$(find "$WORKSPACE_DIR" -maxdepth 1 -name "*.url" | wc -l)
        
        echo "Summary:"
        echo "--------"
        echo "Total bookmarks: $total_files"
        echo "Total directories: $total_dirs"
        echo "Unorganized files: $unorganized"
        echo "Organization rate: $(( (total_files - unorganized) * 100 / total_files ))%"
        echo ""
        
        echo "Category Breakdown:"
        echo "------------------"
        for category in "$WORKSPACE_DIR"/*; do
            if [ -d "$category" ]; then
                category_name=$(basename "$category")
                file_count=$(find "$category" -name "*.url" | wc -l)
                if [ $file_count -gt 0 ]; then
                    echo "$category_name: $file_count bookmarks"
                fi
            fi
        done
        
    } > "$report_file"
    
    log "${GREEN}📊 Report generated: $report_file${NC}"
    cat "$report_file"
}

# * Show help
show_help() {
    echo ""
    echo -e "${PURPLE}Chrome Bookmark Helper${NC}"
    echo "===================="
    echo "This tool helps you manually organize your bookmarks by providing:"
    echo ""
    echo "• Workspace overview and statistics"
    echo "• List of unorganized files"
    echo "• File previews with URLs"
    echo "• Category suggestions based on URL patterns"
    echo "• File counts by category"
    echo "• Empty directory detection"
    echo "• File validation"
    echo "• Simple organization reports"
    echo ""
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  --overview     Show workspace overview"
    echo "  --unorganized  List unorganized files"
    echo "  --preview      Preview file contents"
    echo "  --suggest      Suggest categories"
    echo "  --count        Count files by category"
    echo "  --empty        Find empty directories"
    echo "  --validate     Validate .url files"
    echo "  --report       Generate report"
    echo "  --web          Start the accessible Web UI"
    echo "  --help         Show this help"
    echo ""
    echo "Web Interface:"
    echo "• Run 'node server.js' or choose option 9 to start the web interface"
    echo "• Provides accessible keyboard navigation and screen reader support"
    echo ""
    echo "Manual Organization Tips:"
    echo "• Use your file explorer to move .url files between folders"
    echo "• Create new folders as needed for better organization"
    echo "• Use emojis in folder names for visual organization"
    echo "• Delete empty folders you don't need"
    echo "• Run this tool periodically to check your progress"
}

# * Main menu
main_menu() {
    echo ""
    echo -e "${PURPLE}🔧 Bookmark Helper${NC}"
    echo "=================="
    echo "1. Show workspace overview"
    echo "2. List unorganized files"
    echo "3. Preview file contents"
    echo "4. Suggest categories"
    echo "5. Count files by category"
    echo "6. Find empty directories"
    echo "7. Validate .url files"
    echo "8. Generate report"
    echo "9. Start Web UI"
    echo "10. Show help"
    echo "11. Exit"
    echo ""
    read -p "Choose option (1-11): " choice
    
    case $choice in
        1)
            show_overview
            main_menu
            ;;
        2)
            find_unorganized
            main_menu
            ;;
        3)
            preview_files
            main_menu
            ;;
        4)
            suggest_categories
            main_menu
            ;;
        5)
            count_by_category
            main_menu
            ;;
        6)
            find_empty_dirs
            main_menu
            ;;
        7)
            validate_files
            main_menu
            ;;
        8)
            generate_report
            main_menu
            ;;
        9)
            echo "Starting Web UI at http://localhost:3000..."
            node server.js
            exit 0
            ;;
        10)
            show_help
            main_menu
            ;;
        11)
            log "${BLUE}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            log "${RED}❌ Invalid option. Please choose 1-11.${NC}"
            main_menu
            ;;
    esac
}

# * Handle command line arguments
if [ $# -gt 0 ]; then
    case $1 in
        --web)
            echo "Starting Web UI at http://localhost:3000..."
            node server.js
            ;;
        --overview)
            show_overview
            ;;
        --unorganized)
            find_unorganized
            ;;
        --preview)
            preview_files
            ;;
        --suggest)
            suggest_categories
            ;;
        --count)
            count_by_category
            ;;
        --empty)
            find_empty_dirs
            ;;
        --validate)
            validate_files
            ;;
        --report)
            generate_report
            ;;
        --help)
            show_help
            ;;
        *)
            log "${RED}❌ Unknown option: $1${NC}"
            echo "Use --help for available options"
            exit 1
            ;;
    esac
else
    # No arguments, show main menu
    main_menu
fi
