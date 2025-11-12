#!/usr/bin/env bash
set -euo pipefail

# Where your markdown lives
ARCH_MD_DIR="docs/architecture"
# Where HTML should go
ARCH_OUT_DIR="public-docs/architecture"
# Pandoc template + css
TEMPLATE="docs/templates/frontend-docs.html"
CSS_REL="../templates/frontend-docs.css"  # relative from architecture/*.html to css

mkdir -p "$ARCH_OUT_DIR"

# Copy CSS so generated HTML can reference it
mkdir -p "public-docs/templates"
cp docs/templates/frontend-docs.css public-docs/templates/

# --- Landing Page Conversion ---
if [ -f "docs/index.md" ]; then
  echo "Converting docs/index.md → public-docs/index.html"
  pandoc docs/index.md \
    --metadata title="StockEase Frontend" \
    --standalone \
    --from gfm \
    --template="$TEMPLATE" \
    --toc \
    --output public-docs/index.html
else
  echo "⚠️  docs/index.md not found — skipping landing page generation"
fi

# Convert every .md (keep folder structure depth=1)
# If you need recursive directories, replace this with a find loop and recreate structure.
for md in "$ARCH_MD_DIR"/*.md; do
  [ -e "$md" ] || continue
  base="$(basename "$md" .md)"
  pandoc "$md" \
    --metadata title="$base" \
    --standalone \
    --from gfm \
    --template="$TEMPLATE" \
    --toc \
    --output "$ARCH_OUT_DIR/$base.html"
done

# Optional: handle subfolders (patterns, components, etc.)
# Recursively convert and mirror structure:
find "$ARCH_MD_DIR" -mindepth 1 -type d | while read -r dir; do
  REL="${dir#$ARCH_MD_DIR/}"
  OUT="public-docs/architecture/$REL"
  mkdir -p "$OUT"
  find "$dir" -maxdepth 1 -name '*.md' -type f | while read -r f; do
    base="$(basename "$f" .md)"
    pandoc "$f" \
      --metadata title="$base" \
      --standalone \
      --from gfm \
      --template="$TEMPLATE" \
      --toc \
      --output "$OUT/$base.html"
  done
done
