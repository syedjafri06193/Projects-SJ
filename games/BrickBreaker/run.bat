@echo off
echo === Brick Breaker Build ===

if not exist out mkdir out

rem Requires Java 17+ (switch expressions; no preview features).
javac --release 17 -d out src\brickbreaker\*.java
if %errorlevel% neq 0 (
    echo Compilation failed.
    exit /b 1
)
echo Compiled successfully.

echo Launching game...
java -cp out brickbreaker.Main
