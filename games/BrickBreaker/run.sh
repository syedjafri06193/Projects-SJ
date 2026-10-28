#!/bin/bash
# Build & Run Brick Breaker
# Requires Java 17+ (switch expressions; no preview features)

set -e

echo "=== Brick Breaker Build ==="

# Compile
mkdir -p out
find src -name "*.java" | xargs javac --release 17 -d out
echo "Compiled successfully."

# Run
echo "Launching game..."
java -cp out brickbreaker.Main
