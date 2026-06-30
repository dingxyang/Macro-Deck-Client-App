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

Android signed release APK and AAB:

```bash
cp scripts/local/android-signing.env.example scripts/local/android-signing.env
vim scripts/local/android-signing.env
./scripts/unix/build-android.sh
```

At minimum, set `KEYSTORE_FILE_PASSWORD` in `scripts/local/android-signing.env`. The Unix script defaults to `~/keystore/macro-deck-client-keystore.jks`, alias `macro-deck-client`, and the current Android `versionCode`/`versionName`. Override them in the same file only when needed:

```bash
BUILD_NUMBER=3001
VERSION_NUMBER=3.0.0
KEYSTORE_FILE_PATH=/path/to/keystore.jks
KEYSTORE_FILE_ALIAS=your_alias
```

```cmd
copy scripts\local\android-signing.cmd.example scripts\local\android-signing.cmd
notepad scripts\local\android-signing.cmd
scripts\windows\build-android.cmd
```

At minimum, set `KEYSTORE_FILE_PASSWORD` in `scripts\local\android-signing.cmd`. The Windows script defaults to `%USERPROFILE%\keystore\macro-deck-client-keystore.jks`, alias `macro-deck-client`, and the current Android `versionCode`/`versionName`. Override them in the same file only when needed:

```cmd
set "BUILD_NUMBER=3001"
set "VERSION_NUMBER=3.0.0"
set "KEYSTORE_FILE_PATH=C:\path\to\keystore.jks"
set "KEYSTORE_FILE_ALIAS=your_alias"
```

## GitHub Actions Android signing

The Android workflow uses the same keystore values as local release builds, but stores them in GitHub Secrets instead of `scripts/local/*`.

Create these repository secrets:

- `ANDROID_KEYSTORE_BASE64`: base64 content of the local `.jks` file
- `ANDROID_KEYSTORE_PASSWORD`: the keystore password
- `ANDROID_KEYSTORE_KEY`: the key alias, default `macro-deck-client`

On macOS, generate the keystore secret value from the local default keystore:

```bash
base64 < ~/keystore/macro-deck-client-keystore.jks | tr -d '\n' | pbcopy
```

Paste the clipboard content into `ANDROID_KEYSTORE_BASE64`.

The workflow writes the decoded keystore to the runner and passes these values to fastlane:

```bash
KEYSTORE_FILE_PATH=$GITHUB_WORKSPACE/keystore.jks
KEYSTORE_FILE_PASSWORD=${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
KEYSTORE_FILE_ALIAS=${{ secrets.ANDROID_KEYSTORE_KEY }}
```

The CI workflow now only builds Android artifacts. It does not deploy to Play Store or attach release assets.

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
