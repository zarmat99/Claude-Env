@echo off
REM Open the RPG skeleton project in the Godot 4 editor. Double-click to run.
REM Override the engine by setting a GODOT environment variable to your Godot 4 exe.
if "%GODOT%"=="" set "GODOT=%LOCALAPPDATA%\Programs\Godot\Godot_v4.3-stable_win64.exe"
if not exist "%GODOT%" echo Godot not found at "%GODOT%". Set the GODOT env var to your Godot 4 exe or edit this file. && pause && exit /b 1
pushd "%~dp0"
start "" "%GODOT%" --path "%CD%" -e
popd
