@echo off
setlocal EnableExtensions

call "%~dp0common.cmd"
cd /d "%ROOT_DIR%" || exit /b 1

if "%CONFIGURATION%"=="" set "CONFIGURATION=web_production"

if not exist "node_modules" (
  npm install --legacy-peer-deps || exit /b 1
)

npx ionic build -c %CONFIGURATION% || exit /b 1
echo Web build output: %ROOT_DIR%\www
exit /b 0
