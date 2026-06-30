@echo off
setlocal EnableExtensions

call "%~dp0common.cmd"
cd /d "%ROOT_DIR%" || exit /b 1

if not exist "node_modules" (
  npm install --legacy-peer-deps || exit /b 1
)

npx ionic build -c development || exit /b 1
npx cap sync android || exit /b 1
npx cap run android %*
exit /b %ERRORLEVEL%
