@echo off
setlocal

set "GODOT_EXE=%LOCALAPPDATA%\Programs\Godot\Godot_v4.3-stable_win64_console.exe"
set "PROJECT_DIR=%~dp0."

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless --editor --quit
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/M9RegressionRunner.tscn
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/M10WorldAuthoringRunner.tscn
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/M10RAssetPreviewRunner.tscn
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/M11DialogueActionsRunner.tscn
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/M12FactionReputationRunner.tscn
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/SR3NarrativeHardeningRunner.tscn
exit /b %errorlevel%
