#!/usr/bin/env bash
# Sync private art-studio preview into danilmakes/public/artStudio/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ART_STUDIO_SRC:-/home/dukhov/projects/art-studio}"
DEST="$ROOT/public/artStudio"

if [ ! -d "$SRC/examples" ]; then
  echo "Art studio source not found: $SRC" >&2
  exit 1
fi

echo "==> Syncing $SRC → $DEST"
rm -rf "$DEST"
mkdir -p "$DEST/design-system" "$DEST/assets"

cp "$SRC/examples/index.html" "$DEST/index.html"
cp "$SRC/examples/gallery.html" "$DEST/gallery.html"
cp "$SRC/examples/site.css" "$DEST/site.css"
cp "$SRC/examples/cms.js" "$DEST/cms.js"
cp "$SRC/design-system/base.css" "$DEST/design-system/"
cp "$SRC/design-system/tokens.css" "$DEST/design-system/"
cp -a "$SRC/assets/brand" "$SRC/assets/works" "$SRC/assets/studio" "$DEST/assets/"
# nginx (non-root) must be able to read static files
find "$DEST" -type f -exec chmod a+r {} +
find "$DEST" -type d -exec chmod a+rx {} +

python3 - "$DEST" <<'PY'
import sys
from pathlib import Path
dest = Path(sys.argv[1])
replacements = [
    ("../design-system/", "design-system/"),
    ("../assets/", "assets/"),
    ("./site.css", "site.css"),
    ("./gallery.html", "gallery.html"),
    ("./index.html", "index.html"),
    ("./cms.js", "cms.js"),
    ("../docs/questions-for-owners.md", "gallery.html"),
    ("../design-system/index.html", "index.html"),
    ('data-asset-root="../"', 'data-asset-root=""'),
]
for path in dest.glob("*.html"):
    text = path.read_text(encoding="utf-8")
    for a, b in replacements:
        text = text.replace(a, b)
    text = text.replace(
        '<a href="design-system/index.html">Дизайн-система</a>',
        '<a href="https://vk.ru/club238305506" target="_blank" rel="noopener">VK студии</a>',
    )
    # Keep danilmakes credit as-is; drop internal questionnaire if still present
    text = text.replace(
        '<a href="gallery.html">Опросник</a>',
        "",
    )
    path.write_text(text, encoding="utf-8")
print("paths rewritten")
PY

cat > "$DEST/README.md" <<'EOF'
# Private preview — Мама, я рисую

Служебная папка. На проде закрыта nginx `auth_basic`.
Не добавлять в публичное портфолио / sitemap.
EOF

echo "==> Done. Preview root: $DEST"
du -sh "$DEST"
