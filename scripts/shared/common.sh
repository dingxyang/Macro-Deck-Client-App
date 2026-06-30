#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd_root() {
  cd "$ROOT_DIR"
}

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
}

require_env() {
  local env_name="$1"
  if [ -z "${!env_name:-}" ]; then
    echo "Missing required environment variable: $env_name" >&2
    exit 1
  fi
}

ensure_node_modules() {
  cd_root
  if [ ! -d node_modules ]; then
    npm install --legacy-peer-deps
  fi
}

ionic_build() {
  local configuration="$1"
  cd_root
  ensure_node_modules
  npx ionic build -c "$configuration"
}

cap_sync() {
  local platform="$1"
  cd_root
  npx cap sync "$platform"
}
