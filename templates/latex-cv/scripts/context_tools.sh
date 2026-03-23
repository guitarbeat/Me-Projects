#!/usr/bin/env bash
set -euo pipefail

# Tools to extract content from the DOCX reference and validate method PDFs
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
REF_DOCX="$ROOT_DIR/reference/original.docx"
REF_PDF="$ROOT_DIR/reference/original.pdf"
OUT_DIR="$ROOT_DIR/reference"
BUILD_DIR="$ROOT_DIR/build"
TMP_DIR="$ROOT_DIR/.context-tmp"

mkdir -p -m 700 "$TMP_DIR"

extract_from_docx() {
  if [ ! -f "$REF_DOCX" ]; then
    echo "Missing $REF_DOCX" >&2; return 1
  fi
  if ! command -v pandoc >/dev/null 2>&1; then
    echo "pandoc not found" >&2; return 1
  fi

  if [ -f "$OUT_DIR/original.md" ] && [ -f "$OUT_DIR/original.txt" ] && \
     [ "$OUT_DIR/original.md" -nt "$REF_DOCX" ] && [ "$OUT_DIR/original.txt" -nt "$REF_DOCX" ]; then
    echo "Skipping DOCX extraction (up to date)"
    return 0
  fi

  echo "Extracting DOCX -> Markdown and text"
  pandoc "$REF_DOCX" -t markdown -o "$OUT_DIR/original.md"
  pandoc "$REF_DOCX" -t plain    -o "$OUT_DIR/original.txt"
}

validate_against_original() {
  if [ ! -f "$REF_PDF" ]; then
    echo "Missing $REF_PDF" >&2; return 1
  fi
  if ! command -v pdftotext >/dev/null 2>&1; then
    echo "pdftotext not found" >&2; return 1
  fi
  echo "Extracting text from method PDFs"
  mkdir -p "$TMP_DIR"

  # Original reference text (layout-preserving)
  if [ -f "$TMP_DIR/original.txt" ] && [ "$TMP_DIR/original.txt" -nt "$REF_PDF" ]; then
    echo "Skipping original PDF extraction (up to date)"
  else
    pdftotext -layout "$REF_PDF" "$TMP_DIR/original.txt"
  fi

  # LaTeX method PDF
  pdf="$BUILD_DIR/latex/CV.pdf"
  if [ -f "$pdf" ]; then
    if [ -f "$TMP_DIR/latex.txt" ] && [ "$TMP_DIR/latex.txt" -nt "$pdf" ]; then
       echo "Skipping LaTeX PDF extraction (up to date)"
    else
       pdftotext -layout "$pdf" "$TMP_DIR/latex.txt"
    fi
  fi

  echo "Computing unified diff vs original (normalized)"
  # Normalize whitespace lines for a lighter diff
  shopt -s nullglob
  for f in "$TMP_DIR"/*.txt; do
    awk '{gsub(/[ \t]+$/,"",$0); print}' "$f" > "$f.norm"
  done
  if [ -f "$TMP_DIR/latex.txt.norm" ]; then
    echo "--- Diff: latex vs original ---"
    diff -u "$TMP_DIR/original.txt.norm" "$TMP_DIR/latex.txt.norm" || true
  fi
  echo "Summarizing line counts"
  wc -l "$TMP_DIR"/*.txt 2>/dev/null || true
}

case "${1:-}" in
  extract)
    extract_from_docx
    ;;
  validate)
    validate_against_original
    ;;
  *)
    echo "Usage: $0 {extract|validate}" >&2
    exit 2
    ;;
esac
