#!/usr/bin/env bash
set -euo pipefail

# --- Inputs/Outputs -----------------------------------------------------------
ARCH_MD_DIR="docs/architecture"               # your markdown source
SITE_OUT_ROOT="public-docs"                   # site root for GitHub Pages
ARCH_OUT_DIR="$SITE_OUT_ROOT/architecture"    # where HTML will go
TEMPLATE="docs/templates/frontend-docs.html"  # Pandoc HTML template
CSS_OUT_DIR="$SITE_OUT_ROOT/templates"        # CSS lives here in the site
CSS_SRC="docs/templates/frontend-docs.css"

mkdir -p "$ARCH_OUT_DIR" "$CSS_OUT_DIR"

# --- Assets -------------------------------------------------------------------
# Copy CSS so generated HTML can reference it as /frontend/templates/frontend-docs.css
cp "$CSS_SRC" "$CSS_OUT_DIR/"

# --- Landing page precedence --------------------------------------------------
# If you have a dedicated HTML landing, copy it AND SKIP Markdown landing conversion.
HAS_HTML_LANDING=0
if [ -f "docs/templates/frontend-landing.html" ]; then
  echo "Using dedicated HTML landing → $SITE_OUT_ROOT/index.html"
  cp docs/templates/frontend-landing.html "$SITE_OUT_ROOT/index.html"
  HAS_HTML_LANDING=1
fi

# If no dedicated HTML landing is present, convert docs/index.md → index.html
if [ $HAS_HTML_LANDING -eq 0 ] && [ -f "docs/index.md" ]; then
  echo "Converting docs/index.md → $SITE_OUT_ROOT/index.html"
  pandoc docs/index.md \
    --metadata title="StockEase Frontend" \
    --standalone \
    --from gfm \
    --to html \
    --template "$TEMPLATE" \
    --lua-filter /tmp/md-to-html-links.lua \
    --toc \
    --output "$SITE_OUT_ROOT/index.html"
elif [ $HAS_HTML_LANDING -eq 0 ]; then
  echo "⚠️  No landing found (neither HTML nor docs/index.md)."
fi

# --- Lua filter: fix .md links & emit Mermaid divs ----------------------------
# 1) [text](file.md#id) → [text](file.html#id)
# 2) ```mermaid ...``` → <div class="mermaid">...</div>
cat > /tmp/md-to-html-links.lua << 'EOF'
function Link(el)
  if string.match(el.target, "%.md$") then
    el.target = string.gsub(el.target, "%.md$", ".html")
  elseif string.match(el.target, "%.md#") then
    el.target = string.gsub(el.target, "%.md#", ".html#")
  end
  return el
end

function CodeBlock(el)
  -- Works for: ```mermaid\n...\n```
  local hasMermaidClass = false
  for _, c in ipairs(el.classes) do
    if c == 'mermaid' then hasMermaidClass = true break end
  end
  if hasMermaidClass then
    local html = '<div class="mermaid">\n' .. el.text .. '\n</div>'
    return pandoc.RawBlock('html', html)
  end
  return el
end
EOF

# --- Convert top-level architecture/*.md --------------------------------------
echo "Converting $ARCH_MD_DIR/*.md → $ARCH_OUT_DIR/*.html"
shopt -s nullglob
for md in "$ARCH_MD_DIR"/*.md; do
  base="$(basename "$md" .md)"
  pandoc "$md" \
    --metadata title="$base" \
    --standalone \
    --from gfm \
    --to html \
    --template "$TEMPLATE" \
    --lua-filter /tmp/md-to-html-links.lua \
    --toc \
    --output "$ARCH_OUT_DIR/$base.html"
done

# --- Recursively convert subfolders (patterns, components, etc.) --------------
echo "Recursively converting subfolders under $ARCH_MD_DIR"
find "$ARCH_MD_DIR" -mindepth 1 -type d | while read -r dir; do
  rel="${dir#$ARCH_MD_DIR/}"
  out="$ARCH_OUT_DIR/$rel"
  mkdir -p "$out"
  find "$dir" -maxdepth 1 -type f -name '*.md' | while read -r f; do
    base="$(basename "$f" .md)"
    pandoc "$f" \
      --metadata title="$base" \
      --standalone \
      --from gfm \
      --to html \
      --template "$TEMPLATE" \
      --lua-filter /tmp/md-to-html-links.lua \
      --toc \
      --output "$out/$base.html"
  done
done

echo "✅ Frontend docs built at: $SITE_OUT_ROOT/"
