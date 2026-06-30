@echo off
setlocal EnableExtensions

call "%~dp0common.cmd"
cd /d "%ROOT_DIR%" || exit /b 1

where fastlane >nul 2>nul
if errorlevel 1 (
  echo Missing required command: fastlane
  exit /b 1
)

if "%BUILD_NUMBER%"=="" (
  echo Missing required environment variable: BUILD_NUMBER
  exit /b 1
)
if "%VERSION_NUMBER%"=="" (
  echo Missing required environment variable: VERSION_NUMBER
  exit /b 1
)
if "%KEYSTORE_FILE_PATH%"=="" (
  echo Missing required environment variable: KEYSTORE_FILE_PATH
  exit /b 1
)
if "%KEYSTORE_FILE_PASSWORD%"=="" (
  echo Missing required environment variable: KEYSTORE_FILE_PASSWORD
  exit /b 1
)
if "%KEYSTORE_FILE_ALIAS%"=="" (
  echo Missing required environment variable: KEYSTORE_FILE_ALIAS
  exit /b 1
)

if not exist "node_modules" (
  npm install --legacy-peer-deps || exit /b 1
)

npx ionic build -c production || exit /b 1
npx cap sync android || exit /b 1

cd /d "%ROOT_DIR%\android" || exit /b 1
fastlane build || exit /b 1

echo Android release APK: %ROOT_DIR%\android\app\build\outputs\apk\release\app-release.apk
echo Android release AAB: %ROOT_DIR%\android\app\build\outputs\bundle\release\app-release.aab
exit /b 0
