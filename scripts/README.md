# Local scripts

These scripts avoid the npm peer dependency conflict by installing dependencies with `--legacy-peer-deps` when `node_modules` is missing.

## Setup

```bash
./scripts/unix/bootstrap.sh
```

Windows Command Prompt:

```cmd
scripts\windows\bootstrap.cmd
```

## Run

```bash
./scripts/unix/run-web.sh
./scripts/unix/run-android.sh
./scripts/unix/run-ios.sh
```

Windows Command Prompt:

```cmd
scripts\windows\run-web.cmd
scripts\windows\run-android.cmd
```

Pass Capacitor options after the script name, for example:

```bash
./scripts/unix/run-android.sh --target Pixel_8_API_35
./scripts/unix/run-ios.sh --target "iPhone 16"
```

```cmd
scripts\windows\run-android.cmd --target Pixel_8_API_35
```

## Build

Web:

```bash
./scripts/unix/build-web.sh
```

```cmd
scripts\windows\build-web.cmd
```

Android debug APK:

```bash
./scripts/unix/build-android-debug-apk.sh
```

```cmd
scripts\windows\build-android-debug-apk.cmd
```

Android signed release APK and AAB:

```bash
export BUILD_NUMBER=3001
export VERSION_NUMBER=3.0.0
export KEYSTORE_FILE_PATH=/path/to/keystore.jks
export KEYSTORE_FILE_PASSWORD=your_password
export KEYSTORE_FILE_ALIAS=your_alias
./scripts/unix/build-android-release.sh
```

```cmd
set BUILD_NUMBER=3001
set VERSION_NUMBER=3.0.0
set KEYSTORE_FILE_PATH=C:\path\to\keystore.jks
set KEYSTORE_FILE_PASSWORD=your_password
set KEYSTORE_FILE_ALIAS=your_alias
scripts\windows\build-android-release.cmd
```

iOS IPA:

```bash
export BUILD_NUMBER=3001
export VERSION_NUMBER=3.0.0
export KEY_ID=app_store_connect_key_id
export ISSUER_ID=app_store_connect_issuer_id
export KEY_CONTENT=app_store_connect_private_key_content
export MATCH_PASSWORD=match_repo_password
./scripts/unix/build-ios-ipa.sh
```

The iOS script requires macOS, Xcode command line tools, CocoaPods, fastlane, and access to the signing certificates configured by fastlane match.

Windows includes `run-ios.cmd` and `build-ios-ipa.cmd` only as explicit unsupported-platform guards. iOS local run and IPA builds require macOS.
