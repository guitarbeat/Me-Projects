#!/usr/bin/env python3
"""
Bookmark Extractor - Advanced HTML bookmark parser with comprehensive folder
hierarchy support

This script extracts bookmarks from HTML bookmark files (like those exported from
browsers) and converts them to structured JSON format with full folder path
information.

Features:
- Accurate folder hierarchy parsing for nested bookmark structures
- Comprehensive bookmark metadata extraction (title, URL, dates, icons)
- Multiple output formats (JSON, CSV)
- Performance optimizations for large bookmark files
- Robust error handling and validation
- Detailed logging and statistics
"""

import argparse
import csv
import html
import logging
import re
from pathlib import Path
from typing import Any, Dict, List

from shared import Bookmark, export_to_json


class BookmarkExtractor:
    """Advanced bookmark extractor with optimized folder hierarchy parsing."""

    def __init__(self, debug: bool = False):
        self.debug = debug
        self.logger = self._setup_logging()
        self.stats = {
            "total_bookmarks": 0,
            "folders_found": 0,
            "parsing_errors": 0,
            "hierarchy_errors": 0,
            "filtered_bookmarks": 0,
        }

    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration."""
        logger = logging.getLogger("bookmark_extractor")
        logger.setLevel(logging.DEBUG if self.debug else logging.INFO)

        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    def parse_folder_hierarchy(self, content: str, bookmark_position: int) -> str:
        """
        Parse folder hierarchy using an optimized algorithm.

        This improved version:
        1. Uses more efficient regex patterns
        2. Handles edge cases better
        3. Provides better error recovery
        4. Tracks folder depth more accurately
        """
        try:
            # Get content before bookmark position
            preceding_content = content[:bookmark_position]

            # Find all relevant tags in order of appearance
            tag_pattern = r"<(/?)(DL|H3)\b[^>]*>(?:([^<]*)</H3>)?"
            matches = list(re.finditer(tag_pattern, preceding_content, re.IGNORECASE))

            folder_stack = []
            depth = 0

            for match in matches:
                closing_tag = bool(match.group(1))  # True if closing tag
                tag_name = match.group(2).upper()
                folder_text = match.group(3)

                if tag_name == "DL":
                    if closing_tag:
                        # Closing DL - pop folder if we have any
                        if folder_stack and depth > 0:
                            folder_stack.pop()
                            depth -= 1
                    else:
                        # Opening DL - increase depth
                        depth += 1

                elif tag_name == "H3" and not closing_tag and folder_text:
                    # H3 with folder name - clean and add to stack
                    folder_name = html.unescape(folder_text).strip()
                    folder_name = re.sub(r"\s+", " ", folder_name)

                    if folder_name:
                        # Adjust stack to current depth
                        while len(folder_stack) >= depth:
                            folder_stack.pop()

                        folder_stack.append(folder_name)
                        self.stats["folders_found"] += 1

            # Return the complete path
            if folder_stack:
                return " > ".join(folder_stack)
            else:
                return "Root"

        except Exception as e:
            self.logger.warning(f"Error parsing folder hierarchy: {e}")
            self.stats["hierarchy_errors"] += 1
            return "Unknown"

    def extract_bookmark_metadata(self, tag_content: str) -> Dict[str, Any]:
        """Extract all metadata from a bookmark tag."""
        metadata = {}

        # Extract ADD_DATE
        add_date_match = re.search(
            r'ADD_DATE\s*=\s*["\'](\d+)["\']', tag_content, re.IGNORECASE
        )
        if add_date_match:
            try:
                metadata["add_date"] = int(add_date_match.group(1))
            except ValueError:
                pass

        # Extract LAST_MODIFIED
        last_mod_match = re.search(
            r'LAST_MODIFIED\s*=\s*["\'](\d+)["\']', tag_content, re.IGNORECASE
        )
        if last_mod_match:
            try:
                metadata["last_modified"] = int(last_mod_match.group(1))
            except ValueError:
                pass

        # Extract ICON
        icon_match = re.search(
            r'ICON\s*=\s*["\']([^"\']*)["\']', tag_content, re.IGNORECASE
        )
        if icon_match:
            metadata["icon"] = icon_match.group(1)

        # Check for personal toolbar
        metadata["personal_toolbar"] = bool(
            re.search(
                r'PERSONAL_TOOLBAR_FOLDER\s*=\s*["\']true["\']',
                tag_content,
                re.IGNORECASE,
            )
        )

        return metadata

    def parse_bookmarks(self, file_path: str) -> List[Bookmark]:
        """Parse bookmarks from HTML file with comprehensive error handling."""
        try:
            file_path = Path(file_path)
            if not file_path.exists():
                raise FileNotFoundError(f"Bookmark file not found: {file_path}")

            self.logger.info(f"Reading bookmark file: {file_path}")

            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()

            if not content.strip():
                raise ValueError("Bookmark file is empty")

        except Exception as e:
            self.logger.error(f"Error reading file {file_path}: {e}")
            return []

        bookmarks = []

        # Enhanced regex pattern for bookmark extraction
        href_pattern = r'<A\s+[^>]*?HREF\s*=\s*["\']([^"\']+)["\'][^>]*?>(.*?)</A>'

        try:
            matches = list(
                re.finditer(href_pattern, content, re.IGNORECASE | re.DOTALL)
            )
            self.logger.info(f"Found {len(matches)} potential bookmarks")

            for i, match in enumerate(matches):
                try:
                    # Extract basic URL and title
                    url = html.unescape(match.group(1)).strip()
                    title_raw = match.group(2).strip()

                    # Skip if URL or title is empty
                    if not url or not title_raw:
                        continue

                    # Clean up title
                    title = re.sub(r"\s+", " ", title_raw)
                    title = html.unescape(title)

                    # Extract metadata
                    tag_content = match.group(0)
                    metadata = self.extract_bookmark_metadata(tag_content)

                    # Build folder hierarchy
                    folder_path = self.parse_folder_hierarchy(content, match.start())

                    # Create bookmark object
                    bookmark = Bookmark(
                        title=title,
                        url=url,
                        folder_path=folder_path,
                        add_date=metadata.get("add_date"),
                        last_modified=metadata.get("last_modified"),
                        icon=metadata.get("icon"),
                        personal_toolbar=metadata.get("personal_toolbar", False),
                    )

                    bookmarks.append(bookmark)
                    self.stats["total_bookmarks"] += 1

                    if self.debug and i < 5:
                        self.logger.debug(
                            f"Parsed bookmark: {title[:50]}... in {folder_path}"
                        )

                except Exception as e:
                    self.logger.warning(f"Error processing bookmark {i+1}: {e}")
                    self.stats["parsing_errors"] += 1
                    continue

        except Exception as e:
            self.logger.error(f"Fatal error during bookmark parsing: {e}")
            return []

        self.logger.info(f"Successfully parsed {len(bookmarks)} bookmarks")
        return bookmarks

    def filter_bookmarks(
        self,
        bookmarks: List[Bookmark],
        folder_patterns: List[str],
        case_sensitive: bool = False,
    ) -> List[Bookmark]:
        """
        Filter bookmarks to include only those in specified folders and their
        subfolders.

        Args:
            bookmarks: List of bookmarks to filter
            folder_patterns: List of folder patterns to match
                (supports partial matching)
            case_sensitive: Whether matching should be case sensitive

        Returns:
            Filtered list of bookmarks
        """
        if not folder_patterns:
            return bookmarks

        filtered = []

        for bookmark in bookmarks:
            folder_path = (
                bookmark.folder_path if case_sensitive else bookmark.folder_path.lower()
            )

            # Check if bookmark matches any of the folder patterns
            for pattern in folder_patterns:
                pattern_to_match = pattern if case_sensitive else pattern.lower()

                # Support both exact folder matching and "starts with" matching
                if (
                    folder_path == pattern_to_match
                    or folder_path.startswith(pattern_to_match + " >")
                    or pattern_to_match in folder_path.split(" > ")
                ):
                    filtered.append(bookmark)
                    break

        self.stats["filtered_bookmarks"] = len(filtered)
        self.logger.info(
            f"Filtered to {len(filtered)} bookmarks matching folder patterns"
        )

        return filtered

    def list_folder_structure(self, bookmarks: List[Bookmark]) -> Dict[str, int]:
        """
        Analyze bookmarks to show folder structure and bookmark counts.

        Returns:
            Dictionary mapping folder paths to bookmark counts
        """
        folder_counts = {}

        for bookmark in bookmarks:
            folder_path = bookmark.folder_path

            # Count bookmark in this specific folder
            if folder_path in folder_counts:
                folder_counts[folder_path] += 1
            else:
                folder_counts[folder_path] = 1

            # Also count in parent folders for hierarchy view
            parts = folder_path.split(" > ")
            for i in range(1, len(parts)):
                parent_path = " > ".join(parts[:i])
                if parent_path not in folder_counts:
                    folder_counts[parent_path] = 0

        return dict(sorted(folder_counts.items()))

    def print_folder_structure(
        self, bookmarks: List[Bookmark], max_folders: int = 50
    ) -> None:
        """Print the folder structure with bookmark counts."""
        folder_counts = self.list_folder_structure(bookmarks)

        print(f"\n📁 Folder Structure (showing up to {max_folders} folders):")
        print("   Format: folder_path (bookmark_count)")
        print("   " + "=" * 60)

        count = 0
        for folder_path, bookmark_count in folder_counts.items():
            if count >= max_folders:
                remaining = len(folder_counts) - max_folders
                print(f"   ... and {remaining} more folders")
                break

            # Calculate indentation based on folder depth
            depth = len(folder_path.split(" > ")) - 1 if folder_path != "Root" else 0
            indent = "  " * depth

            # Truncate long folder names
            display_name = (
                folder_path.split(" > ")[-1] if " > " in folder_path else folder_path
            )
            if len(display_name) > 40:
                display_name = display_name[:37] + "..."

            print(f"   {indent}{display_name} ({bookmark_count})")
            count += 1

    def export_to_json(
        self, bookmarks: List[Bookmark], output_file: str, pretty: bool = True
    ) -> None:
        """Export bookmarks to JSON format using the shared utility."""
        metadata = {"extractor_version": "2.0", "statistics": self.stats}
        try:
            # Note: The print statement for success is now in the shared function
            export_to_json(bookmarks, output_file, pretty, metadata)
        except Exception as e:
            self.logger.error(f"Error exporting to JSON: {e}")
            raise

    def export_to_csv(self, bookmarks: List[Bookmark], output_file: str) -> None:
        """Export bookmarks to CSV format."""
        try:
            with open(output_file, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)

                # Write header
                writer.writerow(
                    [
                        "title",
                        "url",
                        "folder_path",
                        "add_date",
                        "add_date_formatted",
                        "last_modified",
                        "last_modified_formatted",
                        "icon",
                        "personal_toolbar",
                    ]
                )

                # Write data
                for bookmark in bookmarks:
                    writer.writerow(
                        [
                            bookmark.title,
                            bookmark.url,
                            bookmark.folder_path,
                            bookmark.add_date,
                            bookmark.add_date_formatted,
                            bookmark.last_modified,
                            bookmark.last_modified_formatted,
                            bookmark.icon,
                            bookmark.personal_toolbar,
                        ]
                    )

            self.logger.info(f"📊 Exported {len(bookmarks)} bookmarks to {output_file}")

        except Exception as e:
            self.logger.error(f"Error exporting to CSV: {e}")
            raise

    def print_statistics(self) -> None:
        """Print parsing statistics."""
        print("\n📈 Parsing Statistics:")
        print(f"  Total bookmarks: {self.stats['total_bookmarks']}")
        print(f"  Folders found: {self.stats['folders_found']}")
        print(f"  Parsing errors: {self.stats['parsing_errors']}")
        print(f"  Hierarchy errors: {self.stats['hierarchy_errors']}")

        if self.stats["filtered_bookmarks"] > 0:
            print(f"  Filtered bookmarks: {self.stats['filtered_bookmarks']}")

        if self.stats["total_bookmarks"] > 0:
            error_rate = (
                self.stats["parsing_errors"]
                / (self.stats["total_bookmarks"] + self.stats["parsing_errors"])
            ) * 100
            print(f"  Error rate: {error_rate:.2f}%")


def run_tests() -> bool:
    """Run comprehensive tests for the bookmark extractor."""
    print("🧪 Running bookmark extractor tests...")

    extractor = BookmarkExtractor(debug=True)

    # Test case 1: Deep nested structure
    test_html1 = """
<DL><p>
    <DT><H3 ADD_DATE="1234567890" PERSONAL_TOOLBAR_FOLDER="true">Bookmarks Bar</H3>
    <DL><p>
        <DT><H3>Work</H3>
        <DL><p>
            <DT><H3>Projects</H3>
            <DL><p>
                <DT><H3>Current</H3>
                <DL><p>
                    <DT><A HREF="https://example.com" ADD_DATE="1234567890"
                        ICON="data:image/png;base64,test">Project Link</A>
                </DL><p>
            </DL><p>
        </DL><p>
    </DL><p>
</DL><p>
"""

    # Test case 2: Sibling folders with complex structure
    test_html2 = """
    <DL><p>
        <DT><H3>Personal</H3>
        <DL><p>
            <DT><A HREF="https://personal1.com">Personal Link 1</A>
            <DT><A HREF="https://personal2.com">Personal Link 2</A>
        </DL><p>
        <DT><H3>Work</H3>
        <DL><p>
            <DT><A HREF="https://work1.com">Work Link 1</A>
        </DL><p>
    </DL><p>
    """

    # Test deep nesting
    link_pos1 = test_html1.find('<A HREF="https://example.com"')
    folder_path1 = extractor.parse_folder_hierarchy(test_html1, link_pos1)
    expected1 = "Bookmarks Bar > Work > Projects > Current"
    test1_pass = folder_path1 == expected1

    print("Test 1 - Deep nested folders:")
    print(f"  Result: {folder_path1}")
    print(f"  Expected: {expected1}")
    print(f"  Status: {'✅ PASS' if test1_pass else '❌ FAIL'}")

    # Test sibling folders
    link_pos2a = test_html2.find('<A HREF="https://personal1.com"')
    folder_path2a = extractor.parse_folder_hierarchy(test_html2, link_pos2a)

    link_pos2b = test_html2.find('<A HREF="https://work1.com"')
    folder_path2b = extractor.parse_folder_hierarchy(test_html2, link_pos2b)

    test2a_pass = folder_path2a == "Personal"
    test2b_pass = folder_path2b == "Work"

    print("\nTest 2 - Sibling folders:")
    print(f"  Personal Link Result: {folder_path2a}")
    print(f"  Work Link Result: {folder_path2b}")
    print(f"  Status: {'✅ PASS' if test2a_pass and test2b_pass else '❌ FAIL'}")

    # Test folder filtering
    test_bookmarks = [
        Bookmark("Link1", "https://example1.com", "Bookmarks Bar > Work > Projects"),
        Bookmark("Link2", "https://example2.com", "Bookmarks Bar > Work > Archives"),
        Bookmark("Link3", "https://example3.com", "Bookmarks Bar > Personal > Photos"),
        Bookmark("Link4", "https://example4.com", "Personal > Travel"),
        Bookmark("Link5", "https://example5.com", "Root"),
    ]

    # Test filtering by top-level folder
    work_filtered = extractor.filter_bookmarks(test_bookmarks, ["Work"])
    # Should get both Work subfolder items
    test3a_pass = len(work_filtered) == 2

    # Test filtering by exact path
    projects_filtered = extractor.filter_bookmarks(
        test_bookmarks, ["Bookmarks Bar > Work > Projects"]
    )
    test3b_pass = len(projects_filtered) == 1  # Should get only Projects item

    # Test multiple folder patterns
    multi_filtered = extractor.filter_bookmarks(test_bookmarks, ["Work", "Personal"])
    test3c_pass = len(multi_filtered) == 4  # Should get Work + Personal items

    print("\nTest 3 - Folder filtering:")
    print(f"  Work folder filter: {len(work_filtered)} items (expected: 2)")
    print(f"  Exact path filter: {len(projects_filtered)} items (expected: 1)")
    print(f"  Multiple patterns: {len(multi_filtered)} items (expected: 4)")
    test3_pass = test3a_pass and test3b_pass and test3c_pass
    print(f"  Status: {'✅ PASS' if test3_pass else '❌ FAIL'}")

    all_tests_pass = test1_pass and test2a_pass and test2b_pass and test3_pass

    if all_tests_pass:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Some tests failed!")

    return all_tests_pass


def main():
    """Main function with enhanced argument parsing."""
    parser = argparse.ArgumentParser(
        description="Bookmark Extractor - Advanced HTML bookmark parser",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s bookmarks.html                    # Extract all bookmarks to JSON
  %(prog)s bookmarks.html --format csv       # Extract to CSV
  %(prog)s bookmarks.html --list-folders     # List folder structure
  %(prog)s bookmarks.html --folder "Work"    # Extract only Work folder
  %(prog)s bookmarks.html --folder "Work" --folder "Personal"  # Multiple folders
  %(prog)s bookmarks.html --folder "Bookmarks Bar > Work"      # Specific path
  %(prog)s --test                           # Run tests
  %(prog)s bookmarks.html --debug           # Debug mode
        """,
    )

    parser.add_argument("input_file", nargs="?", help="Path to HTML bookmark file")
    parser.add_argument(
        "--output",
        "-o",
        help="Output file path (auto-detected from format if not specified)",
    )
    parser.add_argument(
        "--format",
        "-f",
        choices=["json", "csv"],
        default="json",
        help="Output format (default: json)",
    )
    parser.add_argument("--test", action="store_true", help="Run comprehensive tests")
    parser.add_argument("--debug", action="store_true", help="Enable debug logging")
    parser.add_argument(
        "--compact",
        action="store_true",
        help="Compact JSON output (no pretty printing)",
    )
    parser.add_argument(
        "--stats", action="store_true", help="Show detailed parsing statistics"
    )
    parser.add_argument(
        "--folder",
        "--folders",
        dest="folders",
        action="append",
        help=(
            "Filter to specific folder(s) and their subfolders "
            "(can be used multiple times)"
        ),
    )
    parser.add_argument(
        "--list-folders",
        action="store_true",
        help="List all folders in the bookmark file with counts",
    )
    parser.add_argument(
        "--case-sensitive",
        action="store_true",
        help="Use case-sensitive folder matching",
    )

    args = parser.parse_args()

    # Run tests if requested
    if args.test:
        success = run_tests()
        return 0 if success else 1

    # Validate input file
    if not args.input_file:
        parser.error("input_file is required when not using --test")

    # Setup output file
    if not args.output:
        input_path = Path(args.input_file)
        base_name = input_path.stem
        extension = "json" if args.format == "json" else "csv"
        args.output = f"{base_name}_extracted.{extension}"

    # Create extractor and process bookmarks
    extractor = BookmarkExtractor(debug=args.debug)

    try:
        bookmarks = extractor.parse_bookmarks(args.input_file)

        if not bookmarks:
            print("❌ No bookmarks found or parsing failed")
            return 1

        # List folders if requested
        if args.list_folders:
            extractor.print_folder_structure(bookmarks)
            return 0

        # Apply folder filtering if specified
        if args.folders:
            original_count = len(bookmarks)
            bookmarks = extractor.filter_bookmarks(
                bookmarks, args.folders, args.case_sensitive
            )

            if not bookmarks:
                print(f"❌ No bookmarks found matching folder patterns: {args.folders}")
                print("💡 Use --list-folders to see available folders")
                return 1

            print(f"🔍 Filtered from {original_count} to {len(bookmarks)} bookmarks")
            print(f"📁 Folder patterns: {', '.join(args.folders)}")

        # Export in requested format
        if args.format == "json":
            extractor.export_to_json(bookmarks, args.output, pretty=not args.compact)
        else:
            extractor.export_to_csv(bookmarks, args.output)

        # Show sample bookmarks
        sample_label = (
            "🔍 Sample filtered bookmarks:"
            if args.folders
            else "🔍 Sample bookmarks extracted:"
        )
        print(f"\n{sample_label}")
        for i, bookmark in enumerate(bookmarks[:3]):
            if len(bookmark.title) > 60:
                title_disp = bookmark.title[:60] + "..."
            else:
                title_disp = bookmark.title
            print(f"  {i+1}. {title_disp}")
            print(f"      URL: {bookmark.url}")
            print(f"      Folder: {bookmark.folder_path}")
            if bookmark.add_date_formatted:
                print(f"      Added: {bookmark.add_date_formatted}")
            print()

        # Show statistics if requested
        if args.stats:
            extractor.print_statistics()

        return 0

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
