@echo off
chcp 65001 >nul
title PB Valley Chiang Rai - Web Server
cd /d "%~dp0"
echo ==========================================================
echo   กำลังเปิดเว็บไซต์ PB Valley เชียงราย ผ่าน Local Server...
echo   (เพื่อแก้ปัญหา YouTube Error 153 ให้เล่นได้ปกติ 100%%)
echo ==========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
