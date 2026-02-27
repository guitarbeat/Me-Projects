#!/usr/bin/env python3
"""
JSON to HTML Bookmark Converter

Converts organized JSON bookmark files back to HTML format
that can be imported into Google Chrome.
"""

import argparse
import html
import json
from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, List

from shared import Bookmark, load_from_json


class BookmarkConverter:
    def __init__(self):
        self.folder_structure = defaultdict(list)
        self.folder_hierarchy = {}

    def parse_folder_path(self, folder_path: str) -> List[str]:
        """Parse folder path into hierarchy levels."""
        if not folder_path:
            return []
        return [level.strip() for level in folder_path.split(">")]

    def build_folder_hierarchy(self, bookmarks: List[Bookmark]):
        """Build the folder hierarchy from bookmark data."""
        for bookmark in bookmarks:
            folder_path = bookmark.folder_path
            if folder_path:
                levels = self.parse_folder_path(folder_path)
                self.folder_structure[folder_path].append(bookmark)

                # Build hierarchy
                current_path = []
                for level in levels:
                    current_path.append(level)
                    path_str = " > ".join(current_path)
                    if path_str not in self.folder_hierarchy:
                        self.folder_hierarchy[path_str] = {
                            "name": level,
                            "full_path": path_str,
                            "parent": (
                                " > ".join(current_path[:-1])
                                if len(current_path) > 1
                                else None
                            ),
                            "children": [],
                            "bookmarks": [],
                        }

                # Store bookmarks in the deepest folder
                full_path = " > ".join(levels)
                if full_path in self.folder_hierarchy:
                    self.folder_hierarchy[full_path]["bookmarks"].append(bookmark)

    def get_folder_children(self, folder_path: str) -> List[str]:
        """Get immediate children of a folder."""
        children = []
        for path in self.folder_hierarchy:
            folder_info = self.folder_hierarchy[path]
            if folder_info["parent"] == folder_path:
                children.append(path)
        return sorted(children)

    def format_bookmark_html(self, bookmark: Bookmark) -> str:
        """Format a single bookmark as HTML."""
        title = html.escape(bookmark.title)
        url = html.escape(bookmark.url)

        # Build attributes
        attrs = [f'HREF="{url}"']
        if bookmark.add_date:
            attrs.append(f'ADD_DATE="{bookmark.add_date}"')
        if bookmark.icon:
            attrs.append(f'ICON="{bookmark.icon}"')

        return f'<DT><A {" ".join(attrs)}>{title}</A>'

    def format_folder_html(self, folder_path: str, level: int = 1) -> List[str]:
        """Format a folder and its contents as HTML."""
        html_lines = []

        if not folder_path:  # Root level
            children = self.get_folder_children("")
        else:
            folder_info = self.folder_hierarchy[folder_path]
            folder_name = html.escape(folder_info["name"])

            # Create folder header with attributes
            # Use current timestamp for ADD_DATE and LAST_MODIFIED if not available
            current_timestamp = str(int(datetime.now().timestamp()))
            attrs = [
                f'ADD_DATE="{current_timestamp}"',
                f'LAST_MODIFIED="{current_timestamp}"',
            ]

            # Add PERSONAL_TOOLBAR_FOLDER for top-level folders if needed
            if level == 1:
                attrs.append('PERSONAL_TOOLBAR_FOLDER="true"')

            html_lines.append(f'<DT><H3 {" ".join(attrs)}>{folder_name}</H3>')
            html_lines.append("<DL><p>")

            # Add bookmarks in this folder
            for bookmark in folder_info["bookmarks"]:
                html_lines.append("    " + self.format_bookmark_html(bookmark))

            # Get children folders
            children = self.get_folder_children(folder_path)

        # Process child folders recursively
        for child_path in children:
            child_lines = self.format_folder_html(child_path, level + 1)
            html_lines.extend(["    " + line for line in child_lines])

        if folder_path:  # Close folder if not root
            html_lines.append("</DL><p>")

        return html_lines

    def generate_html(self, data: Dict[str, Any], output_file: str):
        """Generate complete HTML bookmark file."""
        bookmark_dicts = data.get("bookmarks", [])
        bookmarks = [Bookmark(**b) for b in bookmark_dicts]
        # metadata = data.get("metadata", {})  # Unused for now

        # Build folder structure
        self.build_folder_hierarchy(bookmarks)

        # Start building HTML
        html_lines = [
            "<!DOCTYPE NETSCAPE-Bookmark-file-1>",
            "<!-- This is an automatically generated file.",
            "     It will be read and overwritten.",
            "     DO NOT EDIT! -->",
            '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
            "<TITLE>Bookmarks</TITLE>",
            "<H1>Bookmarks</H1>",
            "<DL><p>",
        ]

        # Add main bookmarks bar folder
        current_timestamp = str(int(datetime.now().timestamp()))
        html_lines.extend(
            [
                f'    <DT><H3 ADD_DATE="{current_timestamp}" '
                f'LAST_MODIFIED="{current_timestamp}" '
                'PERSONAL_TOOLBAR_FOLDER="true">Bookmarks Bar</H3>',
                "    <DL><p>",
            ]
        )

        # Get top-level folders (those without parents)
        top_level_folders = [
            path
            for path in self.folder_hierarchy
            if self.folder_hierarchy[path]["parent"] is None
        ]
        top_level_folders.sort()

        # Generate HTML for each top-level folder
        for folder_path in top_level_folders:
            folder_lines = self.format_folder_html(folder_path, level=2)
            html_lines.extend(["        " + line for line in folder_lines])

        # Close main structure
        html_lines.extend(["    </DL><p>", "</DL><p>"])

        # Write to file
        with open(output_file, "w", encoding="utf-8") as f:
            f.write("\n".join(html_lines))

        print(f"HTML bookmark file created: {output_file}")
        print(f"Total bookmarks converted: {len(bookmarks)}")
        print(f"Total folders created: {len(self.folder_hierarchy)}")


def main():
    """Main function to run the converter."""
    parser = argparse.ArgumentParser(
        description="Converts organized JSON bookmark files back to HTML format."
    )
    parser.add_argument("input_file", help="Path to the input JSON bookmark file")
    parser.add_argument("output_file", help="Path to the output HTML bookmark file")
    args = parser.parse_args()

    converter = BookmarkConverter()

    try:
        # Load JSON data
        print(f"Loading bookmarks from {args.input_file}...")
        data = load_from_json(args.input_file)

        # Generate HTML
        print("Converting to HTML format...")
        converter.generate_html(data, args.output_file)

        print("\nConversion completed successfully!")
        print(f"You can now import {args.output_file} into your browser.")

    except FileNotFoundError:
        print(f"Error: Could not find input file {args.input_file}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format in {args.input_file}")
        print(f"Details: {e}")
    except Exception as e:
        print(f"Error: An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
