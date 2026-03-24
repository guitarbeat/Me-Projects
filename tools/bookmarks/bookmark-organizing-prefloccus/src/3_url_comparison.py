#!/usr/bin/env python3
"""
URL Comparison Script for Bookmark Files
Compares URLs between original and organized bookmark JSON files to identify:
- URLs that were removed during organization
- URLs that were added during organization
- URLs that remain the same
"""

import argparse
import json
import sys
from typing import Dict, Set

from shared import Bookmark, load_from_json


def load_and_map_bookmarks(file_path: str) -> Dict[str, Bookmark]:
    """Load bookmarks from JSON and map them by URL."""
    data = load_from_json(file_path)
    bookmarks_data = data.get("bookmarks", [])

    url_map = {}
    for bm_data in bookmarks_data:
        # Filter out any potential missing values for required fields
        if "url" in bm_data and "title" in bm_data:
            bookmark = Bookmark(**bm_data)
            if bookmark.url:
                url_map[bookmark.url] = bookmark
    return url_map


def compare_urls(
    original_urls: Dict[str, Bookmark], organized_urls: Dict[str, Bookmark]
) -> (Set[str], Set[str], Set[str]):
    """Compare URL sets and return differences."""
    original_set = set(original_urls.keys())
    organized_set = set(organized_urls.keys())

    removed = original_set - organized_set
    added = organized_set - original_set
    common = original_set & organized_set

    return removed, added, common


def generate_report(
    original_urls: Dict[str, Bookmark],
    organized_urls: Dict[str, Bookmark],
    removed: Set[str],
    added: Set[str],
    common: Set[str],
    output_file: str,
) -> Dict:
    """Generate a detailed comparison report."""
    report_data = {
        "summary": {
            "original_count": len(original_urls),
            "organized_count": len(organized_urls),
            "removed_count": len(removed),
            "added_count": len(added),
            "common_count": len(common),
        },
        "removed_urls": [],
        "added_urls": [],
        "folder_changes": [],
    }

    # Details for removed URLs
    for url in sorted(list(removed)):
        bookmark = original_urls[url]
        report_data["removed_urls"].append(
            {
                "url": url,
                "title": bookmark.title,
                "original_folder": bookmark.folder_path,
            }
        )

    # Details for added URLs
    for url in sorted(list(added)):
        bookmark = organized_urls[url]
        report_data["added_urls"].append(
            {"url": url, "title": bookmark.title, "new_folder": bookmark.folder_path}
        )

    # Check for folder path changes in common URLs
    for url in sorted(list(common)):
        original_bookmark = original_urls[url]
        organized_bookmark = organized_urls[url]

        if original_bookmark.folder_path != organized_bookmark.folder_path:
            report_data["folder_changes"].append(
                {
                    "url": url,
                    "title": original_bookmark.title,
                    "original_folder": original_bookmark.folder_path,
                    "new_folder": organized_bookmark.folder_path,
                }
            )

    # Write report to file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)

    return report_data


def print_summary(report_data: Dict):
    """Print a summary of the comparison."""
    summary = report_data["summary"]

    print("=" * 60)
    print("BOOKMARK URL COMPARISON SUMMARY")
    print("=" * 60)
    print(f"Original file URLs:    {summary['original_count']}")
    print(f"Organized file URLs:   {summary['organized_count']}")
    print(f"URLs removed:          {summary['removed_count']}")
    print(f"URLs added:            {summary['added_count']}")
    print(f"URLs preserved:        {summary['common_count']}")
    print(f"Folder changes:        {len(report_data['folder_changes'])}")
    print("=" * 60)

    if summary["removed_count"] > 0:
        print(f"\n❌ WARNING: {summary['removed_count']} URLs were REMOVED!")
    if summary["added_count"] > 0:
        print(f"\n➕ NOTE: {summary['added_count']} URLs were ADDED.")
    if len(report_data["folder_changes"]) > 0:
        count = len(report_data["folder_changes"])
        print(f"\n📁 INFO: {count} URLs had folder path changes.")

    if summary["removed_count"] == 0 and summary["added_count"] == 0:
        print("\n✅ SUCCESS: All original URLs are preserved.")


def main():
    parser = argparse.ArgumentParser(
        description="Compare URLs between two bookmark JSON files."
    )
    parser.add_argument("original_file", help="Path to the original JSON bookmark file")
    parser.add_argument(
        "organized_file", help="Path to the organized JSON bookmark file"
    )
    parser.add_argument(
        "--report",
        "-r",
        default="bookmark_url_comparison_report.json",
        help="Path to save the detailed comparison report",
    )
    args = parser.parse_args()

    try:
        print("Loading bookmark files...")
        original_urls = load_and_map_bookmarks(args.original_file)
        organized_urls = load_and_map_bookmarks(args.organized_file)

        print("Comparing URLs...")
        removed, added, common = compare_urls(original_urls, organized_urls)

        print("Generating report...")
        report_data = generate_report(
            original_urls, organized_urls, removed, added, common, args.report
        )

        print_summary(report_data)

        print(f"\nDetailed report saved to: {args.report}")

    except FileNotFoundError as e:
        print(f"Error: File not found - {e.filename}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError:
        print("Error: Invalid JSON format in one of the files.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
