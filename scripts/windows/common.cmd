@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..") do set "ROOT_DIR=%%~fI"

endlocal & set "SCRIPT_DIR=%SCRIPT_DIR%" & set "ROOT_DIR=%ROOT_DIR%"
