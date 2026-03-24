#!/usr/bin/env python3

import argparse
import importlib.util
import sys
from pathlib import Path

# Ensure src is importable for modules that do `from shared import ...`
THIS_DIR = Path(__file__).parent
SRC_DIR = THIS_DIR / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))


def _load_module(module_path: Path, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, str(module_path))
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load module from {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)  # type: ignore
    return module


# Lazy-load underlying scripts
_EXTRACTOR_MOD = None
_CONVERTER_MOD = None
_COMPARER_MOD = None


def get_extractor_module():
    global _EXTRACTOR_MOD
    if _EXTRACTOR_MOD is None:
        _EXTRACTOR_MOD = _load_module(
            SRC_DIR / "1_bookmark_extractor.py", "bookmark_extractor"
        )
    return _EXTRACTOR_MOD


def get_converter_module():
    global _CONVERTER_MOD
    if _CONVERTER_MOD is None:
        _CONVERTER_MOD = _load_module(
            SRC_DIR / "2_json_to_html_converter.py", "json_to_html_converter"
        )
    return _CONVERTER_MOD


def get_comparer_module():
    global _COMPARER_MOD
    if _COMPARER_MOD is None:
        _COMPARER_MOD = _load_module(SRC_DIR / "3_url_comparison.py", "url_comparison")
    return _COMPARER_MOD


# -------------------------
# Subcommand implementations
# -------------------------


def cmd_extract(args: argparse.Namespace) -> int:
    extractor_mod = get_extractor_module()
    BookmarkExtractor = extractor_mod.BookmarkExtractor

    extractor = BookmarkExtractor(debug=args.debug)

    # Determine output if not set
    output_file = args.output
    if not output_file:
        input_path = Path(args.input_file)
        base_name = input_path.stem
        extension = "json" if args.format == "json" else "csv"
        output_file = f"{base_name}_extracted.{extension}"

    try:
        bookmarks = extractor.parse_bookmarks(args.input_file)
        if not bookmarks:
            print("❌ No bookmarks found or parsing failed")
            return 1

        if args.list_folders:
            extractor.print_folder_structure(bookmarks)
            return 0

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

        if args.format == "json":
            extractor.export_to_json(bookmarks, output_file, pretty=not args.compact)
        else:
            extractor.export_to_csv(bookmarks, output_file)

        print("\n🔍 Sample bookmarks:")
        for i, bookmark in enumerate(bookmarks[:3]):
            if len(bookmark.title) > 60:
                title_disp = bookmark.title[:60] + "..."
            else:
                title_disp = bookmark.title
            print(f"  {i+1}. {title_disp}")
            print(f"      URL: {bookmark.url}")
            print(f"      Folder: {bookmark.folder_path}")
            if getattr(bookmark, "add_date_formatted", None):
                print(f"      Added: {bookmark.add_date_formatted}")
            print()

        if args.stats:
            extractor.print_statistics()
        return 0
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1


def cmd_convert(args: argparse.Namespace) -> int:
    converter_mod = get_converter_module()
    BookmarkConverter = converter_mod.BookmarkConverter

    # Load JSON using shared helper
    from shared import load_from_json

    try:
        print(f"Loading bookmarks from {args.input}...")
        data = load_from_json(args.input)

        print("Converting to HTML format...")
        converter = BookmarkConverter()
        converter.generate_html(data, args.output)

        print("\nConversion completed successfully!")
        print(f"You can now import {args.output} into your browser.")
        return 0
    except FileNotFoundError:
        print(f"Error: Could not find input file {args.input}")
        return 1
    except Exception as e:
        print(f"Error: An unexpected error occurred: {e}")
        return 1


def cmd_compare(args: argparse.Namespace) -> int:
    comparer_mod = get_comparer_module()

    try:
        print("Loading bookmark files...")
        original_urls = comparer_mod.load_and_map_bookmarks(args.original)
        organized_urls = comparer_mod.load_and_map_bookmarks(args.organized)

        print("Comparing URLs...")
        removed, added, common = comparer_mod.compare_urls(
            original_urls, organized_urls
        )

        print("Generating report...")
        report_data = comparer_mod.generate_report(
            original_urls, organized_urls, removed, added, common, args.report
        )

        comparer_mod.print_summary(report_data)
        print(f"\nDetailed report saved to: {args.report}")
        return 0
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
        return 1
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return 1


def cmd_test(_: argparse.Namespace) -> int:
    extractor_mod = get_extractor_module()
    success = extractor_mod.run_tests()
    return 0 if success else 1


# -------------------------
# CLI definition
# -------------------------


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Unified bookmarks CLI: extract, convert, compare, and test",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # extract
    p_ext = subparsers.add_parser(
        "extract", help="Extract bookmarks from HTML to JSON/CSV"
    )
    p_ext.add_argument("input_file", help="Path to HTML bookmark file")
    p_ext.add_argument(
        "-o", "--output", help="Output file path (auto-detected if not specified)"
    )
    p_ext.add_argument(
        "-f", "--format", choices=["json", "csv"], default="json", help="Output format"
    )
    p_ext.add_argument(
        "--compact",
        action="store_true",
        help="Compact JSON output (no pretty printing)",
    )
    p_ext.add_argument(
        "--stats", action="store_true", help="Show detailed parsing statistics"
    )
    p_ext.add_argument(
        "--folder",
        "--folders",
        dest="folders",
        action="append",
        help="Filter to specific folder(s)",
    )
    p_ext.add_argument(
        "--list-folders", action="store_true", help="List all folders with counts"
    )
    p_ext.add_argument(
        "--case-sensitive",
        action="store_true",
        help="Use case-sensitive folder matching",
    )
    p_ext.add_argument("--debug", action="store_true", help="Enable debug logging")
    p_ext.set_defaults(func=cmd_extract)

    # convert
    p_conv = subparsers.add_parser(
        "convert", help="Convert organized JSON back to HTML"
    )
    p_conv.add_argument("input", help="Path to the input JSON bookmark file")
    p_conv.add_argument("output", help="Path to the output HTML bookmark file")
    p_conv.set_defaults(func=cmd_convert)

    # compare
    p_cmp = subparsers.add_parser("compare", help="Compare URLs between two JSON files")
    p_cmp.add_argument("original", help="Path to the original JSON bookmark file")
    p_cmp.add_argument("organized", help="Path to the organized JSON bookmark file")
    p_cmp.add_argument(
        "-r",
        "--report",
        default="bookmark_url_comparison_report.json",
        help="Path to save the detailed report",
    )
    p_cmp.set_defaults(func=cmd_compare)

    # test
    p_test = subparsers.add_parser("test", help="Run extractor unit tests")
    p_test.set_defaults(func=cmd_test)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
