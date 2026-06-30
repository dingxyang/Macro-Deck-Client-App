#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../shared/common.sh"

require_command fastlane
require_env BUILD_NUMBER
require_env VERSION_NUMBER
require_env KEYSTORE_FILE_PATH
require_env KEYSTORE_FILE_PASSWORD
require_env KEYSTORE_FILE_ALIAS

ionic_build production
cap_sync android

cd "$ROOT_DIR/android"
fastlane build

echo "Android release APK: $ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk"
echo "Android release AAB: $ROOT_DIR/android/app/build/outputs/bundle/release/app-release.aab"
