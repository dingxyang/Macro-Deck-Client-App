@echo off
setlocal EnableExtensions

call "%~dp0common.cmd"
cd /d "%ROOT_DIR%" || exit /b 1

npm install --legacy-peer-deps
exit /b %ERRORLEVEL%
