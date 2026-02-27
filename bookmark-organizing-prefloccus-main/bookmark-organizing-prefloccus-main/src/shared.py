import json
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class Bookmark:
    """Comprehensive bookmark representation with metadata."""

    title: str
    url: str
    folder_path: str = ""
    add_date: Optional[int] = None
    last_modified: Optional[int] = None
    icon: Optional[str] = None
    personal_toolbar: bool = False
    folder_id: Optional[str] = None

    @property
    def add_date_formatted(self) -> Optional[str]:
        """Return formatted add date if available."""
        if self.add_date:
            try:
                return datetime.fromtimestamp(self.add_date).isoformat()
            except (ValueError, OSError):
                return None
        return None

    @property
    def last_modified_formatted(self) -> Optional[str]:
        """Return formatted last modified date if available."""
        if self.last_modified:
            try:
                return datetime.fromtimestamp(self.last_modified).isoformat()
            except (ValueError, OSError):
                return None
        return None


def load_from_json(file_path: str) -> Dict[str, Any]:
    """Load bookmarks from a JSON file."""
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def export_to_json(
    bookmarks: List[Bookmark],
    output_file: str,
    pretty: bool = True,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """Export bookmarks to JSON format."""
    if metadata is None:
        metadata = {}

    # Default metadata if not provided
    default_metadata = {
        "total_bookmarks": len(bookmarks),
        "extracted_at": datetime.now().isoformat(),
    }
    # Merge provided metadata with defaults
    merged_metadata = {**default_metadata, **metadata}

    data = {
        "metadata": merged_metadata,
        "bookmarks": [asdict(bookmark) for bookmark in bookmarks],
    }

    try:
        with open(output_file, "w", encoding="utf-8") as f:
            if pretty:
                json.dump(data, f, indent=2, ensure_ascii=False, sort_keys=True)
            else:
                json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

        print(f"📊 Exported {len(bookmarks)} bookmarks to {output_file}")

    except Exception as e:
        print(f"Error exporting to JSON: {e}")
        raise
