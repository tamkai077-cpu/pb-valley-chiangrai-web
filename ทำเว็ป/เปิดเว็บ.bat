@echo off
chcp 65001 >nul
title PB Valley Chiang Rai - Web Server
cd /d "%~dp0"
echo ==========================================================
echo   กำลังเปิดเว็บไซต์ PB Valley เชียงราย ผ่าน Local Server...
echo ==========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
