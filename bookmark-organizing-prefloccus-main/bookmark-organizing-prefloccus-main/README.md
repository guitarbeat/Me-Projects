# Bookmark Organizing

![Build Status](https://github.com/USERNAME/REPO/actions/workflows/ci.yml/badge.svg)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

This repository contains a small toolkit for extracting, organizing and verifying browser bookmarks. The main scripts live in the `src` directory.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development instructions.

## Unified CLI

Use the single entry point `bookmarks.py`:

```bash
# Help
python bookmarks.py -h
python bookmarks.py extract -h
python bookmarks.py convert -h
python bookmarks.py compare -h

# Extract from HTML to JSON (or CSV)
python bookmarks.py extract bookmarks_6_19_25.html -o outputs/pile_of_clothes.json

# Filter by folders and show stats
python bookmarks.py extract bookmarks_6_19_25.html --folder "Work" --folder "Personal" --stats

# List folder structure only
python bookmarks.py extract bookmarks_6_19_25.html --list-folders

# Compare URLs between original and organized JSONs
python bookmarks.py compare outputs/pile_of_clothes.json outputs/organized_pile_of_clothes.json -r outputs/report.json

# Convert organized JSON back to HTML
python bookmarks.py convert outputs/organized_pile_of_clothes.json outputs/organized_bookmarks.html

# Run extractor self-tests
python bookmarks.py test
```

## Typical workflow

1. **Export bookmarks from your browser** as an HTML file.
2. **Convert the HTML to JSON** using the extractor:
   ```bash
   python src/1_bookmark_extractor.py exported.html --output outputs/pile_of_clothes.json
   ```
3. **Improve the organization** of `outputs/pile_of_clothes.json` with an LLM or manual edits and save it as `outputs/organized_pile_of_clothes.json`.
4. **Check for URL differences**:
   ```bash
   python src/3_url_comparison.py
   ```
   Review `bookmark_url_comparison_report.json` and resolve any discrepancies.
5. **Generate a new HTML file** for import:
   ```bash
   python src/2_json_to_html_converter.py
   ```
   This writes `outputs/organized_bookmarks.html`.
6. **Import the final HTML** back into your browser (e.g. using a Chrome extension).

For detailed documentation of each script see `src/README.md`.
