#!/bin/bash
set -e
echo "=== Dungeon Crawler Build ==="
mkdir -p out
find src -name "*.java" | xargs javac --enable-preview --release 21 -d out
echo "Compiled successfully."
echo "Launching..."
java --enable-preview -cp out dungeon.Main
