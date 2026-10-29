#!/bin/bash
set -e
echo "=== Dungeon Crawler Build ==="
mkdir -p out
find src -name "*.java" | xargs javac --release 17 -d out
echo "Compiled successfully."
echo "Launching..."
java -cp out dungeon.Main
