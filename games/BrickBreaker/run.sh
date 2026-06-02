#!/bin/bash
# Build & Run Brick Breaker
# Requires Java 17+ (uses switch expressions, sealed classes)

set -e

echo "=== Brick Breaker Build ==="

# Compile
mkdir -p out
find src -name "*.java" | xargs javac --enable-preview --release 21 -d out
echo "Compiled successfully."

# Run
echo "Launching game..."
java --enable-preview -cp out brickbreaker.Main
