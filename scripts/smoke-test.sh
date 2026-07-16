#!/bin/bash
# Usage: bash scripts/smoke-test.sh <BACKEND_URL> <FRONTEND_URL>
#
# Both URLs are required — this deliberately does not fall back to a
# hardcoded default, since silently smoke-testing the wrong environment
# is worse than failing loudly on misconfiguration.

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: bash scripts/smoke-test.sh <BACKEND_URL> <FRONTEND_URL>" >&2
  exit 1
fi

BACKEND_URL="$1"
FRONTEND_URL="$2"
fail=0

check() {
  local label=$1
  local url=$2
  local expected=$3
  local expect_code=${4:-200}
  local max_time=${5:-15}

  # Add retries for cold-start delay
  response=$(curl -s -o /tmp/body -w "%{http_code}" --max-time "$max_time" --retry 5 --retry-delay 10 "$url")
  body=$(cat /tmp/body)

  if [ "$response" = "$expect_code" ] && echo "$body" | grep -q "$expected"; then
    echo "✅ $label"
  else
    echo "❌ $label — got: $body (HTTP $response)"
    fail=1
  fi
}

check_csrf() {
  local label=$1
  local url=$2
  
  response=$(curl -X POST -s -o /tmp/body -w "%{http_code}" --max-time 15 --retry 5 --retry-delay 10 "$url")
  body=$(cat /tmp/body)

  if [ "$response" = "403" ] || [ "$response" = "401" ]; then
    echo "✅ $label"
  else
    echo "❌ $label — got: $body (HTTP $response)"
    fail=1
  fi
}

check "/api/status"  "$BACKEND_URL/api/status"  '"status":"ok"' 200 3
check "/api/health"  "$BACKEND_URL/api/health"  '"database":"ok"'
check "Frontend Load" "$FRONTEND_URL/" "<!DOCTYPE html"
check "/api/projects (Auth)" "$BACKEND_URL/api/projects" "token" 401

check_csrf "CSRF middleware" "$BACKEND_URL/api/auth/login"

exit $fail
