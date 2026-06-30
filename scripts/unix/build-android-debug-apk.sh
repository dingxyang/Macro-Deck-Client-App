#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../shared/common.sh"

ionic_build production
cap_sync android

cd "$ROOT_DIR/android"
./gradlew assembleDebug

echo "Android debug APK: $ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
