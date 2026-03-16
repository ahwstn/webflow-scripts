#!/bin/bash
# Deploy script for Cloudflare R2 CDN
# Usage: ./deploy.sh <site> <script>     (single file)
#        ./deploy.sh <site>              (all .min.js in site folder)
#        ./deploy.sh --all               (everything)
#
# Requires: CLOUDFLARE_API_TOKEN env var or .env file
# Bucket: webflow-scripts
# Domain: cdn.ahwstn.com

set -euo pipefail

ACCOUNT_ID="155257c9b1c19f6a1fbf940d48a5e5b1"
ZONE_ID="78a768949114855fd0ef916a074cce16"
BUCKET="webflow-scripts"

# Load token from .env if not set
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ -f .env ]; then
  export CLOUDFLARE_API_TOKEN=$(grep CLOUDFLARE_API_TOKEN .env | cut -d= -f2)
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "Error: CLOUDFLARE_API_TOKEN not set. Export it or add to .env"
  exit 1
fi

export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"

upload_and_purge() {
  local file="$1"
  local key="$BUCKET/$file"
  local url="https://cdn.ahwstn.com/$file"

  # Upload
  npx wrangler r2 object put "$key" \
    --file="$file" \
    --content-type="application/javascript" \
    --cache-control="public, max-age=60, s-maxage=60" \
    --remote 2>&1 | grep -q "Upload complete" && echo "✓ Uploaded $file" || { echo "✗ Failed $file"; return 1; }

  # Purge cache
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"files\":[\"$url\"]}" | python3 -c "import sys,json; d=json.load(sys.stdin); print('  ✓ Cache purged' if d.get('success') else '  ✗ Purge failed')"
}

cd "$(dirname "$0")"

if [ "${1:-}" = "--all" ]; then
  echo "Deploying ALL scripts..."
  find . -name "*.min.js" -not -path "*/node_modules/*" | while read f; do
    upload_and_purge "${f#./}"
  done
elif [ -n "${2:-}" ]; then
  # Single file: deploy.sh ahwstn ahCss.min.js
  upload_and_purge "$1/$2"
else
  # All files in site folder: deploy.sh ahwstn
  echo "Deploying all scripts in $1/..."
  find "$1" -name "*.min.js" | while read f; do
    upload_and_purge "$f"
  done
fi

echo "Done."
