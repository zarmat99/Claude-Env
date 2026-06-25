@echo off
setlocal

set "GODOT_EXE=%LOCALAPPDATA%\Programs\Godot\Godot_v4.3-stable_win64_console.exe"
set "PROJECT_DIR=%~dp0."

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless --editor --quit
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/M9RegressionRunner.tscn
exit /b %errorlevel%
