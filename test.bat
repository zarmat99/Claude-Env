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
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/M13EconomyEquipmentRunner.tscn
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/M14CombatSkillsMagicRunner.tscn
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/M15DungeonEncounterRunner.tscn
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/SR4SystemsStressRunner.tscn
if errorlevel 1 exit /b %errorlevel%

"%GODOT_EXE%" --path "%PROJECT_DIR%" --headless res://tests/headless/M16PersistenceUXRunner.tscn
exit /b %errorlevel%
