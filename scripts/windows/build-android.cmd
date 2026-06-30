@echo off
setlocal EnableExtensions

call "%~dp0common.cmd"
cd /d "%ROOT_DIR%" || exit /b 1

set "ANDROID_SIGNING_CMD=%ROOT_DIR%\scripts\local\android-signing.cmd"
set "DEFAULT_KEYSTORE_FILE_PATH=%USERPROFILE%\keystore\macro-deck-client-keystore.jks"
set "DEFAULT_KEYSTORE_FILE_ALIAS=macro-deck-client"

if exist "%ANDROID_SIGNING_CMD%" (
  call "%ANDROID_SIGNING_CMD%"
)

if "%BUILD_NUMBER%"=="" (
  for /f "tokens=2" %%A in ('findstr /R /C:"^[ ]*versionCode " "%ROOT_DIR%\android\app\build.gradle"') do set "BUILD_NUMBER=%%~A"
)
if "%VERSION_NUMBER%"=="" (
  for /f "tokens=2" %%A in ('findstr /R /C:"^[ ]*versionName " "%ROOT_DIR%\android\app\build.gradle"') do set "VERSION_NUMBER=%%~A"
)
if "%KEYSTORE_FILE_PATH%"=="" set "KEYSTORE_FILE_PATH=%DEFAULT_KEYSTORE_FILE_PATH%"
if "%KEYSTORE_FILE_ALIAS%"=="" set "KEYSTORE_FILE_ALIAS=%DEFAULT_KEYSTORE_FILE_ALIAS%"

where fastlane >nul 2>nul
if errorlevel 1 (
  echo Missing required command: fastlane
  echo.
  echo Install fastlane before building Android release artifacts.
  echo.
  echo Recommended on Windows:
  echo   1. Install RubyInstaller: https://rubyinstaller.org/
  echo   2. Reopen Command Prompt
  echo   3. Run: gem install fastlane
  echo.
  echo Alternative with Chocolatey:
  echo   choco install ruby -y
  echo   gem install fastlane
  echo.
  echo Then run again:
  echo   scripts\windows\build-android.cmd
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
if "%KEYSTORE_FILE_PASSWORD%"=="" (
  echo Missing required environment variable: KEYSTORE_FILE_PASSWORD
  echo.
  echo Add the keystore password to:
  echo   %ANDROID_SIGNING_CMD%
  echo.
  echo Example:
  echo   set "KEYSTORE_FILE_PASSWORD=your_keystore_password"
  echo.
  echo Optional overrides:
  echo   set "BUILD_NUMBER=%BUILD_NUMBER%"
  echo   set "VERSION_NUMBER=%VERSION_NUMBER%"
  echo   set "KEYSTORE_FILE_PATH=%KEYSTORE_FILE_PATH%"
  echo   set "KEYSTORE_FILE_ALIAS=%KEYSTORE_FILE_ALIAS%"
  exit /b 1
)

if not exist "%KEYSTORE_FILE_PATH%" (
  echo Keystore file does not exist: %KEYSTORE_FILE_PATH%
  echo.
  echo Create a local keystore if you do not have one:
  echo   keytool -genkey -v -keystore "%DEFAULT_KEYSTORE_FILE_PATH%" -keyalg RSA -keysize 2048 -validity 10000 -alias %DEFAULT_KEYSTORE_FILE_ALIAS%
  echo.
  echo Then save the keystore password in:
  echo   %ANDROID_SIGNING_CMD%
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
