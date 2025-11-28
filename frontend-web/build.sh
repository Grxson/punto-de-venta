#!/bin/bash
set -e

echo "🚀 Starting frontend build..."
echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building with Vite..."
npm run build

echo "✅ Build completed successfully!"
