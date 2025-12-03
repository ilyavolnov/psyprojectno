#!/bin/bash

echo "🚀 Starting Production Server..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Please edit .env file with your configuration"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set production environment
export NODE_ENV=production

# Start server
echo "✅ Starting server on port 3001..."
node backend/server.js
