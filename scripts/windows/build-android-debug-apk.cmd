@echo off
setlocal EnableExtensions

call "%~dp0common.cmd"
cd /d "%ROOT_DIR%" || exit /b 1

if not exist "node_modules" (
  npm install --legacy-peer-deps || exit /b 1
)

npx ionic build -c production || exit /b 1
npx cap sync android || exit /b 1

cd /d "%ROOT_DIR%\android" || exit /b 1
call gradlew.bat assembleDebug || exit /b 1

echo Android debug APK: %ROOT_DIR%\android\app\build\outputs\apk\debug\app-debug.apk
exit /b 0
