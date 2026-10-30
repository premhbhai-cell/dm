@echo off
cd /d "%~dp0"
node make-images-list.js --watch
pause
