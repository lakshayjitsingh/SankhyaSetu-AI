@echo off
title SankhyaSetu AI - One-Click Launcher
echo Launching SankhyaSetu AI Backend and Frontend...
start "MoSPI Backend" cmd /k "cd /d %~dp0backend && python app.py"
timeout /t 2 >nul
start "MoSPI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Both servers started!
echo Opening web browser at http://localhost:5173...
timeout /t 3 >nul
start http://localhost:5173
