#!/bin/sh
set -e

# Default API_URL if not provided
: "${API_URL:=http://localhost:5000}"

cat > /usr/share/nginx/html/env.js <<EOF
window.__env = {
  apiUrl: "${API_URL}"
};
EOF

# Execute passed command (e.g. nginx)
exec "$@"
