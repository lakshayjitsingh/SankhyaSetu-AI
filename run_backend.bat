@echo off
title SankhyaSetu AI - Backend Server
echo Starting MoSPI SankhyaSetu AI Flask Backend on port 8000...
cd /d "%~dp0backend"
python app.py
pause
