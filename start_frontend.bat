@echo off
set PATH=C:\tmp\node-install\node-v20.18.0-win-x64;%PATH%
cd client
start "" npx vite --host 0.0.0.0 --port 5173
