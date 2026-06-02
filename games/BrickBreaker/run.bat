@echo off
echo === Brick Breaker Build ===

if not exist out mkdir out

for /r src %%f in (*.java) do (
    set "SOURCES=!SOURCES! %%f"
)

javac --enable-preview --release 21 -d out src\brickbreaker\*.java
if %errorlevel% neq 0 (
    echo Compilation failed.
    exit /b 1
)
echo Compiled successfully.

echo Launching game...
java --enable-preview -cp out brickbreaker.Main
